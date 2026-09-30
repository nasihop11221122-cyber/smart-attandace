import { Router } from 'express';
import {
  createTeacher,
  getTeachers,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { teacherSchema, teacherUpdateSchema } from '../validators/teacherValidators.js';

const router = Router();

// Express 4 me async errors ko catch karne ke liye wrapper
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const onlyPrincipal = (req, res, next) => {
  if (req.user?.role !== 'principal') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

router.use(protect, onlyPrincipal);

router.get('/', wrap(getTeachers));
router.post('/', validate(teacherSchema), wrap(createTeacher));
router.patch('/:id', validate(teacherUpdateSchema), wrap(updateTeacher));
router.delete('/:id', wrap(deleteTeacher));

export default router;