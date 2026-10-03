import { z } from 'zod';

export const decisionSchema = z.object({
  decision: z.enum(['accept', 'reject']),
});