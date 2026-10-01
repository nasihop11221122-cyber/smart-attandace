import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

export const getHistoryClasses = async (req, res) => {
  const [teachers, counts] = await Promise.all([
    User.find({ role: 'teacher', className: { $type: 'string', $ne: '' } }).select('name className'),
    Student.aggregate([{ $group: { _id: '$className', count: { $sum: 1 } } }]),
  ]);

  const countMap = new Map(counts.map((c) => [c._id, c.count]));

  const classes = teachers
    .map((t) => ({
      className: t.className,
      teacherName: t.name,
      studentCount: countMap.get(t.className) || 0,
    }))
    .sort((a, b) => a.className.localeCompare(b.className, 'en', { numeric: true }));

  res.json({ classes });
};

export const getClassStudents = async (req, res) => {
  const { className } = req.query;
  if (typeof className !== 'string' || !className.trim()) {
    return res.status(400).json({ message: 'Class name is required' });
  }
  const name = className.trim();

  const [students, countRows] = await Promise.all([
    Student.find({ className: name }).sort({ rollNo: 1 }),
    Attendance.aggregate([
      { $match: { className: name } },
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

  res.json({
    className: name,
    students: students.map((s) => ({
      id: s._id,
      name: s.name,
      fatherName: s.fatherName,
      rollNo: s.rollNo,
      className: s.className,
      counts: counts.get(String(s._id)) || { present: 0, absent: 0, leave: 0 },
    })),
  });
};