import User from '../models/User.js';
import { buildStudentAttendance } from '../utils/studentReport.js';

// The logged in student's own present, absent and pending dates for every course
export const getMyAttendanceReport = async (req, res) => {
  const me = await User.findById(req.user._id).select('name rollNo className semester classId createdAt');
  if (!me) return res.status(404).json({ message: 'Student not found' });

  res.json({
    student: {
      name: me.name,
      rollNo: me.rollNo || '',
      className: me.className || '',
    },
    courses: await buildStudentAttendance(me),
  });
};