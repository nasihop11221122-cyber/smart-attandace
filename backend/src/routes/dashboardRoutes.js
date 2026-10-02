import { Router } from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { unlockAttendance } from '../controllers/unlockController.js';
import { protect } from '../middleware/auth.js';

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

router.get('/', wrap(getDashboard));
router.post('/attendance/:id/unlock', wrap(unlockAttendance));

export default router;