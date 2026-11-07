import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    fatherName: { type: String, required: true, trim: true, maxlength: 60 },
    rollNo: { type: Number, required: true, min: 1 },
    className: { type: String, trim: true, maxlength: 60 },
    status: { type: String, enum: ['active', 'graduated'], default: 'active' },
    graduatedAt: { type: Date },
    graduatedClass: { type: String },
    certificateId: { type: String },
    finalAttendancePercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Ek class me ek roll number sirf ek student ka ho sakta hai
studentSchema.index({ className: 1, rollNo: 1 }, { unique: true });

export default mongoose.model('Student', studentSchema);