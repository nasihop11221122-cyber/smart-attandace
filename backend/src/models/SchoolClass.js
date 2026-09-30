import mongoose from 'mongoose';

const schoolClassSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 30 },
  },
  { timestamps: true }
);

// Same class name (capital/small letters ignore) dobara add nahi hoga
schoolClassSchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export default mongoose.model('SchoolClass', schoolClassSchema);