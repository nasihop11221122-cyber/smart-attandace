import { z } from 'zod';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must not be more than 72 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().trim().toLowerCase().email('Please enter a valid email'),
  password,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required').max(72),
});

export const updatePrincipalSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().trim().toLowerCase().email('Please enter a valid email'),
  password: password.optional(),
});

export const profileSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60).optional(),
    email: z.string().trim().toLowerCase().email('Please enter a valid email').optional(),
    password: password.optional(),
    currentPassword: z.string().min(1, 'Current password is required').max(72).optional(),
  })
  .refine((d) => d.name !== undefined || d.email !== undefined || d.password !== undefined, {
    message: 'Please provide at least one field to update',
  })
  .refine((d) => d.password === undefined || d.currentPassword !== undefined, {
    message: 'Current password is required',
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email'),
});

export const resetPasswordSchema = z.object({
  password,
});