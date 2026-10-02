import { Router } from 'express';
import { getTeachers } from '../controllers/teacherController.js';
import {
  getClassStudents,
  getStudentDays,
  getClassDay,
} from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Express 4 me async errors ko catch karne ke liye wrapper
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const onlySuperAdmin = (req, res, next) => {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

router.use(protect, onlySuperAdmin);

// Sirf dekhne ke liye (GET), koi create, update ya delete nahi
router.get('/teachers', wrap(getTeachers));
router.get('/students', wrap(getClassStudents));
router.get('/student/:id', wrap(getStudentDays));
router.get('/day', wrap(getClassDay));

export default router;