import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    // Abhi register hone wala har user super_admin hai (aapki requirement). Baad me isay change kar lena.
    role: { type: String, enum: ['super_admin', 'admin', 'principal', 'teacher', 'student', 'user'], default: 'super_admin' },
    className: { type: String, trim: true, maxlength: 60 },
    rollNo: { type: String, trim: true, maxlength: 30 },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// Database level par sirf ek super_admin allow karta hai (race condition bhi rok deta hai)
userSchema.index(
  { role: 1 },
  { unique: true, partialFilterExpression: { role: 'super_admin' } }
);

// Database level par ek class ka sirf ek teacher (form master) allow karta hai
userSchema.index(
  { className: 1 },
  { unique: true, partialFilterExpression: { role: 'teacher', className: { $type: 'string' } } }
);

// Online system: ek class me ek roll number sirf ek student ka ho sakta hai
userSchema.index(
  { className: 1, rollNo: 1 },
  { unique: true, partialFilterExpression: { role: 'student', rollNo: { $type: 'string' } } }
);

export default mongoose.model('User', userSchema);