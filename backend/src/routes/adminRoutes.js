import { Router } from 'express';
import {
  createAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, updatePrincipalSchema } from '../validators/authValidators.js';

const router = Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(protect, authorize('super_admin'));

router.get('/', wrap(getAdmins));
router.post('/', validate(registerSchema), wrap(createAdmin));
router.patch('/:id', validate(updatePrincipalSchema), wrap(updateAdmin));
router.delete('/:id', wrap(deleteAdmin));

export default router;