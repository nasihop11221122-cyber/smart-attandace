import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['present', 'absent', 'leave'], required: true },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    className: { type: String, required: true, trim: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    records: [recordSchema],
  },
  { timestamps: true }
);

// Ek class ki ek din me sirf ek attendance
attendanceSchema.index({ className: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);