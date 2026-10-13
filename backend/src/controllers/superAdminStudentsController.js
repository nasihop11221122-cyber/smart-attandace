import ProgramClass from '../models/ProgramClass.js';
import SchoolClass from '../models/SchoolClass.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

const byName = (a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' });

// Totals for the two cards, every program of the online system with the number of students in
// all of its semesters, and every class of the offline system with its number of students.
export const getStudentsOverview = async (req, res) => {
  const [classes, perClass, onlineTotal, manualTotal, schoolClasses, perSchoolClass] =
    await Promise.all([
      ProgramClass.find().select('program'),
      User.aggregate([
        { $match: { role: 'student', classId: { $ne: null } } },
        { $group: { _id: '$classId', count: { $sum: 1 } } },
      ]),
      User.countDocuments({ role: 'student' }),
      Student.countDocuments(),
      SchoolClass.find()
        .sort({ name: 1 })
        .collation({ locale: 'en', numericOrdering: true })
        .select('name'),
      Student.aggregate([{ $group: { _id: '$className', count: { $sum: 1 } } }]),
    ]);

  const countByClass = new Map(perClass.map((row) => [String(row._id), row.count]));

  // One program can have many semesters, so the counts are added up per program
  const programs = new Map();
  classes.forEach((cls) => {
    const key = cls.program.trim().toLowerCase();
    const entry = programs.get(key) || { program: cls.program, students: 0 };
    entry.students += countByClass.get(String(cls._id)) || 0;
    programs.set(key, entry);
  });

  const countByName = new Map(perSchoolClass.map((row) => [row._id, row.count]));
  const manualClasses = schoolClasses.map((c) => ({
    name: c.name,
    students: countByName.get(c.name) || 0,
  }));

  res.json({
    onlineTotal,
    manualTotal,
    manualClasses,
    programs: [...programs.values()].sort((a, b) => byName(a.program, b.program)),
  });
};