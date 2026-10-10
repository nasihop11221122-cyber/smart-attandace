import mongoose from 'mongoose';
import AttendanceRequest from '../models/AttendanceRequest.js';
import Course from '../models/Course.js';
import Holiday from '../models/Holiday.js';
import User from '../models/User.js';
import { runsOnDate } from '../utils/courseTime.js';
import { dateInSchoolZone } from '../utils/schoolDate.js';

const STATUS_FOR = { present: 'accepted', absent: 'rejected' };
const LABEL_FOR = { accepted: 'Present', rejected: 'Absent' };

const cleanReason = (v) => (typeof v === 'string' ? v.trim() : '');

// Fields saved when an admin decides by hand
const adminDecision = (req, status, reason) => ({
  status,
  decidedBy: req.user._id,
  decidedAt: new Date(),
  markedByAdmin: true,
  adminNote: cleanReason(reason) || undefined,
});

/* PATCH /api/admin/history/:id  -  change the status of a saved record */
export const changeRecordStatus = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Record not found' });

  const status = STATUS_FOR[req.body.status];
  const record = await AttendanceRequest.findById(id);
  if (!record) return res.status(404).json({ message: 'Record not found' });

  if (record.status === status) {
    return res.status(409).json({ message: `This record is already marked ${LABEL_FOR[status]}` });
  }

  // The status is checked again in the query, so two admins cannot overwrite each other
  const updated = await AttendanceRequest.findOneAndUpdate(
    { _id: id, status: record.status },
    adminDecision(req, status, req.body.reason),
    { new: true }
  );
  if (!updated) {
    return res.status(409).json({ message: 'This record was just changed. Please refresh the page' });
  }

  res.json({ message: `Marked ${LABEL_FOR[status]}` });
};

/* POST /api/admin/students/:id/attendance  -  mark a student present for a course on a date */
export const markStudentPresent = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Student not found' });

  const student = await User.findOne({ _id: id, role: 'student' }).select(
    'name classId className semester createdAt'
  );
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const { courseId, date, reason } = req.body;

  const course = await Course.findById(courseId);
  if (!course || !student.classId || String(course.classId) !== String(student.classId)) {
    return res.status(400).json({ message: "This course is not in the student's class" });
  }

  if (date > dateInSchoolZone()) {
    return res.status(400).json({ message: 'You cannot mark a date in the future' });
  }
  if (date < dateInSchoolZone(student.createdAt)) {
    return res.status(400).json({ message: 'This date is before the student joined' });
  }
  if (!runsOnDate(course, date)) {
    return res.status(400).json({ message: 'This course is not held on this date' });
  }
  if (await Holiday.exists({ date })) {
    return res.status(400).json({ message: 'This date is a holiday' });
  }

  const existing = await AttendanceRequest.findOne({ student: student._id, courseId: course._id, date });
  if (existing?.status === 'accepted') {
    return res.status(409).json({ message: 'This date is already marked Present' });
  }

  try {
    if (existing) {
      // A rejected or pending record of that day becomes Present
      const updated = await AttendanceRequest.findOneAndUpdate(
        { _id: existing._id, status: existing.status },
        adminDecision(req, 'accepted', reason)
      );
      if (!updated) {
        return res.status(409).json({ message: 'This date was just changed. Please refresh the page' });
      }
    } else {
      await AttendanceRequest.create({
        student: student._id,
        className: student.className,
        semester: student.semester || undefined,
        courseId: course._id,
        courseName: course.name,
        date,
        ...adminDecision(req, 'accepted', reason),
      });
    }
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'This date was just changed. Please refresh the page' });
    }
    throw err;
  }

  res.status(201).json({ message: 'Marked Present' });
};