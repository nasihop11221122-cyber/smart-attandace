import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getStudentByRollNo, getPublicClasses } from '../controllers/publicController.js';

const router = Router();

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again after 15 minutes.' },
});

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/classes', publicLimiter, wrap(getPublicClasses));
router.get('/student-by-rollno', publicLimiter, wrap(getStudentByRollNo));

export default router;
