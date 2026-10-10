import { z } from 'zod';

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// A real calendar day in the form YYYY-MM-DD
const isRealDate = (value) => {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

// Optional reason. Works the same in every zod version, also when the field is missing.
const reasonField = z
  .any()
  .refine(
    (v) => v === undefined || v === null || (typeof v === 'string' && v.trim().length <= 200),
    'The reason must be 200 characters or less'
  )
  .optional();

// Change the status of a saved record
export const changeStatusSchema = z.object({
  status: z
    .any()
    .refine((v) => v === 'present' || v === 'absent', 'Please select Present or Absent'),
  reason: reasonField,
});

// Mark a student present for a course on a date
export const markPresentSchema = z.object({
  courseId: z
    .any()
    .refine((v) => typeof v === 'string' && OBJECT_ID_RE.test(v), 'Please select a course'),
  date: z.any().refine((v) => isRealDate(v), 'Please select a valid date'),
  reason: reasonField,
});