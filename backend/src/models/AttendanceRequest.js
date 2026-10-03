import mongoose from 'mongoose';

const attendanceRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    className: { type: String, required: true, trim: true },
    semester: { type: String, trim: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

// Ek student ki ek din ki sirf ek request
attendanceRequestSchema.index({ student: 1, date: 1 }, { unique: true });
attendanceRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('AttendanceRequest', attendanceRequestSchema);