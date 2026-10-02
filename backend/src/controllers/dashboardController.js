import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { SCHOOL_TIME_ZONE, dateInSchoolZone } from '../utils/schoolDate.js';

const GROWTH_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export const getDashboard = async (req, res) => {
  const now = Date.now();
  const today = dateInSchoolZone(new Date(now));

  const days = [];
  for (let i = GROWTH_DAYS - 1; i >= 0; i -= 1) {
    days.push(dateInSchoolZone(new Date(now - i * DAY_MS)));
  }

  const [totalStudents, totalTeachers, classCount, perDay, todays] = await Promise.all([
    Student.countDocuments(),
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'teacher', className: { $type: 'string', $ne: '' } }),
    Student.aggregate([
      { $match: { createdAt: { $gte: new Date(now - (GROWTH_DAYS + 1) * DAY_MS) } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: SCHOOL_TIME_ZONE },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    Attendance.find({ date: today }).sort({ createdAt: -1 }).populate('teacher', 'name'),
  ]);

  // Har din ke akhir tak kitne students the (barhta hua total)
  const dayCounts = new Map(perDay.map((row) => [row._id, row.count]));
  const joinedInWindow = days.reduce((sum, d) => sum + (dayCounts.get(d) || 0), 0);
  let running = totalStudents - joinedInWindow;
  const series = days.map((d) => {
    running += dayCounts.get(d) || 0;
    return { date: d, total: running };
  });

  const notifications = todays.map((a) => {
    const counts = { present: 0, absent: 0, leave: 0 };
    a.records.forEach((r) => {
      counts[r.status] += 1;
    });
    return {
      id: String(a._id),
      className: a.className,
      teacherName: a.teacher?.name || 'Teacher',
      time: a.createdAt,
      present: counts.present,
      absent: counts.absent,
      leave: counts.leave,
      total: a.records.length,
    };
  });

  res.json({
    totals: {
      students: totalStudents,
      teachers: totalTeachers,
      classes: classCount,
      submittedToday: notifications.length,
    },
    growth: { series, joinedLast30Days: joinedInWindow },
    notifications,
  });
};