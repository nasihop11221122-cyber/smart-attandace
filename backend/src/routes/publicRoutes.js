import { Router } from 'express';
import { getStudentByRollNo } from '../controllers/publicController.js';

const router = Router();

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/student-by-rollno', wrap(getStudentByRollNo));

export default router;
