import { Router } from 'express';
import {
  getOnlineStudents,
  createOnlineStudent,
  updateOnlineStudent,
  deleteOnlineStudent,
} from '../controllers/onlineStudentController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  onlineStudentSchema,
  onlineStudentUpdateSchema,
} from '../validators/onlineStudentValidators.js';

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

router.get('/', wrap(getOnlineStudents));
router.post('/', validate(onlineStudentSchema), wrap(createOnlineStudent));
router.patch('/:id', validate(onlineStudentUpdateSchema), wrap(updateOnlineStudent));
router.delete('/:id', wrap(deleteOnlineStudent));

export default router;