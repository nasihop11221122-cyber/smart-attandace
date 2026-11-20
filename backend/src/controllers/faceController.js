import FaceDescriptor from '../models/FaceDescriptor.js';

const EUCLIDEAN_THRESHOLD = 0.5; // Lower = stricter match

/** Euclidean distance between two 128-float descriptors */
const distance = (a, b) => Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0));

/**
 * POST /api/face/register
 * Body: { descriptor: number[128] }
 * Save or update student's face descriptor.
 */
export const registerFace = async (req, res) => {
  const { descriptor } = req.body;

  if (!Array.isArray(descriptor) || descriptor.length !== 128) {
    return res.status(400).json({ message: 'Invalid face descriptor' });
  }

  await FaceDescriptor.findOneAndUpdate(
    { userId: req.user._id },
    { userId: req.user._id, descriptor },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.json({ message: 'Face registered successfully' });
};

/**
 * POST /api/face/verify
 * Body: { descriptor: number[128] }
 * Match against saved descriptor — returns { match: true/false }
 */
export const verifyFace = async (req, res) => {
  const { descriptor } = req.body;

  if (!Array.isArray(descriptor) || descriptor.length !== 128) {
    return res.status(400).json({ message: 'Invalid face descriptor' });
  }

  const saved = await FaceDescriptor.findOne({ userId: req.user._id });
  if (!saved) {
    return res.status(404).json({ message: 'Face not registered', code: 'NOT_REGISTERED' });
  }

  const dist = distance(descriptor, saved.descriptor);
  const match = dist < EUCLIDEAN_THRESHOLD;

  res.json({ match, distance: Math.round(dist * 1000) / 1000 });
};

/**
 * GET /api/face/status
 * Check if student has a registered face.
 */
export const faceStatus = async (req, res) => {
  const exists = await FaceDescriptor.exists({ userId: req.user._id });
  res.json({ registered: Boolean(exists) });
};

/**
 * DELETE /api/face/remove
 * Remove face descriptor (student wants to re-register).
 */
export const removeFace = async (req, res) => {
  await FaceDescriptor.deleteOne({ userId: req.user._id });
  res.json({ message: 'Face removed' });
};
