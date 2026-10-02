import Attendance from '../models/Attendance.js';
import AttendanceDraft from '../models/AttendanceDraft.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { dateInSchoolZone } from '../utils/schoolDate.js';

const NO_CLASS = 'No class is assigned to you yet';
const BAD_DATE = 'The attendance date does not match today. Please reload the page and try again';
const ALREADY = 'Attendance for today has already been submitted';

const getTeacherClass = async (req) => {
  const teacher = await User.findById(req.user._id).select('className');
  return teacher?.className || '';
};

const isToday = (date) => typeof date === 'string' && date === dateInSchoolZone();

const dateMismatch = (res) => res.status(400).json({ message: BAD_DATE, code: 'DATE_MISMATCH' });

export const getAttendance = async (req, res) => {
  const date = dateInSchoolZone();

  const className = await getTeacherClass(req);
  if (!className) {
    return res.json({ className: '', date, submitted: false, draft: null, students: [] });
  }

  const [students, saved, draft, countRows] = await Promise.all([
    Student.find({ className }).sort({ rollNo: 1 }),
    Attendance.findOne({ className, date }),
    AttendanceDraft.findOne({ className, date }),
    Attendance.aggregate([
      { $match: { className } },
      { $unwind: '$records' },
      {
        $group: {
          _id: { student: '$records.student', status: '$records.status' },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const counts = new Map();
  for (const row of countRows) {
    const key = String(row._id.student);
    const entry = counts.get(key) || { present: 0, absent: 0, leave: 0 };
    entry[row._id.status] = row.count;
    counts.set(key, entry);
  }

  const statusById = new Map((saved?.records || []).map((r) => [String(r.student), r.status]));

  res.json({
    className,
    date,
    submitted: Boolean(saved),
    draft:
      !saved && draft
        ? {
            absent: draft.absent.map(String),
            leave: draft.leave.map(String),
            updatedAt: draft.updatedAt,
            unlocked: Boolean(draft.unlockedAt),
          }
        : null,
    students: students.map((s) => {
      const id = String(s._id);
      return {
        id: s._id,
        name: s.name,
        fatherName: s.fatherName,
        rollNo: s.rollNo,
        className: s.className,
        status: statusById.get(id) || null,
        counts: counts.get(id) || { present: 0, absent: 0, leave: 0 },
      };
    }),
  });
};

export const saveDraft = async (req, res) => {
  const { date, absent, leave } = req.body;
  if (!isToday(date)) return dateMismatch(res);

  const className = await getTeacherClass(req);
  if (!className) return res.status(400).json({ message: NO_CLASS });

  const alreadyDone = await Attendance.exists({ className, date });
  if (alreadyDone) return res.status(409).json({ message: ALREADY });

  const save = () =>
    AttendanceDraft.findOneAndUpdate(
      { className, date },
      { teacher: req.user._id, absent, leave },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

  let draft;
  try {
    draft = await save();
  } catch (err) {
    if (err.code === 11000) draft = await save();
    else throw err;
  }

  res.json({ updatedAt: draft.updatedAt });
};

export const createAttendance = async (req, res) => {
  const { date, absent, leave } = req.body;
  if (!isToday(date)) return dateMismatch(res);

  const className = await getTeacherClass(req);
  if (!className) return res.status(400).json({ message: NO_CLASS });

  const students = await Student.find({ className }).select('_id');
  if (students.length === 0) {
    return res.status(400).json({ message: 'There are no students in your class' });
  }

  const alreadyDone = await Attendance.exists({ className, date });
  if (alreadyDone) return res.status(409).json({ message: ALREADY });

  const absentSet = new Set(absent);
  const leaveSet = new Set(leave);

  const records = students.map((s) => {
    const id = String(s._id);
    let status = 'present';
    if (absentSet.has(id)) status = 'absent';
    else if (leaveSet.has(id)) status = 'leave';
    return { student: s._id, status };
  });

  try {
    await Attendance.create({ className, date, teacher: req.user._id, records });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: ALREADY });
    throw err;
  }

  await AttendanceDraft.deleteOne({ className, date }).catch((err) =>
    console.error('Draft cleanup failed:', err.message)
  );

  res.status(201).json({ message: 'Attendance submitted successfully' });
};