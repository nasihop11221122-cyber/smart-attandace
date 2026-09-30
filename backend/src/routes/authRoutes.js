import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  me,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  profileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/authValidators.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again after 15 minutes' },
});

// Express 4 me async errors ko catch karne ke liye wrapper
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/register', authLimiter, validate(registerSchema), wrap(register));
router.post('/login', authLimiter, validate(loginSchema), wrap(login));
router.post('/logout', logout);
router.get('/me', protect, me);
router.patch('/profile', protect, validate(profileSchema), wrap(updateProfile));
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), wrap(forgotPassword));
router.post('/reset-password/:token', authLimiter, validate(resetPasswordSchema), wrap(resetPassword));

export default router;