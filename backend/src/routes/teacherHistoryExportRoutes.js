import { Router } from 'express';
import { getTeacherHistoryExport } from '../controllers/teacherHistoryExportController.js';
import { protect } from '../middleware/auth.js';

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

router.get('/', wrap(getTeacherHistoryExport));

export default router;