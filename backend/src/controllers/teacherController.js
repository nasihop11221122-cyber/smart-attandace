import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';

const CLASS_TAKEN = 'This class already has a form master';
const EMAIL_TAKEN = 'This email is already registered';

const publicTeacher = (u) => ({
  id: u._id,
  name: u.name,
  className: u.className,
  email: u.email,
  role: u.role,
  createdAt: u.createdAt,
});

const duplicateMessage = (err) =>
  err.keyPattern?.className || /className_1/.test(err.message) ? CLASS_TAKEN : EMAIL_TAKEN;

export const createTeacher = async (req, res) => {
  const { name, className, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: EMAIL_TAKEN });

  const classTaken = await User.findOne({ role: 'teacher', className });
  if (classTaken) return res.status(409).json({ message: CLASS_TAKEN });

  const hashed = await bcrypt.hash(password, 12);
  try {
    const teacher = await User.create({
      name,
      className,
      email,
      password: hashed,
      role: 'teacher',
    });
    res.status(201).json({ teacher: publicTeacher(teacher) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: duplicateMessage(err) });
    throw err;
  }
};

export const getTeachers = async (req, res) => {
  const teachers = await User.find({ role: 'teacher' }).sort({ createdAt: -1 });
  res.json({ teachers: teachers.map(publicTeacher) });
};

export const updateTeacher = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Teacher not found' });

  const teacher = await User.findOne({ _id: id, role: 'teacher' }).select('+password');
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

  const { name, className, email, password } = req.body;

  if (email !== undefined && email !== teacher.email) {
    const taken = await User.findOne({ email });
    if (taken) return res.status(409).json({ message: EMAIL_TAKEN });
    teacher.email = email;
  }

  if (className !== undefined && className !== teacher.className) {
    const classTaken = await User.findOne({
      role: 'teacher',
      className,
      _id: { $ne: teacher._id },
    });
    if (classTaken) return res.status(409).json({ message: CLASS_TAKEN });
    teacher.className = className;
  }

  if (name !== undefined) teacher.name = name;
  if (password) teacher.password = await bcrypt.hash(password, 12);

  try {
    await teacher.save();
    res.json({ teacher: publicTeacher(teacher) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: duplicateMessage(err) });
    throw err;
  }
};

export const deleteTeacher = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Teacher not found' });

  const teacher = await User.findOneAndDelete({ _id: id, role: 'teacher' });
  if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

  res.json({ message: 'Teacher deleted successfully' });
};