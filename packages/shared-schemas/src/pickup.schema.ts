import { z } from 'zod';

export const pickupContactCreateSchema = z
  .object({
    studentId: z.string().min(1),
    fullName: z.string().min(1).max(100),
    relation: z.string().min(1).max(50),
    phone: z.string().min(5).max(30),
    identityNote: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const pickupContactUpdateSchema = z
  .object({
    fullName: z.string().min(1).max(100).optional(),
    relation: z.string().min(1).max(50).optional(),
    phone: z.string().min(5).max(30).optional(),
    identityNote: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const pickupAuthorizationStatusSchema = z.enum([
  'PENDING',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'REVOKED',
]);

export const pickupAuthorizationCreateSchema = z
  .object({
    studentId: z.string().min(1),
    pickupContactId: z.string().min(1).optional(),
    validFrom: z.coerce.date().optional(),
    validUntil: z.coerce.date().optional(),
    note: z.string().max(500).optional(),
  })
  .strict();

export const pickupAuthorizationReviewSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED']),
    validFrom: z.coerce.date().optional(),
    validUntil: z.coerce.date().optional(),
    note: z.string().max(500).optional(),
  })
  .strict();

export const pickupVerificationMethodSchema = z.enum([
  'ID_CHECK',
  'PHONE_CONFIRM',
  'PASSWORD',
  'KNOWN_FACE',
  'OTHER',
]);

export const pickupEventCreateSchema = z
  .object({
    studentId: z.string().min(1),
    pickupContactId: z.string().min(1).optional(),
    authorizationId: z.string().min(1).optional(),
    pickupPersonName: z.string().min(1).max(100),
    pickupPersonPhone: z.string().max(30).optional(),
    verificationMethod: pickupVerificationMethodSchema,
    note: z.string().max(500).optional(),
  })
  .strict();

export type PickupContactCreate = z.infer<typeof pickupContactCreateSchema>;
export type PickupContactUpdate = z.infer<typeof pickupContactUpdateSchema>;
export type PickupAuthorizationStatus = z.infer<typeof pickupAuthorizationStatusSchema>;
export type PickupAuthorizationCreate = z.infer<typeof pickupAuthorizationCreateSchema>;
export type PickupAuthorizationReview = z.infer<typeof pickupAuthorizationReviewSchema>;
export type PickupVerificationMethod = z.infer<typeof pickupVerificationMethodSchema>;
export type PickupEventCreate = z.infer<typeof pickupEventCreateSchema>;
