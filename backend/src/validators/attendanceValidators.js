import { z } from 'zod';

const ids = z.array(z.string().regex(/^[a-f0-9]{24}$/, 'Invalid student id')).max(500);

export const attendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  absent: ids,
  leave: ids,
});