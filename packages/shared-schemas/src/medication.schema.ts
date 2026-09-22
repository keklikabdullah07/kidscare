import { z } from 'zod';

export const standaloneMedicationStatusSchema = z.enum([
  'REQUESTED',
  'APPROVED',
  'SCHEDULED',
  'GIVEN',
  'SKIPPED',
  'REJECTED',
]);

export const medicationRecordCreateSchema = z
  .object({
    studentId: z.string().min(1),
    medicationName: z.string().min(1).max(100),
    dosage: z.string().min(1).max(100),
    instructions: z.string().max(500).optional(),
    scheduledAt: z.coerce.date().optional(),
    parentApprovalNote: z.string().max(500).optional(),
  })
  .strict();

export const medicationRecordApproveSchema = z
  .object({
    note: z.string().max(500).optional(),
  })
  .strict();

export const medicationRecordRejectSchema = z
  .object({
    reason: z.string().min(1).max(500),
  })
  .strict();

export const medicationRecordGivenSchema = z
  .object({
    givenAt: z.coerce.date().optional(),
    note: z.string().max(500).optional(),
  })
  .strict();

export const medicationRecordSkipSchema = z
  .object({
    reason: z.string().min(1).max(500),
  })
  .strict();

export type StandaloneMedicationStatus = z.infer<typeof standaloneMedicationStatusSchema>;
export type MedicationRecordCreate = z.infer<typeof medicationRecordCreateSchema>;
export type MedicationRecordApprove = z.infer<typeof medicationRecordApproveSchema>;
export type MedicationRecordReject = z.infer<typeof medicationRecordRejectSchema>;
export type MedicationRecordGiven = z.infer<typeof medicationRecordGivenSchema>;
export type MedicationRecordSkip = z.infer<typeof medicationRecordSkipSchema>;
