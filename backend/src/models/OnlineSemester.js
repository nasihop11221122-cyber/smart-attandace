import mongoose from 'mongoose';

const onlineSemesterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 30 },
  },
  { timestamps: true }
);

// Same semester name (capital/small letters ignore) dobara add nahi hoga
onlineSemesterSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export default mongoose.model('OnlineSemester', onlineSemesterSchema);