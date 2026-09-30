import { Router } from 'express';
import { getClasses, createClass, deleteClass } from '../controllers/classController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { classSchema } from '../validators/classValidators.js';

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

router.get('/', wrap(getClasses));
router.post('/', validate(classSchema), wrap(createClass));
router.delete('/:id', wrap(deleteClass));

export default router;