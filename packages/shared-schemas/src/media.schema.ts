import { z } from 'zod';

export const mediaCategorySchema = z.enum([
  'STUDENT_AVATAR',
  'DAILY_REPORT',
  'ACTIVITY',
  'PORTFOLIO',
  'HEALTH_RECORD',
  'GENERAL',
]);

export const uploadMediaOptionsSchema = z.object({
  category: mediaCategorySchema.optional(),
});

export const deleteMediaParamsSchema = z.object({
  id: z.string().min(1, 'Medya ID zorunludur'),
});

export type MediaCategorySchema = z.infer<typeof mediaCategorySchema>;
export type UploadMediaOptionsSchema = z.infer<typeof uploadMediaOptionsSchema>;
export type DeleteMediaParamsSchema = z.infer<typeof deleteMediaParamsSchema>;
