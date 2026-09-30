import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

export const createPrincipal = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Ye email pehle se registered hai' });

  const hashed = await bcrypt.hash(password, 12);
  try {
    const user = await User.create({ name, email, password: hashed, role: 'principal' });
    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Ye email pehle se registered hai' });
    throw err;
  }
};

export const getPrincipals = async (req, res) => {
  const principals = await User.find({ role: 'principal' }).sort({ createdAt: -1 });
  res.json({ principals: principals.map(publicUser) });
};

export const updatePrincipal = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid principal id' });

  const principal = await User.findOne({ _id: id, role: 'principal' });
  if (!principal) return res.status(404).json({ message: 'Principal not found' });

  const { name, email, password } = req.body;

  if (email !== principal.email) {
    const taken = await User.findOne({ email });
    if (taken) return res.status(409).json({ message: 'Ye email pehle se registered hai' });
  }

  principal.name = name;
  principal.email = email;
  if (password) principal.password = await bcrypt.hash(password, 12);

  try {
    await principal.save();
    res.json({ user: publicUser(principal) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Ye email pehle se registered hai' });
    throw err;
  }
};

export const deletePrincipal = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid principal id' });

  const principal = await User.findOneAndDelete({ _id: id, role: 'principal' });
  if (!principal) return res.status(404).json({ message: 'Principal not found' });

  res.json({ message: 'Principal deleted' });
};