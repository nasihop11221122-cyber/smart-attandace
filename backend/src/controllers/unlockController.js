import mongoose from 'mongoose';
import Attendance from '../models/Attendance.js';
import AttendanceDraft from '../models/AttendanceDraft.js';
import { dateInSchoolZone } from '../utils/schoolDate.js';

export const unlockAttendance = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: 'Attendance not found' });
  }

  const attendance = await Attendance.findById(id);
  if (!attendance) return res.status(404).json({ message: 'Attendance not found' });

  if (attendance.date !== dateInSchoolZone()) {
    return res.status(400).json({ message: 'Only the attendance of today can be unlocked' });
  }

  const absent = attendance.records.filter((r) => r.status === 'absent').map((r) => r.student);
  const leave = attendance.records.filter((r) => r.status === 'leave').map((r) => r.student);

  const draftPayload = {
    className: attendance.className,
    date: attendance.date,
    teacher: attendance.teacher,
    absent,
    leave,
    unlockedAt: new Date(),
    unlockedBy: req.user._id,
  };

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await AttendanceDraft.findOneAndUpdate(
        { className: attendance.className, date: attendance.date },
        draftPayload,
        { upsert: true, new: true, setDefaultsOnInsert: true, session }
      );
      await Attendance.deleteOne({ _id: attendance._id }, { session });
    });
  } catch (err) {
    // Graceful fallback for standalone MongoDB deployments where transactions are not supported
    const isTxnUnsupported =
      err.message?.includes('Transactions are not supported') ||
      err.code === 263 ||
      err.codeName === 'OperationNotSupportedInTransaction';

    if (isTxnUnsupported) {
      const saveFallback = () =>
        AttendanceDraft.findOneAndUpdate(
          { className: attendance.className, date: attendance.date },
          draftPayload,
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

      try {
        await saveFallback();
      } catch (upsertErr) {
        if (upsertErr.code === 11000) await saveFallback();
        else throw upsertErr;
      }
      await Attendance.deleteOne({ _id: attendance._id });
    } else {
      throw err;
    }
  } finally {
    await session.endSession();
  }

  res.json({ message: 'Attendance unlocked' });
};