import { Router } from 'express';
import { getHolidays, createHoliday, deleteHoliday } from '../controllers/holidayController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createHolidaySchema } from '../validators/holidayValidators.js';

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

router.get('/', wrap(getHolidays));
router.post('/', validate(createHolidaySchema), wrap(createHoliday));
router.delete('/:id', wrap(deleteHoliday));

export default router;