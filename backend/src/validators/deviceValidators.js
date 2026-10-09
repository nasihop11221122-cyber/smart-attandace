import { z } from 'zod';

// Random id made by the browser (letters, numbers and dashes only)
export const DEVICE_ID_REGEX = /^[A-Za-z0-9-]{16,64}$/;

// Works the same in every zod version, also when the field is missing
export const deviceIdField = z
  .any()
  .refine(
    (v) => typeof v === 'string' && DEVICE_ID_REGEX.test(v),
    'Your phone could not be identified. Please refresh the page'
  );

export const deviceChangeSchema = z.object({ deviceId: deviceIdField });

export const deviceChangeDecisionSchema = z.object({
  decision: z.string().refine((v) => ['accept', 'reject'].includes(v), 'Decision is not valid'),
});