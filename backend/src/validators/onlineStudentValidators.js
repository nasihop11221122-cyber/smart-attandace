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
const className = z.string().trim().min(1, 'Class is required').max(60);
const email = z.string().trim().toLowerCase().email('Please enter a valid email');

export const onlineStudentSchema = z.object({
  name: fullName,
  rollNo,
  className,
  email,
  password,
});

export const onlineStudentUpdateSchema = z.object({
  name: fullName,
  rollNo,
  className,
  email,
  password: password.optional(),
});