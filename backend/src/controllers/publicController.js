import Student from '../models/Student.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import AttendanceRequest from '../models/AttendanceRequest.js';
import SchoolClass from '../models/SchoolClass.js';
import ProgramClass, { classLabel } from '../models/ProgramClass.js';
import { dateInSchoolZone } from '../utils/schoolDate.js';

// Get list of all school & college classes for parent dropdown filter
export const getPublicClasses = async (req, res) => {
  const [schoolClasses, programClasses] = await Promise.all([
    SchoolClass.find().sort({ name: 1 }).lean(),
    ProgramClass.find().sort({ program: 1, semester: 1 }).lean(),
  ]);

  const schoolNames = schoolClasses.map((c) => c.name);
  const collegeNames = programClasses.map((c) => classLabel(c));

  res.json({
    schoolClasses: schoolNames,
    collegeClasses: collegeNames,
    allClasses: [...new Set([...schoolNames, ...collegeNames])],
  });
};

export const getStudentByRollNo = async (req, res) => {
  const { rollNo, className, studentId, type } = req.query;

  // 1. Direct fetch by studentId if parent clicked on a specific candidate
  if (studentId) {
    let student = null;
    let source = type === 'college' ? 'User' : 'Student';

    if (source === 'Student') {
      student = await Student.findById(studentId).lean();
      if (!student) {
        student = await User.findById(studentId).lean();
        if (student) source = 'User';
      }
    } else {
      student = await User.findById(studentId).lean();
      if (!student) {
        student = await Student.findById(studentId).lean();
        if (student) source = 'Student';
      }
    }

    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }

    const details = await buildStudentDetails(student, source);
    return res.json({ multiple: false, student: details, ...details });
  }

  // 2. Search by rollNo and optional className
  if (!rollNo || !rollNo.trim()) {
    return res.status(400).json({ message: 'Roll number is required' });
  }

  const queryRoll = rollNo.trim();
  const numericRoll = Number(queryRoll);
  const candidates = [];

  // Search School Students
  if (!isNaN(numericRoll)) {
    const filter = { rollNo: numericRoll, status: 'active' };
    if (className && className.trim()) {
      filter.className = className.trim();
    }
    const schoolMatches = await Student.find(filter).lean();
    for (const s of schoolMatches) {
      candidates.push({
        id: String(s._id),
        name: s.name,
        fatherName: s.fatherName || '',
        rollNo: String(s.rollNo),
        className: s.className || 'General',
        type: 'school',
      });
    }
  }

  // Search College Students (User model)
  const userFilter = { rollNo: queryRoll, role: 'student', enrollmentStatus: 'active' };
  if (className && className.trim()) {
    userFilter.className = className.trim();
  }
  const collegeMatches = await User.find(userFilter).lean();
  for (const u of collegeMatches) {
    candidates.push({
      id: String(u._id),
      name: u.name,
      fatherName: '',
      rollNo: String(u.rollNo),
      className: u.className || 'General',
      type: 'college',
    });
  }

  if (candidates.length === 0) {
    return res.status(404).json({
      message: className
        ? `No student found with Roll #${queryRoll} in ${className}`
        : `No student found with Roll #${queryRoll}`,
    });
  }

  // If multiple students found across different classes
  if (candidates.length > 1) {
    return res.json({
      multiple: true,
      candidates,
    });
  }

  // Exactly one candidate matched
  const single = candidates[0];
  let studentDoc;
  if (single.type === 'school') {
    studentDoc = await Student.findById(single.id).lean();
  } else {
    studentDoc = await User.findById(single.id).lean();
  }

  const details = await buildStudentDetails(studentDoc, single.type === 'school' ? 'Student' : 'User');
  res.json({
    multiple: false,
    student: details,
    ...details,
  });
};

// Helper: builds full attendance records, stats, today's status, and teacher info
async function buildStudentDetails(student, source) {
  let attendance = [];
  let teacherName = '';

  if (source === 'Student') {
    // School student
    if (student.className) {
      const teacher = await User.findOne({ role: 'teacher', className: student.className }).select('name').lean();
      if (teacher) teacherName = teacher.name;
    }

    const studentId = student._id;
    const attendanceDocs = await Attendance.find({ 'records.student': studentId }).lean();
    attendance = attendanceDocs.flatMap((doc) => {
      const record = doc.records.find((r) => r.student.toString() === studentId.toString());
      if (record) {
        return [{
          date: doc.date,
          status: record.status.charAt(0).toUpperCase() + record.status.slice(1).toLowerCase(),
        }];
      }
      return [];
    });
  } else {
    // College / online student (AttendanceRequest model)
    const requests = await AttendanceRequest.find({ student: student._id }).sort({ date: -1 }).lean();
    attendance = requests.map((req) => {
      let statusLabel = 'Pending';
      if (req.status === 'accepted') statusLabel = 'Present';
      else if (req.status === 'rejected') statusLabel = 'Absent';

      return {
        date: req.date,
        status: statusLabel,
        courseName: req.courseName || '',
      };
    });
  }

  // Sort descending by date
  attendance.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Today's status in school time zone
  const todayDate = dateInSchoolZone();
  const todayRecord = attendance.find((a) => a.date === todayDate);
  const todayStatus = todayRecord ? todayRecord.status : 'Not Marked Yet';

  // Statistics
  const totalDays = attendance.length;
  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const absentCount = attendance.filter((a) => a.status === 'Absent').length;
  const leaveCount = attendance.filter((a) => a.status === 'Leave').length;
  const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;

  return {
    id: String(student._id),
    type: source === 'Student' ? 'school' : 'college',
    name: student.name,
    fatherName: student.fatherName || '',
    rollNo: String(student.rollNo),
    className: student.className || '',
    teacherName,
    todayDate,
    todayStatus,
    stats: {
      totalDays,
      present: presentCount,
      absent: absentCount,
      leave: leaveCount,
      percentage,
    },
    attendance,
  };
}
