import mongoose from 'mongoose';
import AttendanceRequest from '../models/AttendanceRequest.js';
import ProgramClass from '../models/ProgramClass.js';
import Course from '../models/Course.js';
import Holiday from '../models/Holiday.js';
import User from '../models/User.js';
import { dateInSchoolZone, minutesInSchoolZone } from '../utils/schoolDate.js';
import { findRunningCourse, toHHMM } from '../utils/courseTime.js';
import { evaluateLocation } from '../utils/locationCheck.js';
import { DEVICE_ID_REGEX } from '../validators/deviceValidators.js';

const publicLocationCheck = (r) =>
  r.locationCheck?.verdict
    ? {
        verdict: r.locationCheck.verdict,
        distance: r.locationCheck.distance ?? null,
        accuracy:
          typeof r.locationReading?.accuracy === 'number'
            ? Math.round(r.locationReading.accuracy)
            : null,
        flags: r.locationCheck.flags || [],
      }
    : null;

const publicRequest = (r) => ({
  id: String(r._id),
  studentName: r.student?.name || 'Student',
  rollNo: r.student?.rollNo || '',
  className: r.className,
  semester: r.semester || '',
  courseName: r.courseName || '',
  date: r.date,
  time: r.createdAt,
  locationCheck: publicLocationCheck(r),
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

// new = no phone saved yet, this = the saved phone, other = a different phone
const deviceStatus = (me, deviceId) => {
  if (!me?.deviceId) return 'new';
  return me.deviceId === deviceId ? 'this' : 'other';
};

// The course of the student's class that is running right now (null if there is none)
const runningCourseOf = async (me, date) => {
  if (!me?.classId) return null;
  const courses = await Course.find({ classId: me.classId }).select(
    'name startMin endMin days startDate endDate createdAt'
  );
  return findRunningCourse(courses, minutesInSchoolZone(), date);
};

export const getMyRequest = async (req, res) => {
  const date = dateInSchoolZone();
  const deviceId =
    typeof req.query.deviceId === 'string' && DEVICE_ID_REGEX.test(req.query.deviceId)
      ? req.query.deviceId
      : '';

  const [me, rows] = await Promise.all([
    User.findById(req.user._id).select('className semester rollNo classId deviceId pendingDeviceId'),
    AttendanceRequest.aggregate([
      { $match: { student: myId(req) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  // On a holiday no course is running
  const holiday = await Holiday.findOne({ date }).select('title');
  const course = holiday ? null : await runningCourseOf(me, date);
  const today = course
    ? await AttendanceRequest.findOne({ student: req.user._id, courseId: course._id, date })
    : null;

  const counts = { accepted: 0, pending: 0, rejected: 0 };
  rows.forEach((row) => {
    counts[row._id] = row.count;
  });

  res.json({
    date,
    className: me?.className || '',
    semester: me?.semester || '',
    rollNo: me?.rollNo || '',
    course: course
      ? {
          id: String(course._id),
          name: course.name,
          startTime: toHHMM(course.startMin),
          endTime: toHHMM(course.endMin),
        }
      : null,
    holiday: holiday ? { title: holiday.title || '' } : null,
    request: today ? { id: String(today._id), status: today.status, createdAt: today.createdAt } : null,
    counts,
    device: {
      status: deviceStatus(me, deviceId),
      changePending: Boolean(deviceId) && me?.pendingDeviceId === deviceId,
    },
  });
};

// The server takes the decision: the browser only sends the raw reading
const checkLocation = async ({ me, date, reading }) => {
  const cls = me.classId ? await ProgramClass.findById(me.classId).select('location') : null;

  // Same exact point already used by other students of this class today
  const sameCoordinateCount = reading
    ? await AttendanceRequest.countDocuments({
        date,
        className: me.className,
        student: { $ne: me._id },
        'locationReading.latitude': reading.latitude,
        'locationReading.longitude': reading.longitude,
      })
    : 0;

  const check = evaluateLocation({
    classLocation: cls?.location,
    reading,
    sameCoordinateCount,
  });

  return {
    locationReading: reading
      ? {
          latitude: reading.latitude,
          longitude: reading.longitude,
          accuracy: reading.accuracy,
          capturedAt: new Date(reading.capturedAt),
        }
      : undefined,
    locationCheck: check,
  };
};

// inside -> accepted, outside -> rejected, anything unclear -> admin decides
const STATUS_FOR = { inside: 'accepted', outside: 'rejected', uncertain: 'pending' };

const MESSAGE_FOR = {
  accepted: 'Your attendance has been accepted',
  rejected: 'You are outside the class area. Your request was rejected',
  pending: 'Your request has been sent. Waiting for the admin to approve it',
};

const notRegistered = (res) =>
  res.status(403).json({
    message: 'This phone is not registered for your account',
    code: 'device_mismatch',
  });

const deviceInUse = (res) =>
  res.status(403).json({
    message: 'This phone is already used by another student',
    code: 'device_in_use',
  });

// Is this phone already saved for a different student?
const usedByAnotherStudent = (deviceId, userId) =>
  User.exists({ _id: { $ne: userId }, role: 'student', deviceId });

// Saves the phone only if the student has none yet (safe when two requests come together)
const bindDevice = async (userId, deviceId) => {
  const updated = await User.findOneAndUpdate(
    { _id: userId, $or: [{ deviceId: { $exists: false } }, { deviceId: null }, { deviceId: '' }] },
    { deviceId, deviceBoundAt: new Date() }
  );
  if (updated) return true;
  const current = await User.findById(userId).select('deviceId');
  return current?.deviceId === deviceId;
};

export const createMyRequest = async (req, res) => {
  const date = dateInSchoolZone();

  const me = await User.findById(req.user._id).select('className semester classId deviceId');
  if (!me?.className) {
    return res
      .status(400)
      .json({ message: 'You are not assigned to a class yet. Please contact the admin' });
  }

  // Only the saved phone of the student can send attendance
  const { deviceId } = req.body;
  if (me.deviceId && me.deviceId !== deviceId) return notRegistered(res);

  // A phone that belongs to another student cannot be used by this student
  if (!me.deviceId && (await usedByAnotherStudent(deviceId, me._id))) return deviceInUse(res);

  if (await Holiday.exists({ date })) {
    return res.status(400).json({ message: 'Today is a holiday' });
  }

  // Attendance can only be marked for the course that is running right now
  const course = await runningCourseOf(me, date);
  if (!course) {
    return res.status(400).json({ message: 'No course is running right now' });
  }

  const existing = await AttendanceRequest.findOne({
    student: req.user._id,
    courseId: course._id,
    date,
  });
  if (existing && existing.status !== 'rejected') {
    return res
      .status(409)
      .json({ message: 'You have already sent the attendance request for this course' });
  }

  // The first phone that passes the checks is saved for this student
  if (!me.deviceId) {
    const saved = await bindDevice(me._id, deviceId);
    if (!saved) return notRegistered(res);
  }

  const locationFields = await checkLocation({ me, date, reading: req.body?.location });
  const status = STATUS_FOR[locationFields.locationCheck.verdict] || 'pending';
  const decidedAt = status === 'pending' ? undefined : new Date();

  if (existing) {
    // Reject hui request dobara bheji ja sakti hai
    existing.status = status;
    existing.decidedBy = undefined;
    existing.decidedAt = decidedAt;
    existing.markedByAdmin = false; // an earlier change by the admin no longer applies
    existing.adminNote = undefined;
    existing.locationReading = locationFields.locationReading;
    existing.locationCheck = locationFields.locationCheck;
    await existing.save();
    return res.json({
      message: MESSAGE_FOR[status],
      request: { id: String(existing._id), status: existing.status },
    });
  }

  try {
    const created = await AttendanceRequest.create({
      student: req.user._id,
      className: me.className,
      semester: me.semester || undefined,
      courseId: course._id,
      courseName: course.name,
      date,
      status,
      decidedAt,
      ...locationFields,
    });
    res.status(201).json({
      message: MESSAGE_FOR[status],
      request: { id: String(created._id), status: created.status },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: 'You have already sent the attendance request for this course' });
    }
    throw err;
  }
};

export const requestDeviceChange = async (req, res) => {
  const { deviceId } = req.body;

  const me = await User.findById(req.user._id).select('deviceId pendingDeviceId');
  if (!me?.deviceId || me.deviceId === deviceId) {
    return res.status(400).json({ message: 'A phone change request is not needed' });
  }
  if (me.pendingDeviceId === deviceId) {
    return res.status(409).json({ message: 'Your phone change request is already sent' });
  }
  if (await usedByAnotherStudent(deviceId, me._id)) return deviceInUse(res);

  me.pendingDeviceId = deviceId;
  me.pendingDeviceAt = new Date();
  await me.save();

  res.json({ message: 'Phone change request sent. Waiting for the admin' });
};