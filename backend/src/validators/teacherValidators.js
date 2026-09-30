import { z } from 'zod';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must not be more than 72 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const teacherSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  className: z.string().trim().min(1, 'Class name is required').max(60),
  email: z.string().trim().toLowerCase().email('Please enter a valid email'),
  password,
});

export const teacherUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  className: z.string().trim().min(1, 'Class name is required').max(60),
  email: z.string().trim().toLowerCase().email('Please enter a valid email'),
  password: password.optional(),
});