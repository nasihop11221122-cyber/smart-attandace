import { Router } from 'express';
import {
  getStudents,
  createStudent,
  bulkCreateStudents,
  updateStudent,
  deleteStudent,
  graduateClass,
  getGraduatedStudents,
  promoteSchoolClass,
} from '../controllers/studentController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { studentSchema, bulkStudentSchema } from '../validators/studentValidators.js';

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

router.get('/', wrap(getStudents));
router.post('/', validate(studentSchema), wrap(createStudent));
router.post('/bulk', validate(bulkStudentSchema), wrap(bulkCreateStudents));
router.get('/graduated', wrap(getGraduatedStudents));
router.post('/graduate', wrap(graduateClass));
router.post('/promote', wrap(promoteSchoolClass));
router.patch('/:id', validate(studentSchema), wrap(updateStudent));
router.delete('/:id', wrap(deleteStudent));

export default router;