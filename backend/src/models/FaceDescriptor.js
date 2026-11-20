import mongoose from 'mongoose';

/**
 * Stores face recognition descriptors for online (college) students.
 * A descriptor is 128 float numbers — NO actual photo is stored.
 */
const faceDescriptorSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    descriptor: { type: [Number], required: true }, // 128 floats from face-api
  },
  { timestamps: true }
);

export default mongoose.model('FaceDescriptor', faceDescriptorSchema);
