import mongoose from 'mongoose';

// Centre of the class circle: students must be inside it to be marked present
// (the radius is fixed in utils/locationCheck.js)
const locationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false }
);

const programClassSchema = new mongoose.Schema(
  {
    program: { type: String, required: true, trim: true, maxlength: 60 },
    semester: { type: String, required: true, trim: true, maxlength: 30 },
    location: { type: locationSchema, default: undefined },
  },
  { timestamps: true }
);

// Ek program ki ek semester sirf ek baar (capital/small letters ignore)
programClassSchema.index(
  { program: 1, semester: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } }
);

export const classLabel = (c) => `${c.program} · ${c.semester}`;

export default mongoose.model('ProgramClass', programClassSchema);