import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { registerFace, verifyFace, faceStatus, removeFace } from '../controllers/faceController.js';

const router = express.Router();

// All routes: student must be logged in
router.use(protect, authorize('student'));

router.get('/status',   faceStatus);
router.post('/register', registerFace);
router.post('/verify',   verifyFace);
router.delete('/remove', removeFace);

export default router;
