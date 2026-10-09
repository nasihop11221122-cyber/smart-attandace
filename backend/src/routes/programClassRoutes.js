import { Router } from 'express';
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  renameProgram,
  deleteProgram,
} from '../controllers/programClassController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createClassSchema } from '../validators/programClassValidators.js';
import { updateClassSchema, renameProgramSchema } from '../validators/programEditValidators.js';

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

router.get('/', wrap(getClasses));
router.post('/', validate(createClassSchema), wrap(createClass));

// Program level (must stay above the /:id routes)
router.patch('/program', validate(renameProgramSchema), wrap(renameProgram));
router.delete('/program', wrap(deleteProgram));

// Semester (class) level
router.patch('/:id', validate(updateClassSchema), wrap(updateClass));
router.delete('/:id', wrap(deleteClass));

export default router;