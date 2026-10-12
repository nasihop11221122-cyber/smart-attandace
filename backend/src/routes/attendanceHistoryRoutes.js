import { Router } from 'express';
import { getAttendanceHistory } from '../controllers/attendanceHistoryController.js';
import { getHistoryExport } from '../controllers/attendanceExportController.js';
import { changeRecordStatus } from '../controllers/attendanceCorrectionController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { changeStatusSchema } from '../validators/correctionValidators.js';

const router = Router();

// Express 4 me async errors ko catch karne ke liye wrapper
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const onlyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

router.use(protect, onlyAdmin);

router.get('/export', wrap(getHistoryExport));
router.get('/', wrap(getAttendanceHistory));
router.patch('/:id', validate(changeStatusSchema), wrap(changeRecordStatus));

export default router;