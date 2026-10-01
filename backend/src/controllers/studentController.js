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

  const students = await Student.find({ className }).sort({ rollNo: 1 });
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