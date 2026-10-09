import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProgramClass', required: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    startMin: { type: Number, required: true, min: 0, max: 1439 },
    endMin: { type: Number, required: true, min: 1, max: 1440 },
    // Days of the week the course runs: 0 = Sunday ... 6 = Saturday
    days: { type: [{ type: Number, min: 0, max: 6 }], default: undefined },
    // The course runs for 6 months from the day it is created (YYYY-MM-DD)
    startDate: { type: String, match: /^\d{4}-\d{2}-\d{2}$/ },
    endDate: { type: String, match: /^\d{4}-\d{2}-\d{2}$/ },
  },
  { timestamps: true }
);

// Ek class me same course ka naam dobara nahi (capital/small letters ignore)
courseSchema.index(
  { classId: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

export default mongoose.model('Course', courseSchema);