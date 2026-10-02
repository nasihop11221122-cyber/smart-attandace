import { Router } from 'express';
import {
  getOnlineClasses,
  createOnlineClass,
  deleteOnlineClass,
} from '../controllers/onlineClassController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { classSchema } from '../validators/classValidators.js';

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

router.get('/', wrap(getOnlineClasses));
router.post('/', validate(classSchema), wrap(createOnlineClass));
router.delete('/:id', wrap(deleteOnlineClass));

export default router;