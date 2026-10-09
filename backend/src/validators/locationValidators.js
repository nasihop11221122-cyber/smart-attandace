import { z } from 'zod';
import { deviceIdField } from './deviceValidators.js';

// Circle saved on a class by the admin
export const classLocationSchema = z.object({
  latitude: z.number().min(-90, 'Latitude is not valid').max(90, 'Latitude is not valid'),
  longitude: z.number().min(-180, 'Longitude is not valid').max(180, 'Longitude is not valid'),
  radius: z
    .number()
    .min(50, 'Radius must be at least 50 meters')
    .max(1000, 'Radius must not be more than 1000 meters')
    .default(100),
});

// Raw GPS reading sent by the student's browser. The decision is never taken from the client.
const readingSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).max(1000000),
  capturedAt: z.number().int(),
});

// A bad or missing reading must not block the request, it just goes to the admin as pending
export const studentRequestSchema = z.object({
  location: readingSchema.optional().catch(undefined),
  deviceId: deviceIdField,
});