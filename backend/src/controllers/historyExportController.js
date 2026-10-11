import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

export const getHistoryExport = async (req, res) => {
  const [teachers, students, countRows, dayRows] = await Promise.all([
    User.find({ role: 'teacher', className: { $type: 'string', $ne: '' } }).select('name className'),
    Student.find().sort({ rollNo: 1 }),
    Attendance.aggregate([
      { $unwind: '$records' },
      {
        $group: {
          _id: { student: '$records.student', status: '$records.status' },
          count: { $sum: 1 },
        },
      },
    ]),
    Attendance.aggregate([{ $group: { _id: '$className', days: { $sum: 1 } } }]),
  ]);

  const counts = new Map();
  for (const row of countRows) {
    const key = String(row._id.student);
    const entry = counts.get(key) || { present: 0, absent: 0, leave: 0 };
    entry[row._id.status] = row.count;
    counts.set(key, entry);
  }

  const daysMap = new Map(dayRows.map((r) => [r._id, r.days]));

  const studentsByClass = new Map();
  students.forEach((s) => {
    const list = studentsByClass.get(s.className) || [];
    list.push(s);
    studentsByClass.set(s.className, list);
  });

  const classes = teachers
    .map((t) => ({
      className: t.className,
      teacherName: t.name,
      totalDays: daysMap.get(t.className) || 0,
      students: (studentsByClass.get(t.className) || []).map((s) => {
        const c = counts.get(String(s._id)) || { present: 0, absent: 0, leave: 0 };
        return {
          rollNo: s.rollNo,
          name: s.name,
          fatherName: s.fatherName,
          present: c.present,
          absent: c.absent,
          leave: c.leave,
        };
      }),
    }))
    .sort((a, b) => a.className.localeCompare(b.className, 'en', { numeric: true }));

  res.json({ generatedAt: new Date().toISOString(), classes });
};