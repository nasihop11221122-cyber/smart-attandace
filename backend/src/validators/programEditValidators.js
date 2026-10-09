import { z } from 'zod';
import { classLocationSchema } from './locationValidators.js';

export const updateClassSchema = z.object({
  semester: z.string().trim().min(1, 'Semester name is required').max(30),
  location: classLocationSchema.optional(),
});

export const renameProgramSchema = z.object({
  name: z.string().trim().min(1, 'Program name is required').max(60),
  newName: z.string().trim().min(1, 'Program name is required').max(60),
});