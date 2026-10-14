import { z } from 'zod';

export const eventConsentStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED']);
export const eventConsentDecisionSchema = z.enum(['APPROVED', 'DECLINED']);

export const createEventConsentInputSchema = z
  .object({
    classroomId: z.string().min(1).optional(),
    title: z.string().min(2).max(200),
    eventDate: z.string().min(1),
    location: z.string().max(200).optional(),
    price: z.number().min(0).optional(),
    description: z.string().max(2000).optional(),
    deadline: z.string().optional(),
  })
  .strict();

export const respondEventConsentInputSchema = z
  .object({
    studentId: z.string().min(1),
    decision: eventConsentDecisionSchema,
    notes: z.string().max(500).optional(),
  })
  .strict();

export const eventConsentResponseSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  consentId: z.string(),
  studentId: z.string(),
  parentUserId: z.string(),
  decision: eventConsentDecisionSchema,
  notes: z.string().nullable().optional(),
  respondedAt: z.string(),
});

export const eventConsentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  classroomId: z.string().nullable().optional(),
  title: z.string(),
  eventDate: z.string(),
  location: z.string().nullable().optional(),
  price: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
  status: eventConsentStatusSchema,
  createdById: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type EventConsentStatus = z.infer<typeof eventConsentStatusSchema>;
export type EventConsentDecision = z.infer<typeof eventConsentDecisionSchema>;
export type CreateEventConsentInput = z.infer<typeof createEventConsentInputSchema>;
export type RespondEventConsentInput = z.infer<typeof respondEventConsentInputSchema>;
export type EventConsentResponse = z.infer<typeof eventConsentResponseSchema>;
export type EventConsent = z.infer<typeof eventConsentSchema>;
