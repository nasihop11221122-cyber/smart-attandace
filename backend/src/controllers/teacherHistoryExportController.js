import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

const NO_CLASS = 'No class is assigned to you yet';

// Complete attendance of the teacher's own class only, in the same shape as the principal's
// export, so the same Excel and PDF code can be used.
export const getTeacherHistoryExport = async (req, res) => {
  const teacher = await User.findById(req.user._id).select('name className');
  const className = teacher?.className || '';
  if (!className) return res.status(400).json({ message: NO_CLASS });

  const [students, countRows, totalDays] = await Promise.all([
    Student.find({ className }).sort({ rollNo: 1 }),
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
    Attendance.countDocuments({ className }),
  ]);

  const counts = new Map();
  for (const row of countRows) {
    const key = String(row._id.student);
    const entry = counts.get(key) || { present: 0, absent: 0, leave: 0 };
    entry[row._id.status] = row.count;
    counts.set(key, entry);
  }

  res.json({
    generatedAt: new Date().toISOString(),
    label: className,
    classes: [
      {
        className,
        teacherName: teacher.name,
        totalDays,
        students: students.map((s) => {
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
      },
    ],
  });
};