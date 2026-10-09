import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema(
  {
    // A day off for the whole college (YYYY-MM-DD)
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    title: { type: String, trim: true, maxlength: 60, default: '' },
  },
  { timestamps: true }
);

// Ek date sirf ek baar chhutti ho sakti hai
holidaySchema.index({ date: 1 }, { unique: true });

export default mongoose.model('Holiday', holidaySchema);