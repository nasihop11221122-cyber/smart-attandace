import ProgramClass from '../models/ProgramClass.js';
import Student from '../models/Student.js';
import User from '../models/User.js';

const byName = (a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' });

// Totals for the two cards, and every program of the online system with the number of
// students in all of its semesters.
export const getStudentsOverview = async (req, res) => {
  const [classes, perClass, onlineTotal, manualTotal] = await Promise.all([
    ProgramClass.find().select('program'),
    User.aggregate([
      { $match: { role: 'student', classId: { $ne: null } } },
      { $group: { _id: '$classId', count: { $sum: 1 } } },
    ]),
    User.countDocuments({ role: 'student' }),
    Student.countDocuments(),
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

  res.json({
    onlineTotal,
    manualTotal,
    programs: [...programs.values()].sort((a, b) => byName(a.program, b.program)),
  });
};