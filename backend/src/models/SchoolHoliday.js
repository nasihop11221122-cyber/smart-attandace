import mongoose from 'mongoose';

const schoolHolidaySchema = new mongoose.Schema(
  {
    // A day off for the whole school (YYYY-MM-DD)
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    title: { type: String, trim: true, maxlength: 60, default: '' },
  },
  { timestamps: true }
);

// Ek date sirf ek baar chhutti ho sakti hai
schoolHolidaySchema.index({ date: 1 }, { unique: true });

export default mongoose.model('SchoolHoliday', schoolHolidaySchema);