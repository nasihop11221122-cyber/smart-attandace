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

  const save = () =>
    AttendanceDraft.findOneAndUpdate(
      { className: attendance.className, date: attendance.date },
      {
        teacher: attendance.teacher,
        absent,
        leave,
        unlockedAt: new Date(),
        unlockedBy: req.user._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

  try {
    await save();
  } catch (err) {
    if (err.code === 11000) await save();
    else throw err;
  }

  await attendance.deleteOne();

  res.json({ message: 'Attendance unlocked' });
};