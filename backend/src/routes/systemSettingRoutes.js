import express from 'express';
import { getSettings, updateSettings } from '../controllers/systemSettingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public / client route to fetch current emergency mode and global template
router.get('/', getSettings);

// Super Admin protected route to update settings
router.put('/', protect, authorize('super_admin'), updateSettings);

export default router;

