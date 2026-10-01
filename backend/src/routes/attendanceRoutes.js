import { Router } from 'express';
import {
  getAttendance,
  saveDraft,
  createAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { attendanceSchema } from '../validators/attendanceValidators.js';

const router = Router();

// Express 4 me async errors ko catch karne ke liye wrapper
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const onlyTeacher = (req, res, next) => {
  if (req.user?.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

router.use(protect, onlyTeacher);

router.get('/', wrap(getAttendance));
router.put('/draft', validate(attendanceSchema), wrap(saveDraft));
router.post('/', validate(attendanceSchema), wrap(createAttendance));

export default router;