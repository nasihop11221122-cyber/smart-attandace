import mongoose from 'mongoose';
import AttendanceRequest from '../models/AttendanceRequest.js';
import User from '../models/User.js';
import { dateInSchoolZone } from '../utils/schoolDate.js';

const publicRequest = (r) => ({
  id: String(r._id),
  studentName: r.student?.name || 'Student',
  rollNo: r.student?.rollNo || '',
  className: r.className,
  semester: r.semester || '',
  date: r.date,
  time: r.createdAt,
});

/* ---------- Admin ---------- */

export const getPendingRequests = async (req, res) => {
  const requests = await AttendanceRequest.find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .populate('student', 'name rollNo');

  res.json({ requests: requests.map(publicRequest) });
};

export const decideRequest = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Request not found' });

  const status = req.body.decision === 'accept' ? 'accepted' : 'rejected';

  const updated = await AttendanceRequest.findOneAndUpdate(
    { _id: id, status: 'pending' },
    { status, decidedBy: req.user._id, decidedAt: new Date() },
    { new: true }
  );

  if (!updated) {
    const exists = await AttendanceRequest.exists({ _id: id });
    return res.status(exists ? 409 : 404).json({
      message: exists ? 'This request has already been decided' : 'Request not found',
    });
  }

  res.json({ message: `Request ${status}` });
};

/* ---------- Student ---------- */

const myId = (req) => new mongoose.Types.ObjectId(String(req.user._id));

export const getMyRequest = async (req, res) => {
  const date = dateInSchoolZone();

  const [me, today, rows] = await Promise.all([
    User.findById(req.user._id).select('className semester rollNo'),
    AttendanceRequest.findOne({ student: req.user._id, date }),
    AttendanceRequest.aggregate([
      { $match: { student: myId(req) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const counts = { accepted: 0, pending: 0, rejected: 0 };
  rows.forEach((row) => {
    counts[row._id] = row.count;
  });

  res.json({
    date,
    className: me?.className || '',
    semester: me?.semester || '',
    rollNo: me?.rollNo || '',
    request: today ? { id: String(today._id), status: today.status, createdAt: today.createdAt } : null,
    counts,
  });
};

export const createMyRequest = async (req, res) => {
  const date = dateInSchoolZone();

  const me = await User.findById(req.user._id).select('className semester');
  if (!me?.className) {
    return res
      .status(400)
      .json({ message: 'You are not assigned to a class yet. Please contact the admin' });
  }

  const existing = await AttendanceRequest.findOne({ student: req.user._id, date });
  if (existing) {
    if (existing.status !== 'rejected') {
      return res.status(409).json({ message: 'You have already sent the attendance request for today' });
    }
    // Reject hui request dobara bheji ja sakti hai
    existing.status = 'pending';
    existing.decidedBy = undefined;
    existing.decidedAt = undefined;
    await existing.save();
    return res.json({ request: { id: String(existing._id), status: existing.status } });
  }

  try {
    const created = await AttendanceRequest.create({
      student: req.user._id,
      className: me.className,
      semester: me.semester || undefined,
      date,
    });
    res.status(201).json({ request: { id: String(created._id), status: created.status } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already sent the attendance request for today' });
    }
    throw err;
  }
};