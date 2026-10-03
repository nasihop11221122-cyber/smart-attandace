import mongoose from 'mongoose';
import OnlineSemester from '../models/OnlineSemester.js';
import User from '../models/User.js';

const publicSemester = (s) => ({ id: s._id, name: s.name });

export const getOnlineSemesters = async (req, res) => {
  const semesters = await OnlineSemester.find()
    .sort({ name: 1 })
    .collation({ locale: 'en', numericOrdering: true });
  res.json({ classes: semesters.map(publicSemester) });
};

export const createOnlineSemester = async (req, res) => {
  try {
    const created = await OnlineSemester.create({ name: req.body.name });
    res.status(201).json({ classItem: publicSemester(created) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'This semester already exists' });
    throw err;
  }
};

export const deleteOnlineSemester = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Semester not found' });

  const found = await OnlineSemester.findById(id);
  if (!found) return res.status(404).json({ message: 'Semester not found' });

  const inUse = await User.exists({ role: 'student', semester: found.name });
  if (inUse) {
    return res
      .status(409)
      .json({ message: 'Cannot delete this semester because students are assigned to it' });
  }

  await found.deleteOne();
  res.json({ message: 'Semester deleted successfully' });
};