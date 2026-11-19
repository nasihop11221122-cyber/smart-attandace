import express from 'express';
import { protect } from '../middleware/auth.js';
import { getVapidKey, subscribe, unsubscribe } from '../controllers/pushController.js';

const router = express.Router();

// Public: browser needs this key before it can subscribe
router.get('/vapid-public-key', getVapidKey);

// Protected: student must be logged in
router.post('/subscribe',   protect, subscribe);
router.delete('/unsubscribe', protect, unsubscribe);

export default router;
