import AttendanceRequest from '../models/AttendanceRequest.js';
import Course from '../models/Course.js';
import Holiday from '../models/Holiday.js';
import ProgramClass, { classLabel } from '../models/ProgramClass.js';
import User from '../models/User.js';
import { buildCourseReport } from '../utils/attendanceReport.js';
import { dateInSchoolZone, minutesInSchoolZone } from '../utils/schoolDate.js';

const byName = (a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' });

// Complete attendance of every student, class by class, for the Excel and PDF download.
// Attendance % = present / (present + absent) over all courses of the class.
// Pending requests are not counted until the admin decides them.
export const getHistoryExport = async (req, res) => {
  const today = dateInSchoolZone();
  const nowMin = minutesInSchoolZone();

  const [classes, holidayRows] = await Promise.all([
    ProgramClass.find(),
    Holiday.find({ date: { $lte: today } }).select('date'),
  ]);
  const holidays = new Set(holidayRows.map((h) => h.date));

  classes.sort((a, b) => byName(a.program, b.program) || byName(a.semester, b.semester));

  const result = await Promise.all(
    classes.map(async (cls) => {
      const [courses, students] = await Promise.all([
        Course.find({ classId: cls._id }),
        User.find({ role: 'student', classId: cls._id }).select('name createdAt'),
      ]);

      // Present and pending requests of this class, grouped by student and course
      const grouped = new Map();
      if (courses.length > 0 && students.length > 0) {
        const records = await AttendanceRequest.find({
          student: { $in: students.map((s) => s._id) },
          courseId: { $in: courses.map((c) => c._id) },
        }).select('student courseId date status');

        records.forEach((r) => {
          const key = `${r.student}:${r.courseId}`;
          if (!grouped.has(key)) grouped.set(key, []);
          grouped.get(key).push(r);
        });
      }

      const rows = students.map((s) => {
        const joinedDate = dateInSchoolZone(s.createdAt);
        let present = 0;
        let absent = 0;

        courses.forEach((course) => {
          const report = buildCourseReport({
            course,
            records: grouped.get(`${s._id}:${course._id}`) || [],
            joinedDate,
            today,
            nowMin,
            holidays,
          });
          present += report.present.length;
          absent += report.absent.length;
        });

        const total = present + absent;
        return {
          name: s.name,
          percent: total > 0 ? Math.round((present / total) * 1000) / 10 : null,
        };
      });

      rows.sort((a, b) => byName(a.name, b.name));

      return {
        id: String(cls._id),
        program: cls.program,
        semester: cls.semester,
        label: classLabel(cls),
        totalCourses: courses.length,
        students: rows,
      };
    })
  );

  res.json({ generatedAt: new Date().toISOString(), classes: result });
};