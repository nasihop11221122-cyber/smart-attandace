import mongoose from 'mongoose';
import SchoolClass from '../models/SchoolClass.js';
import User from '../models/User.js';

const publicClass = (c) => ({ id: c._id, name: c.name });

export const getClasses = async (req, res) => {
  const [classes, assignedNames] = await Promise.all([
    SchoolClass.find().sort({ name: 1 }).collation({ locale: 'en', numericOrdering: true }),
    User.distinct('className', { role: 'teacher' }),
  ]);
  const assigned = new Set(assignedNames);

  res.json({
    classes: classes.map((c) => ({ ...publicClass(c), assigned: assigned.has(c.name) })),
  });
};

export const createClass = async (req, res) => {
  try {
    const created = await SchoolClass.create({ name: req.body.name });
    res.status(201).json({ classItem: publicClass(created) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'This class already exists' });
    throw err;
  }
};

export const deleteClass = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Class not found' });

  const found = await SchoolClass.findById(id);
  if (!found) return res.status(404).json({ message: 'Class not found' });

  const inUse = await User.exists({ role: 'teacher', className: found.name });
  if (inUse) {
    return res
      .status(409)
      .json({ message: 'Cannot delete this class because a teacher is assigned to it' });
  }

  await found.deleteOne();
  res.json({ message: 'Class deleted successfully' });
};