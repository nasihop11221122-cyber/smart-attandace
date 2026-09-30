import { Router } from 'express';
import {
  createPrincipal,
  getPrincipals,
  updatePrincipal,
  deletePrincipal,
} from '../controllers/principalController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, updatePrincipalSchema } from '../validators/authValidators.js';

const router = Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.use(protect, authorize('super_admin'));

router.get('/', wrap(getPrincipals));
router.post('/', validate(registerSchema), wrap(createPrincipal));
router.patch('/:id', validate(updatePrincipalSchema), wrap(updatePrincipal));
router.delete('/:id', wrap(deletePrincipal));

export default router;