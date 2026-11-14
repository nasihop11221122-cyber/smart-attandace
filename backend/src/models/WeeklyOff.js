import mongoose from 'mongoose';

const weeklyOffSchema = new mongoose.Schema(
  {
    // 'college' for Admin / Online university, 'school' for Principal / Physical school
    scope: { type: String, enum: ['college', 'school'], required: true, unique: true },
    // Array of day indices: 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
    days: {
      type: [Number],
      default: [0], // Default Sunday off
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.every((n) => Number.isInteger(n) && n >= 0 && n <= 6),
        message: 'Days must be integers between 0 (Sunday) and 6 (Saturday)',
      },
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('WeeklyOff', weeklyOffSchema);
