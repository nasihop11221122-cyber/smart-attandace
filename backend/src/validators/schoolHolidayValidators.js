import { z } from 'zod';
import { isRealDate } from './holidayValidators.js';

const dateError = 'Please select a valid date';

export const createSchoolHolidaySchema = z.object({
  date: z.any().refine(isRealDate, dateError).optional(),
  startDate: z.any().refine(isRealDate, dateError).optional(),
  endDate: z.any().refine(isRealDate, dateError).optional(),
  title: z
    .string()
    .trim()
    .max(60, 'Holiday name must not be more than 60 characters')
    .optional()
    .default(''),
  isAnnual: z.boolean().optional().default(false),
}).refine(
  (data) => Boolean(data.date) || (Boolean(data.startDate) && Boolean(data.endDate)),
  { message: 'Please provide either a single date or both start and end date for range' }
);

export const updateSchoolWeeklyOffsSchema = z.object({
  days: z.array(z.number().int().min(0).max(6)),
});
