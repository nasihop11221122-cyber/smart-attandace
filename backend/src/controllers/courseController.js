import mongoose from 'mongoose';
import Course from '../models/Course.js';
import ProgramClass from '../models/ProgramClass.js';
import { addMonthsToDate, toHHMM, toMinutes } from '../utils/courseTime.js';
import { dateInSchoolZone } from '../utils/schoolDate.js';

const NAME_TAKEN = 'This course already exists in this class';
const COURSE_MONTHS = 6;

// Courses made before the days were added have no days or dates: show them in a safe way
const periodOf = (c) => {
  const startDate = c.startDate || dateInSchoolZone(c.createdAt);
  return { startDate, endDate: c.endDate || addMonthsToDate(startDate, COURSE_MONTHS) };
};

const publicCourse = (c) => ({
  id: String(c._id),
  classId: String(c.classId),
  name: c.name,
  startTime: toHHMM(c.startMin),
  endTime: toHHMM(c.endMin),
  days: c.days || [],
  ...periodOf(c),
});

// Same class ka koi aur course jis ka waqt aur din dono takraye (back-to-back theek hai)
const findOverlap = (classId, startMin, endMin, days, excludeId) =>
  Course.findOne({
    classId,
    startMin: { $lt: endMin },
    endMin: { $gt: startMin },
    // A course without saved days could run on any day, so it counts as a clash
    $or: [{ days: { $in: days } }, { days: { $exists: false } }, { days: { $size: 0 } }],
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });

const overlapMessage = (c) =>
  `This time overlaps with ${c.name} (${toHHMM(c.startMin)} - ${toHHMM(c.endMin)})`;

export const getCourses = async (req, res) => {
  const { classId } = req.query;
  if (typeof classId !== 'string' || !mongoose.isValidObjectId(classId)) {
    return res.status(400).json({ message: 'A valid class is required' });
  }

  const courses = await Course.find({ classId }).sort({ startMin: 1 });
  res.json({ courses: courses.map(publicCourse) });
};

export const createCourse = async (req, res) => {
  const { classId, name, startTime, endTime, days } = req.body;

  const cls = await ProgramClass.findById(classId).select('_id');
  if (!cls) return res.status(400).json({ message: 'The selected class does not exist' });

  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);

  const clash = await findOverlap(cls._id, startMin, endMin, days);
  if (clash) return res.status(409).json({ message: overlapMessage(clash) });

  // The course runs for 6 months from today
  const startDate = dateInSchoolZone();
  const endDate = addMonthsToDate(startDate, COURSE_MONTHS);

  try {
    const created = await Course.create({
      classId: cls._id,
      name,
      startMin,
      endMin,
      days,
      startDate,
      endDate,
    });
    res.status(201).json({ course: publicCourse(created) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: NAME_TAKEN });
    throw err;
  }
};

export const updateCourse = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Course not found' });

  const course = await Course.findById(id);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const { name, startTime, endTime, days } = req.body;
  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);

  const clash = await findOverlap(course.classId, startMin, endMin, days, course._id);
  if (clash) return res.status(409).json({ message: overlapMessage(clash) });

  course.name = name;
  course.startMin = startMin;
  course.endMin = endMin;
  course.days = days;

  // An older course gets its 6 month period now (counted from the day it was created)
  if (!course.startDate || !course.endDate) {
    const period = periodOf(course);
    course.startDate = period.startDate;
    course.endDate = period.endDate;
  }

  try {
    await course.save();
    res.json({ course: publicCourse(course) });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: NAME_TAKEN });
    throw err;
  }
};

export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Course not found' });

  const course = await Course.findByIdAndDelete(id);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  res.json({ message: 'Course deleted successfully' });
};