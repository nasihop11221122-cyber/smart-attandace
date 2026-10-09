import mongoose from 'mongoose';
import AttendanceRequest from '../models/AttendanceRequest.js';
import Course from '../models/Course.js';
import ProgramClass, { classLabel } from '../models/ProgramClass.js';
import User from '../models/User.js';
import { hasClassLocation } from '../utils/locationCheck.js';

const CASE_INSENSITIVE = { locale: 'en', strength: 2 };

const publicLocation = (loc) =>
  hasClassLocation(loc)
    ? { latitude: loc.latitude, longitude: loc.longitude, radius: loc.radius }
    : null;

const publicClass = (c, studentCount = 0, courseCount = 0) => ({
  id: String(c._id),
  program: c.program,
  semester: c.semester,
  label: classLabel(c),
  location: publicLocation(c.location),
  studentCount,
  courseCount,
});

// Students and their requests store the class label, so keep them in sync after a rename
const syncStudents = async (cls) => {
  const students = await User.find({ role: 'student', classId: cls._id }).select('_id');
  if (students.length === 0) return;

  const ids = students.map((s) => s._id);
  await User.updateMany({ _id: { $in: ids } }, { className: classLabel(cls) });
  await AttendanceRequest.updateMany(
    { student: { $in: ids } },
    { className: classLabel(cls), semester: cls.semester }
  );
};

export const getClasses = async (req, res) => {
  const [classes, studentCounts, courseCounts] = await Promise.all([
    ProgramClass.find()
      .sort({ program: 1, semester: 1 })
      .collation({ locale: 'en', numericOrdering: true }),
    User.aggregate([
      { $match: { role: 'student', classId: { $exists: true } } },
      { $group: { _id: '$classId', count: { $sum: 1 } } },
    ]),
    Course.aggregate([{ $group: { _id: '$classId', count: { $sum: 1 } } }]),
  ]);

  const studentMap = new Map(studentCounts.map((c) => [String(c._id), c.count]));
  const courseMap = new Map(courseCounts.map((c) => [String(c._id), c.count]));
  const programs = [...new Set(classes.map((c) => c.program))];

  res.json({
    classes: classes.map((c) =>
      publicClass(c, studentMap.get(String(c._id)) || 0, courseMap.get(String(c._id)) || 0)
    ),
    programs,
  });
};

export const createClass = async (req, res) => {
  // Program pehle se ho to usi ki spelling use hoti hai
  const existing = await ProgramClass.findOne({ program: req.body.program })
    .collation({ locale: 'en', strength: 2 })
    .select('program');
  const program = existing ? existing.program : req.body.program;

  try {
    const created = await ProgramClass.create({
      program,
      semester: req.body.semester,
      ...(req.body.location ? { location: req.body.location } : {}),
    });
    res.status(201).json({ classItem: publicClass(created) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'This class already exists' });
    throw err;
  }
};

export const updateClass = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Class not found' });

  const cls = await ProgramClass.findById(id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });

  const clash = await ProgramClass.findOne({
    program: cls.program,
    semester: req.body.semester,
    _id: { $ne: cls._id },
  }).collation(CASE_INSENSITIVE);
  if (clash) return res.status(409).json({ message: 'This class already exists' });

  cls.semester = req.body.semester;
  if (req.body.location) cls.location = req.body.location;

  try {
    await cls.save();
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'This class already exists' });
    throw err;
  }

  await syncStudents(cls);
  res.json({ classItem: publicClass(cls) });
};

export const renameProgram = async (req, res) => {
  const { name, newName } = req.body;

  const classes = await ProgramClass.find({ program: name }).select('_id');
  if (classes.length === 0) return res.status(404).json({ message: 'Program not found' });

  const ids = classes.map((c) => c._id);

  const taken = await ProgramClass.findOne({ program: newName, _id: { $nin: ids } }).collation(
    CASE_INSENSITIVE
  );
  if (taken) return res.status(409).json({ message: 'A program with this name already exists' });

  try {
    await ProgramClass.updateMany({ _id: { $in: ids } }, { program: newName });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'A program with this name already exists' });
    throw err;
  }

  const updated = await ProgramClass.find({ _id: { $in: ids } });
  for (const cls of updated) {
    await syncStudents(cls);
  }

  res.json({ program: newName });
};

export const deleteClass = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Class not found' });

  const found = await ProgramClass.findById(id);
  if (!found) return res.status(404).json({ message: 'Class not found' });

  const inUse = await User.exists({ role: 'student', classId: found._id });
  if (inUse) {
    return res
      .status(409)
      .json({ message: 'Cannot delete this class because students are assigned to it' });
  }

  await Course.deleteMany({ classId: found._id });
  await found.deleteOne();
  res.json({ message: 'Class deleted successfully' });
};

export const deleteProgram = async (req, res) => {
  const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';
  if (!name) return res.status(400).json({ message: 'Program name is required' });

  const classes = await ProgramClass.find({ program: name }).select('_id');
  if (classes.length === 0) return res.status(404).json({ message: 'Program not found' });

  const ids = classes.map((c) => c._id);

  const inUse = await User.exists({ role: 'student', classId: { $in: ids } });
  if (inUse) {
    return res
      .status(409)
      .json({ message: 'Cannot delete this program because students are assigned to it' });
  }

  await Course.deleteMany({ classId: { $in: ids } });
  await ProgramClass.deleteMany({ _id: { $in: ids } });
  res.json({ message: 'Program deleted successfully' });
};