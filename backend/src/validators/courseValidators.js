import { z } from 'zod';

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Please enter a valid time');
const name = z
  .string()
  .trim()
  .min(1, 'Course name is required')
  .max(60, 'Course name must not be more than 60 characters');

// Days of the week: 0 = Sunday ... 6 = Saturday. Duplicates are removed.
const dayError = 'Please select at least one day';
const days = z
  .array(z.number({ message: dayError }).int(dayError).min(0, dayError).max(6, dayError), { message: dayError })
  .min(1, dayError)
  .transform((list) => [...new Set(list)].sort((a, b) => a - b));

const endAfterStart = (data) => data.endTime > data.startTime;
const rangeError = { message: 'End time must be after the start time', path: ['endTime'] };

export const createCourseSchema = z
  .object({
    classId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Please select a class'),
    name,
    startTime: time,
    endTime: time,
    days,
  })
  .refine(endAfterStart, rangeError);

export const updateCourseSchema = z
  .object({
    name,
    startTime: time,
    endTime: time,
    days,
  })
  .refine(endAfterStart, rangeError);