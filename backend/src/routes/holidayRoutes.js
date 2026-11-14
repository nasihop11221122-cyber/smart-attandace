import { Router } from 'express';
import {
  getHolidays,
  createHoliday,
  deleteHoliday,
  updateWeeklyOffs,
} from '../controllers/holidayController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createHolidaySchema,
  updateWeeklyOffsSchema,
} from '../validators/holidayValidators.js';

const router = Router();

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
router.put('/weekly-offs', validate(updateWeeklyOffsSchema), wrap(updateWeeklyOffs));
router.delete('/:id', wrap(deleteHoliday));

export default router;
