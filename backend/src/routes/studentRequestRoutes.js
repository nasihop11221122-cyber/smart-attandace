import { Router } from 'express';
import {
  getMyRequest,
  createMyRequest,
  requestDeviceChange,
} from '../controllers/onlineRequestController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { studentRequestSchema } from '../validators/locationValidators.js';
import { deviceChangeSchema } from '../validators/deviceValidators.js';

const router = Router();

// Express 4 me async errors ko catch karne ke liye wrapper
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const onlyStudent = (req, res, next) => {
  if (req.user?.role !== 'student') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

router.use(protect, onlyStudent);

router.get('/', wrap(getMyRequest));
router.post('/', validate(studentRequestSchema), wrap(createMyRequest));
router.post('/device-change', validate(deviceChangeSchema), wrap(requestDeviceChange));

export default router;