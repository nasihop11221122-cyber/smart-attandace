import { z } from 'zod';

export const classSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Class name is required')
    .max(30, 'Class name must not be more than 30 characters'),
});