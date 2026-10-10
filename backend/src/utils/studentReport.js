import AttendanceRequest from '../models/AttendanceRequest.js';
import Course from '../models/Course.js';
import Holiday from '../models/Holiday.js';
import { toHHMM } from './courseTime.js';
import { buildCourseReport } from './attendanceReport.js';
import { dateInSchoolZone, minutesInSchoolZone } from './schoolDate.js';

// Present, pending and absent dates of one student for every course.
// `student` needs: _id, classId, createdAt
export const buildStudentAttendance = async (student) => {
  const today = dateInSchoolZone();
  const nowMin = minutesInSchoolZone();
  const joinedDate = dateInSchoolZone(student.createdAt);

  const [courses, records, holidayRows] = await Promise.all([
    student.classId ? Course.find({ classId: student.classId }).sort({ startMin: 1 }) : [],
    AttendanceRequest.find({ student: student._id }).select('courseId courseName date status'),
    Holiday.find({ date: { $lte: today } }).select('date'),
  ]);
  const holidays = new Set(holidayRows.map((h) => h.date));

  // Group the saved requests by course (records from before the courses have no course)
  const byCourse = new Map();
  records.forEach((r) => {
    const key = r.courseId ? String(r.courseId) : 'none';
    if (!byCourse.has(key)) byCourse.set(key, []);
    byCourse.get(key).push(r);
  });

  const currentIds = new Set(courses.map((c) => String(c._id)));

  const result = courses.map((course) => {
    const report = buildCourseReport({
      course,
      records: byCourse.get(String(course._id)) || [],
      joinedDate,
      today,
      nowMin,
      holidays,
    });
    return {
      id: String(course._id),
      name: course.name,
      note: null,
      startTime: toHHMM(course.startMin),
      endTime: toHHMM(course.endMin),
      ...report,
    };
  });

  // Requests of courses that are not in the class now: a deleted course, a course of an old
  // class, or an old daily request. Only the present and pending days are shown for them.
  const otherIds = [...byCourse.keys()].filter((k) => k !== 'none' && !currentIds.has(k));
  const stillExist = new Set(
    (await Course.find({ _id: { $in: otherIds } }).select('_id')).map((c) => String(c._id))
  );

  [...otherIds, ...(byCourse.has('none') ? ['none'] : [])].forEach((key) => {
    const list = byCourse.get(key);
    const dates = (status) =>
      list
        .filter((r) => r.status === status)
        .map((r) => r.date)
        .sort()
        .reverse();

    let note = 'deleted';
    if (key === 'none') note = 'old_daily';
    else if (stillExist.has(key)) note = 'other_class';

    result.push({
      id: key,
      name: key === 'none' ? 'Earlier attendance' : list[0].courseName || 'Deleted course',
      note,
      startTime: '',
      endTime: '',
      present: dates('accepted'),
      pending: dates('pending'),
      absent: [],
    });
  });

  return result;
};