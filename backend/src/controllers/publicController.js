import Student from '../models/Student.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';

export const getStudentByRollNo = async (req, res) => {
  const { rollNo } = req.query;
  if (!rollNo) {
    return res.status(400).json({ message: 'Roll number is required' });
  }

  let student = null;
  let source = null;

  const numericRoll = Number(rollNo);
  if (!isNaN(numericRoll)) {
    student = await Student.findOne({ rollNo: numericRoll, status: 'active' }).lean();
    if (student) source = 'Student';
  }

  if (!student) {
    student = await User.findOne({ rollNo: String(rollNo), role: 'student', enrollmentStatus: 'active' }).lean();
    if (student) source = 'User';
  }

  if (!student) {
    return res.status(404).json({ message: 'No student found with this roll number' });
  }

  let attendance = [];
  if (source === 'Student') {
    const studentId = student._id;
    const attendanceDocs = await Attendance.find({ 'records.student': studentId }).lean();
    attendance = attendanceDocs.flatMap((doc) => {
      const record = doc.records.find((r) => r.student.toString() === studentId.toString());
      if (record) {
        return [{ date: doc.date, status: record.status }];
      }
      return [];
    });
    attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  const rollNoValue = source === 'Student' ? String(student.rollNo) : student.rollNo;

  res.json({
    id: String(student._id),
    name: student.name,
    fatherName: student.fatherName || '',
    rollNo: rollNoValue,
    className: student.className || '',
    section: '',
    level: '',
    teacherName: '',
    attendance: attendance.map((a) => ({
      date: a.date,
      status: a.status.charAt(0).toUpperCase() + a.status.slice(1),
    })),
  });
};
