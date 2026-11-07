import { z } from 'zod';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must not be more than 72 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

const fullName = z.string().trim().min(2, 'Name must be at least 2 characters').max(60);
const rollNo = z
  .string()
  .trim()
  .min(1, 'Roll number is required')
  .max(30, 'Roll number must not be more than 30 characters');
const classId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Please select a class');
const email = z.string().trim().toLowerCase().email('Please enter a valid email');

export const onlineStudentSchema = z.object({
  name: fullName,
  rollNo,
  classId,
  email,
  password,
});

export const onlineStudentUpdateSchema = z.object({
  name: fullName,
  rollNo,
  classId,
  email,
  password: password.optional(),
});

export const bulkOnlineStudentSchema = z.object({
  classId,
  students: z
    .array(
      z.object({
        name: z.string().trim().min(1, 'Name is required').max(60),
        rollNo: z.string().trim().min(1, 'Roll number is required').max(30),
        email: z.string().trim().toLowerCase().email('Valid email is required'),
        password: z.string().min(6).max(72).optional().or(z.literal('')),
      })
    )
    .min(1, 'At least 1 student is required')
    .max(1000, 'Maximum 1000 students allowed in one bulk import'),
});
