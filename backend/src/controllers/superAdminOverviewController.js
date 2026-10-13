import Attendance from '../models/Attendance.js';
import AttendanceRequest from '../models/AttendanceRequest.js';
import Student from '../models/Student.js';
import User from '../models/User.js';
import { dateInSchoolZone } from '../utils/schoolDate.js';

const BUCKET_MS = 30 * 60 * 1000;

// Total students of both systems (offline school students and online college students) and
// today's attendance progress across both, for the dashboard graph.
export const getOverview = async (req, res) => {
  const today = dateInSchoolZone();

  const [offline, online, submitted, onlineFirst] = await Promise.all([
    Student.countDocuments(),
    User.countDocuments({ role: 'student' }),
    Attendance.find({ date: today }).sort({ createdAt: 1 }),
    // First accepted request of every online student today
    AttendanceRequest.aggregate([
      { $match: { date: today, status: 'accepted' } },
      { $group: { _id: '$student', first: { $min: '$createdAt' } } },
    ]),
  ]);

  const totals = { present: 0, absent: 0, leave: 0 };
  const events = [];

  // Offline: one point every time a class submits its attendance
  submitted.forEach((a) => {
    const counts = { present: 0, absent: 0, leave: 0 };
    a.records.forEach((r) => {
      counts[r.status] += 1;
    });
    totals.present += counts.present;
    totals.absent += counts.absent;
    totals.leave += counts.leave;
    events.push({ className: a.className, time: a.createdAt, ...counts });
  });

  // Online: students who got present, grouped in 30 minute steps so the graph stays small
  const buckets = new Map();
  onlineFirst.forEach((row) => {
    const start = Math.floor(new Date(row.first).getTime() / BUCKET_MS) * BUCKET_MS;
    buckets.set(start, (buckets.get(start) || 0) + 1);
  });
  buckets.forEach((count, start) => {
    totals.present += count;
    events.push({
      className: 'Online',
      time: new Date(start).toISOString(),
      present: count,
      absent: 0,
      leave: 0,
    });
  });

  events.sort((a, b) => new Date(a.time) - new Date(b.time));

  res.json({
    totals: { students: offline + online, offline, online },
    today: { ...totals, events },
  });
};