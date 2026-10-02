import mongoose from 'mongoose';
import OnlineClass from '../models/OnlineClass.js';
import User from '../models/User.js';

const publicClass = (c) => ({ id: c._id, name: c.name });

export const getOnlineClasses = async (req, res) => {
  const classes = await OnlineClass.find()
    .sort({ name: 1 })
    .collation({ locale: 'en', numericOrdering: true });
  res.json({ classes: classes.map(publicClass) });
};

export const createOnlineClass = async (req, res) => {
  try {
    const created = await OnlineClass.create({ name: req.body.name });
    res.status(201).json({ classItem: publicClass(created) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'This class already exists' });
    throw err;
  }
};

export const deleteOnlineClass = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Class not found' });

  const found = await OnlineClass.findById(id);
  if (!found) return res.status(404).json({ message: 'Class not found' });

  const inUse = await User.exists({ role: 'student', className: found.name });
  if (inUse) {
    return res
      .status(409)
      .json({ message: 'Cannot delete this class because students are assigned to it' });
  }

  await found.deleteOne();
  res.json({ message: 'Class deleted successfully' });
};