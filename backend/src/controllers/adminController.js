import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

export const createAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Ye email pehle se registered hai' });

  const hashed = await bcrypt.hash(password, 12);
  try {
    const user = await User.create({ name, email, password: hashed, role: 'admin' });
    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Ye email pehle se registered hai' });
    throw err;
  }
};

export const getAdmins = async (req, res) => {
  const admins = await User.find({ role: 'admin' }).sort({ createdAt: -1 });
  res.json({ admins: admins.map(publicUser) });
};

export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid admin id' });

  const admin = await User.findOne({ _id: id, role: 'admin' });
  if (!admin) return res.status(404).json({ message: 'Admin not found' });

  const { name, email, password } = req.body;

  if (email !== admin.email) {
    const taken = await User.findOne({ email });
    if (taken) return res.status(409).json({ message: 'Ye email pehle se registered hai' });
  }

  admin.name = name;
  admin.email = email;
  if (password) admin.password = await bcrypt.hash(password, 12);

  try {
    await admin.save();
    res.json({ user: publicUser(admin) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Ye email pehle se registered hai' });
    throw err;
  }
};

export const deleteAdmin = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid admin id' });

  const admin = await User.findOneAndDelete({ _id: id, role: 'admin' });
  if (!admin) return res.status(404).json({ message: 'Admin not found' });

  res.json({ message: 'Admin deleted' });
};