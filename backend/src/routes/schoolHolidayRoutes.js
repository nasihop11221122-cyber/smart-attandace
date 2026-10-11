import { Router } from 'express';
import {
  getSchoolHolidays,
  createSchoolHoliday,
  deleteSchoolHoliday,
} from '../controllers/schoolHolidayController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createSchoolHolidaySchema } from '../validators/schoolHolidayValidators.js';

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

router.get('/', wrap(getSchoolHolidays));
router.post('/', validate(createSchoolHolidaySchema), wrap(createSchoolHoliday));
router.delete('/:id', wrap(deleteSchoolHoliday));

export default router;