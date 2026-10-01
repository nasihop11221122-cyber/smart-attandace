import { z } from 'zod';

export const studentSchema = z.object({
  name: z.string().trim().min(2, 'Student name must be at least 2 characters').max(60),
  fatherName: z.string().trim().min(2, 'Father name must be at least 2 characters').max(60),
  rollNo: z
    .number()
    .int('Roll number must be a whole number')
    .min(1, 'Roll number must be at least 1')
    .max(9999, 'Roll number is too large')
    .optional(),
});