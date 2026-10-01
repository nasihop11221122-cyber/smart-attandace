import mongoose from 'mongoose';

const attendanceDraftSchema = new mongoose.Schema(
  {
    className: { type: String, required: true, trim: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    absent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    leave: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  },
  { timestamps: true }
);

// Ek class ka ek din ka sirf ek draft
attendanceDraftSchema.index({ className: 1, date: 1 }, { unique: true });

// Purane adhure drafts 7 din baad khud delete ho jate hain
attendanceDraftSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export default mongoose.model('AttendanceDraft', attendanceDraftSchema);