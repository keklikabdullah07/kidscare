import { z } from 'zod';

export const incidentCategorySchema = z.enum([
  'DUSME',
  'YARALANMA',
  'HASTALIK',
  'DAVRANIS',
  'KAZA',
  'DIGER',
]);

export const incidentRecordCreateSchema = z
  .object({
    studentId: z.string().min(1),
    category: incidentCategorySchema,
    occurredAt: z.coerce.date(),
    description: z.string().min(1).max(2000),
    actionTaken: z.string().max(1000).optional(),
    parentNotified: z.boolean().optional(),
  })
  .strict();

export const incidentRecordUpdateSchema = z
  .object({
    actionTaken: z.string().max(1000).optional(),
    parentNotified: z.boolean().optional(),
  })
  .strict();

export type IncidentCategory = z.infer<typeof incidentCategorySchema>;
export type IncidentRecordCreate = z.infer<typeof incidentRecordCreateSchema>;
export type IncidentRecordUpdate = z.infer<typeof incidentRecordUpdateSchema>;
