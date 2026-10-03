import { Router } from 'express';
import { getPendingRequests, decideRequest } from '../controllers/onlineRequestController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { decisionSchema } from '../validators/requestValidators.js';

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

router.get('/', wrap(getPendingRequests));
router.patch('/:id', validate(decisionSchema), wrap(decideRequest));

export default router;