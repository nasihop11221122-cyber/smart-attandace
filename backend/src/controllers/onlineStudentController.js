import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import OnlineClass from '../models/OnlineClass.js';
import User from '../models/User.js';

const EMAIL_TAKEN = 'This email is already registered';
const ROLL_TAKEN = 'This roll number is already taken in this class';
const BAD_CLASS = 'The selected class does not exist';

const publicStudent = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  rollNo: u.rollNo,
  className: u.className,
  role: u.role,
  createdAt: u.createdAt,
});

// Class ka asli naam (capital/small letters ke farq ke baghair) dhoondta hai
const findClass = (name) =>
  OnlineClass.findOne({ name }).collation({ locale: 'en', strength: 2 }).select('name');

const duplicateMessage = (err) => (err.keyPattern?.rollNo ? ROLL_TAKEN : EMAIL_TAKEN);

export const getOnlineStudents = async (req, res) => {
  const students = await User.find({ role: 'student' }).sort({ createdAt: -1 });
  res.json({ students: students.map(publicStudent) });
};

export const createOnlineStudent = async (req, res) => {
  const { name, rollNo, className, email, password } = req.body;

  const cls = await findClass(className);
  if (!cls) return res.status(400).json({ message: BAD_CLASS });

  const emailTaken = await User.findOne({ email });
  if (emailTaken) return res.status(409).json({ message: EMAIL_TAKEN });

  const rollTaken = await User.findOne({ role: 'student', className: cls.name, rollNo });
  if (rollTaken) return res.status(409).json({ message: ROLL_TAKEN });

  const hashed = await bcrypt.hash(password, 12);
  try {
    const student = await User.create({
      name,
      email,
      password: hashed,
      role: 'student',
      className: cls.name,
      rollNo,
    });
    res.status(201).json({ student: publicStudent(student) });
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

  const { name, rollNo, className, email, password } = req.body;

  let finalClass = student.className;
  if (className !== undefined && className !== student.className) {
    const cls = await findClass(className);
    if (!cls) return res.status(400).json({ message: BAD_CLASS });
    finalClass = cls.name;
  }

  if (email !== undefined && email !== student.email) {
    const taken = await User.findOne({ email });
    if (taken) return res.status(409).json({ message: EMAIL_TAKEN });
    student.email = email;
  }

  const finalRoll = rollNo !== undefined ? rollNo : student.rollNo;
  if (finalClass !== student.className || finalRoll !== student.rollNo) {
    const clash = await User.findOne({
      role: 'student',
      className: finalClass,
      rollNo: finalRoll,
      _id: { $ne: student._id },
    });
    if (clash) return res.status(409).json({ message: ROLL_TAKEN });
  }

  student.className = finalClass;
  student.rollNo = finalRoll;
  if (name !== undefined) student.name = name;
  if (password) student.password = await bcrypt.hash(password, 12);

  try {
    await student.save();
    res.json({ student: publicStudent(student) });
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

  res.json({ message: 'Student deleted successfully' });
};