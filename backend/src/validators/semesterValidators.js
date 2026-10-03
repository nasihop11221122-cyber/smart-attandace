import { z } from 'zod';

export const semesterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Semester name is required')
    .max(30, 'Semester name must not be more than 30 characters'),
});