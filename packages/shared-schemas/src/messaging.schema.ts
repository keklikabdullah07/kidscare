import { z } from 'zod';

export const conversationStatusSchema = z.enum(['OPEN', 'CLOSED', 'ARCHIVED']);
export const conversationCategorySchema = z.enum([
  'ACIL',
  'SAGLIK',
  'IZIN',
  'TESLIM',
  'GUNLUK_BILGI',
  'DUYURU',
  'ODEME',
  'RANDEVU',
]);

export const conversationCreateSchema = z
  .object({
    subject: z.string().min(1).max(200),
    category: conversationCategorySchema,
    participantIds: z.array(z.string().min(1)).min(1),
    studentId: z.string().min(1).optional(),
    isCritical: z.boolean().optional(),
    initialMessage: z.string().min(1).max(2000),
  })
  .strict();

export const messageCreateSchema = z
  .object({
    content: z.string().min(1).max(2000),
    isCritical: z.boolean().optional(),
  })
  .strict();

export const conversationStatusUpdateSchema = z
  .object({
    status: conversationStatusSchema,
  })
  .strict();

export const parentRequestTypeSchema = z.enum([
  'IZIN',
  'BILGI_TALEP',
  'DEGISIKLIK',
  'DIGER',
]);

export const parentRequestCreateSchema = z
  .object({
    studentId: z.string().min(1).optional(),
    type: parentRequestTypeSchema,
    subject: z.string().min(1).max(200),
    description: z.string().min(1).max(2000),
  })
  .strict();

export const parentRequestResolveSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED']),
    resolutionNote: z.string().max(500).optional(),
  })
  .strict();

export type ConversationStatus = z.infer<typeof conversationStatusSchema>;
export type ConversationCategory = z.infer<typeof conversationCategorySchema>;
export type ConversationCreate = z.infer<typeof conversationCreateSchema>;
export type MessageCreate = z.infer<typeof messageCreateSchema>;
export type ConversationStatusUpdate = z.infer<typeof conversationStatusUpdateSchema>;
export type ParentRequestType = z.infer<typeof parentRequestTypeSchema>;
export type ParentRequestCreate = z.infer<typeof parentRequestCreateSchema>;
export type ParentRequestResolve = z.infer<typeof parentRequestResolveSchema>;
