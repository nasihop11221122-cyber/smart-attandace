import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import AttendanceRequest from '../models/AttendanceRequest.js';
import Course from '../models/Course.js';
import Holiday from '../models/Holiday.js';
import ProgramClass, { classLabel } from '../models/ProgramClass.js';
import User from '../models/User.js';
import { toHHMM } from '../utils/courseTime.js';
import { buildCourseReport } from '../utils/attendanceReport.js';
import { dateInSchoolZone, minutesInSchoolZone } from '../utils/schoolDate.js';

const EMAIL_TAKEN = 'This email is already registered';
const ROLL_TAKEN = 'This roll number is already taken in this class';
const BAD_CLASS = 'The selected class does not exist';

const toPublic = (u, cls) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  rollNo: u.rollNo,
  classId: cls ? String(cls._id) : '',
  className: u.className,
  program: cls?.program || '',
  semester: cls?.semester || '',
  role: u.role,
  createdAt: u.createdAt,
});

const duplicateMessage = (err) => (err.keyPattern?.rollNo ? ROLL_TAKEN : EMAIL_TAKEN);

export const getOnlineStudents = async (req, res) => {
  const filter = { role: 'student' };
  const { classId } = req.query;

  if (typeof classId === 'string' && classId) {
    if (!mongoose.isValidObjectId(classId)) return res.json({ students: [] });
    filter.classId = classId;
  }

  const students = await User.find(filter)
    .sort({ createdAt: -1 })
    .populate('classId', 'program semester');

  res.json({
    students: students.map((s) => toPublic(s, s.classId?.program ? s.classId : null)),
  });
};

export const createOnlineStudent = async (req, res) => {
  const { name, rollNo, classId, email, password } = req.body;

  const cls = await ProgramClass.findById(classId);
  if (!cls) return res.status(400).json({ message: BAD_CLASS });

  const emailTaken = await User.findOne({ email });
  if (emailTaken) return res.status(409).json({ message: EMAIL_TAKEN });

  const rollTaken = await User.findOne({ role: 'student', classId: cls._id, rollNo });
  if (rollTaken) return res.status(409).json({ message: ROLL_TAKEN });

  const hashed = await bcrypt.hash(password, 12);
  try {
    const student = await User.create({
      name,
      email,
      password: hashed,
      role: 'student',
      classId: cls._id,
      className: classLabel(cls),
      rollNo,
    });
    res.status(201).json({ student: toPublic(student, cls) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: duplicateMessage(err) });
    throw err;
  }
};

export const updateOnlineStudent = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Student not found' });

  const student = await User.findOne({ _id: id, role: 'student' }).select('+password');
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const { name, rollNo, classId, email, password } = req.body;

  let cls = student.classId ? await ProgramClass.findById(student.classId) : null;
  if (classId !== undefined && (!cls || String(cls._id) !== classId)) {
    const next = await ProgramClass.findById(classId);
    if (!next) return res.status(400).json({ message: BAD_CLASS });
    cls = next;
  }
  if (!cls) return res.status(400).json({ message: BAD_CLASS });

  if (email !== undefined && email !== student.email) {
    const taken = await User.findOne({ email });
    if (taken) return res.status(409).json({ message: EMAIL_TAKEN });
    student.email = email;
  }

  const finalRoll = rollNo !== undefined ? rollNo : student.rollNo;
  const clash = await User.findOne({
    role: 'student',
    classId: cls._id,
    rollNo: finalRoll,
    _id: { $ne: student._id },
  });
  if (clash) return res.status(409).json({ message: ROLL_TAKEN });

  student.classId = cls._id;
  student.className = classLabel(cls);
  student.rollNo = finalRoll;
  if (name !== undefined) student.name = name;
  if (password) student.password = await bcrypt.hash(password, 12);

  try {
    await student.save();
    res.json({ student: toPublic(student, cls) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: duplicateMessage(err) });
    throw err;
  }
};

export const deleteOnlineStudent = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Student not found' });

  const student = await User.findOneAndDelete({ _id: id, role: 'student' });
  if (!student) return res.status(404).json({ message: 'Student not found' });

  await AttendanceRequest.deleteMany({ student: student._id }).catch((err) =>
    console.error('Request cleanup failed:', err.message)
  );

  res.json({ message: 'Student deleted successfully' });
};


/* ---------- Phone change requests ---------- */

export const getDeviceChanges = async (req, res) => {
  const students = await User.find({
    role: 'student',
    pendingDeviceId: { $type: 'string', $ne: '' },
  })
    .sort({ pendingDeviceAt: -1 })
    .select('name rollNo className pendingDeviceAt');

  res.json({
    changes: students.map((s) => ({
      id: String(s._id),
      studentName: s.name,
      rollNo: s.rollNo || '',
      className: s.className || '',
      time: s.pendingDeviceAt,
    })),
  });
};

export const decideDeviceChange = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Request not found' });

  const student = await User.findOne({ _id: id, role: 'student' }).select('pendingDeviceId');
  if (!student) return res.status(404).json({ message: 'Request not found' });

  const pending = student.pendingDeviceId;
  if (!pending) return res.status(409).json({ message: 'This request has already been decided' });

  const accept = req.body.decision === 'accept';
  const result = await User.updateOne(
    { _id: student._id, pendingDeviceId: pending },
    {
      ...(accept ? { $set: { deviceId: pending, deviceBoundAt: new Date() } } : {}),
      $unset: { pendingDeviceId: '', pendingDeviceAt: '' },
    }
  );
  if (result.modifiedCount === 0) {
    return res.status(409).json({ message: 'This request has already been decided' });
  }

  res.json({ message: accept ? 'Phone change accepted' : 'Phone change rejected' });
};



/* ---------- Attendance of one student ---------- */

// Present, pending and absent dates of the student for every course
export const getStudentAttendance = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Student not found' });

  const student = await User.findOne({ _id: id, role: 'student' }).select(
    'name rollNo classId createdAt'
  );
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const today = dateInSchoolZone();
  const nowMin = minutesInSchoolZone();
  const joinedDate = dateInSchoolZone(student.createdAt);

  const [courses, records, holidayRows] = await Promise.all([
    student.classId ? Course.find({ classId: student.classId }).sort({ startMin: 1 }) : [],
    AttendanceRequest.find({ student: student._id }).select('courseId courseName date status'),
    Holiday.find({ date: { $lte: today } }).select('date'),
  ]);
  const holidays = new Set(holidayRows.map((h) => h.date));

  // Group the saved requests by course (records from before the courses have no course)
  const byCourse = new Map();
  records.forEach((r) => {
    const key = r.courseId ? String(r.courseId) : 'none';
    if (!byCourse.has(key)) byCourse.set(key, []);
    byCourse.get(key).push(r);
  });

  const currentIds = new Set(courses.map((c) => String(c._id)));

  const result = courses.map((course) => {
    const report = buildCourseReport({
      course,
      records: byCourse.get(String(course._id)) || [],
      joinedDate,
      today,
      nowMin,
      holidays,
    });
    return {
      id: String(course._id),
      name: course.name,
      note: null,
      startTime: toHHMM(course.startMin),
      endTime: toHHMM(course.endMin),
      ...report,
    };
  });

  // Requests of courses that are not in the class now: a deleted course, a course of an old
  // class, or an old daily request. Only the present and pending days are shown for them.
  const otherIds = [...byCourse.keys()].filter((k) => k !== 'none' && !currentIds.has(k));
  const stillExist = new Set(
    (await Course.find({ _id: { $in: otherIds } }).select('_id')).map((c) => String(c._id))
  );

  [...otherIds, ...(byCourse.has('none') ? ['none'] : [])].forEach((key) => {
    const list = byCourse.get(key);
    const dates = (status) =>
      list
        .filter((r) => r.status === status)
        .map((r) => r.date)
        .sort()
        .reverse();

    let note = 'deleted';
    if (key === 'none') note = 'old_daily';
    else if (stillExist.has(key)) note = 'other_class';

    result.push({
      id: key,
      name: key === 'none' ? 'Earlier attendance' : list[0].courseName || 'Deleted course',
      note,
      startTime: '',
      endTime: '',
      present: dates('accepted'),
      pending: dates('pending'),
      absent: [],
    });
  });

  res.json({
    student: { id: String(student._id), name: student.name, rollNo: student.rollNo || '' },
    courses: result,
  });
};