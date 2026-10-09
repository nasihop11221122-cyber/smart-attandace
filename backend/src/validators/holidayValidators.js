import { z } from 'zod';

const dateError = 'Please select a valid date';

// A real calendar day in the form YYYY-MM-DD (so 2026-02-31 is not accepted)
const isRealDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
  );
};

export const createHolidaySchema = z.object({
  date: z.any().refine(isRealDate, dateError),
  title: z
    .string()
    .trim()
    .max(60, 'Holiday name must not be more than 60 characters')
    .optional()
    .default(''),
});