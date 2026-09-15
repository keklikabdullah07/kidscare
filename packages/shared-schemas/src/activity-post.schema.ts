import { z } from 'zod';

export const createActivityPostSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  classroom: z.string().max(100).optional(),
  activityDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
  tags: z.array(z.string().min(1).max(50)).default([]),
  mediaUrls: z
    .array(z.string().url().or(z.string().min(5)))
    .min(1, 'En az bir fotoğraf veya görsel eklenmelidir'),
  taggedStudentIds: z.array(z.string()).default([]),
});

export const activityFilterQuerySchema = z.object({
  classroom: z.string().optional(),
  studentId: z.string().optional(),
  tag: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateActivityPostInput = z.infer<typeof createActivityPostSchema>;
export type ActivityFilterQueryInput = z.infer<typeof activityFilterQuerySchema>;
