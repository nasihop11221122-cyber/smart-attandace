import { z } from 'zod';
import { classLocationSchema } from './locationValidators.js';

export const createClassSchema = z.object({
  program: z
    .string()
    .trim()
    .min(1, 'Program name is required')
    .max(60, 'Program name must not be more than 60 characters'),
  semester: z
    .string()
    .trim()
    .min(1, 'Semester name is required')
    .max(30, 'Semester name must not be more than 30 characters'),
  location: classLocationSchema.optional(),
});