import mongoose from 'mongoose';

const attendanceRequestSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    className: { type: String, required: true, trim: true },
    semester: { type: String, trim: true },
    // The course this attendance is for. The name is saved too, so the record stays readable
    // after the course is deleted.
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    courseName: { type: String, trim: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decidedAt: { type: Date },

    // Raw GPS reading sent by the student's browser
    locationReading: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      capturedAt: Date,
    },
    // Result decided by the server
    locationCheck: {
      verdict: { type: String, enum: ['inside', 'outside', 'uncertain'] },
      distance: Number,
      flags: [String],
    },
  },
  { timestamps: true }
);

// Ek student ki ek course ki ek din me sirf ek request
attendanceRequestSchema.index({ student: 1, courseId: 1, date: 1 }, { unique: true });
attendanceRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('AttendanceRequest', attendanceRequestSchema);