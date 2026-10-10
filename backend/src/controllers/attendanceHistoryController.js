import AttendanceRequest from '../models/AttendanceRequest.js';
import ProgramClass, { classLabel } from '../models/ProgramClass.js';
import User from '../models/User.js';
import { parseHistoryQuery } from '../utils/historyFilter.js';

const PAGE_SIZE = 20;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const publicHistoryRow = (r) => ({
  id: String(r._id),
  studentName: r.student?.name || 'Deleted student',
  rollNo: r.student?.rollNo || '',
  className: r.className,
  courseName: r.courseName || '',
  date: r.date,
  time: r.createdAt,
  status: r.status,
  // A decided request without an admin was decided by the server itself
  decidedBy: r.status === 'pending' ? '' : r.decidedBy?.name || 'Auto',
  verdict: r.locationCheck?.verdict || '',
  distance: r.locationCheck?.distance ?? null,
  markedByAdmin: Boolean(r.markedByAdmin),
  adminNote: r.adminNote || '',
});

const emptyPage = (page) => ({ total: 0, page, pages: 1, requests: [] });

export const getAttendanceHistory = async (req, res) => {
  const parsed = parseHistoryQuery(req.query);
  if (parsed.error) return res.status(400).json({ message: parsed.error });

  const { from, to, classId, courseId, status, q, page } = parsed.value;
  const filter = {};

  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }
  if (status) filter.status = status;
  if (courseId) filter.courseId = courseId;

  if (classId) {
    const cls = await ProgramClass.findById(classId);
    if (!cls) return res.json(emptyPage(page));
    filter.className = classLabel(cls);
  }

  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    const students = await User.find({
      role: 'student',
      $or: [{ name: pattern }, { rollNo: pattern }],
    })
      .select('_id')
      .limit(200);
    if (students.length === 0) return res.json(emptyPage(page));
    filter.student = { $in: students.map((s) => s._id) };
  }

  const [total, rows] = await Promise.all([
    AttendanceRequest.countDocuments(filter),
    AttendanceRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .populate('student', 'name rollNo')
      .populate('decidedBy', 'name'),
  ]);

  res.json({
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    requests: rows.map(publicHistoryRow),
  });
};