import mongoose from 'mongoose';
import Student from '../models/Student.js';
import User from '../models/User.js';

const ROLL_TAKEN = 'This roll number is already taken in your class';
const NO_CLASS = 'No class is assigned to you yet';

const publicStudent = (s) => ({
  id: s._id,
  name: s.name,
  fatherName: s.fatherName,
  rollNo: s.rollNo,
  className: s.className,
});

const getTeacherClass = async (req) => {
  const teacher = await User.findById(req.user._id).select('className');
  return teacher?.className || '';
};

const getNextRollNo = async (className) => {
  const last = await Student.findOne({ className }).sort({ rollNo: -1 }).select('rollNo');
  return last ? last.rollNo + 1 : 1;
};

export const getStudents = async (req, res) => {
  const className = await getTeacherClass(req);
  if (!className) return res.json({ className: '', students: [], nextRollNo: 1 });

  const students = await Student.find({ className, status: { $ne: 'graduated' } }).sort({ rollNo: 1 });
  res.json({
    className,
    students: students.map(publicStudent),
    nextRollNo: await getNextRollNo(className),
  });
};

export const createStudent = async (req, res) => {
  const className = await getTeacherClass(req);
  if (!className) return res.status(400).json({ message: NO_CLASS });

  const { name, fatherName } = req.body;
  const rollNo = req.body.rollNo ?? (await getNextRollNo(className));

  try {
    const student = await Student.create({ name, fatherName, rollNo, className });
    res.status(201).json({ student: publicStudent(student) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: ROLL_TAKEN });
    throw err;
  }
};

export const updateStudent = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Student not found' });

  const className = await getTeacherClass(req);
  if (!className) return res.status(400).json({ message: NO_CLASS });

  const student = await Student.findOne({ _id: id, className });
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const { name, fatherName, rollNo } = req.body;
  if (name !== undefined) student.name = name;
  if (fatherName !== undefined) student.fatherName = fatherName;
  if (rollNo !== undefined) student.rollNo = rollNo;

  try {
    await student.save();
    res.json({ student: publicStudent(student) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: ROLL_TAKEN });
    throw err;
  }
};

export const deleteStudent = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Student not found' });

  const className = await getTeacherClass(req);
  if (!className) return res.status(400).json({ message: NO_CLASS });

  const student = await Student.findOneAndDelete({ _id: id, className });
  if (!student) return res.status(404).json({ message: 'Student not found' });

  res.json({ message: 'Student deleted successfully' });
};

export const bulkCreateStudents = async (req, res) => {
  const className = await getTeacherClass(req);
  if (!className) return res.status(400).json({ message: NO_CLASS });

  const { students } = req.body;
  const existingInClass = await Student.find({ className }).select('rollNo');
  const existingRolls = new Set(existingInClass.map((s) => s.rollNo));

  const toInsert = [];
  const errors = [];
  const seenRolls = new Set();

  for (const s of students) {
    const roll = Number(s.rollNo);
    if (seenRolls.has(roll) || existingRolls.has(roll)) {
      errors.push({ rollNo: roll, name: s.name, reason: 'Duplicate roll number in this class' });
      continue;
    }

    seenRolls.add(roll);
    toInsert.push({
      name: s.name.trim(),
      fatherName: s.fatherName.trim(),
      rollNo: roll,
      className,
    });
  }

  let createdCount = 0;
  if (toInsert.length > 0) {
    const created = await Student.insertMany(toInsert, { ordered: false });
    createdCount = created.length;
  }

  res.status(201).json({
    success: true,
    createdCount,
    skippedCount: errors.length,
    errors,
  });
};

export const graduateClass = async (req, res) => {
  const className = await getTeacherClass(req);
  if (!className) return res.status(400).json({ message: NO_CLASS });

  const students = await Student.find({ className, status: { $ne: 'graduated' } });
  if (students.length === 0) {
    return res.status(400).json({ message: 'No active students in this class to pass out' });
  }

  const now = new Date();
  const year = now.getFullYear();
  const code = className.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || 'SCH';

  let count = 0;
  for (const s of students) {
    s.status = 'graduated';
    s.graduatedAt = now;
    s.graduatedClass = className;
    s.finalAttendancePercent = 100;
    s.certificateId = `CERT-${year}-${code}-${String(s.rollNo).padStart(3, '0')}`;
    s.className = '';
    await s.save();
    count++;
  }

  res.json({
    success: true,
    message: `Successfully passed out ${count} students from ${className}`,
    graduatedCount: count,
  });
};

export const getGraduatedStudents = async (req, res) => {
  const teacher = await User.findById(req.user._id).select('className');
  const query = { status: 'graduated' };
  if (teacher?.className) {
    query.graduatedClass = teacher.className;
  }

  const students = await Student.find(query).sort({ graduatedAt: -1, name: 1 }).lean();

  res.json({
    students: students.map((s) => ({
      id: String(s._id),
      name: s.name,
      fatherName: s.fatherName,
      rollNo: s.rollNo,
      className: s.graduatedClass || '—',
      graduatedAt: s.graduatedAt,
      attendancePercent: s.finalAttendancePercent ?? 100,
      certificateId: s.certificateId || `CERT-${s._id.toString().slice(-6).toUpperCase()}`,
    })),
  });
};

export const promoteSchoolClass = async (req, res) => {
  const { targetClassName, studentIds } = req.body;
  const teacher = await User.findById(req.user._id).select('className');
  const sourceClassName = teacher?.className;

  if (!sourceClassName) return res.status(400).json({ message: NO_CLASS });
  if (!targetClassName || typeof targetClassName !== 'string') {
    return res.status(400).json({ message: 'Target class name is required' });
  }

  if (sourceClassName.toLowerCase() === targetClassName.toLowerCase()) {
    return res.status(400).json({ message: 'Source and Target class cannot be the same' });
  }

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ message: 'Please select at least one passing student to promote' });
  }

  // Safety Shield: Check if target class already has active students
  const targetCount = await Student.countDocuments({
    className: targetClassName,
    status: { $ne: 'graduated' },
  });

  if (targetCount > 0) {
    return res.status(409).json({
      message: `Cannot promote: ${targetClassName} already contains ${targetCount} active students. Please promote or pass out the existing students first so classes do not mix up!`,
    });
  }

  // Update selected passed students to target class
  await Student.updateMany(
    { _id: { $in: studentIds }, className: sourceClassName, status: { $ne: 'graduated' } },
    { $set: { className: targetClassName } }
  );

  res.json({
    success: true,
    message: `Successfully promoted ${studentIds.length} passed students to ${targetClassName}!`,
    promotedCount: studentIds.length,
  });
};


