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

export const bulkStudentSchema = z.object({
  students: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Name is required').max(60),
        fatherName: z.string().trim().min(1, 'Father name is required').max(60),
        rollNo: z.number().int().min(1).max(99999),
      })
    )
    .min(1, 'At least 1 student is required')
    .max(1000, 'Maximum 1000 students allowed in one bulk import'),
});
