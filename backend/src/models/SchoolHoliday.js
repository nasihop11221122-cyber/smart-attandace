import mongoose from 'mongoose';

const schoolHolidaySchema = new mongoose.Schema(
  {
    // A day off for the whole school (YYYY-MM-DD)
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    title: { type: String, trim: true, maxlength: 60, default: '' },
    isAnnual: { type: Boolean, default: false },
    annualMonthDay: { type: String, default: null, match: [/^\d{2}-\d{2}$/, 'Must be MM-DD'] },
  },
  { timestamps: true }
);

// Ek date sirf ek baar chhutti ho sakti hai
schoolHolidaySchema.index({ date: 1 }, { unique: true });
schoolHolidaySchema.index({ isAnnual: 1, annualMonthDay: 1 });

export default mongoose.model('SchoolHoliday', schoolHolidaySchema);
