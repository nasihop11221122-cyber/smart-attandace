import { z } from 'zod';

const dateError = 'Please select a valid date';

// A real calendar day in the form YYYY-MM-DD
export const isRealDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
  );
};

export const createHolidaySchema = z.object({
  // Either single date OR range (startDate & endDate)
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

export const updateWeeklyOffsSchema = z.object({
  days: z.array(z.number().int().min(0).max(6)),
});
