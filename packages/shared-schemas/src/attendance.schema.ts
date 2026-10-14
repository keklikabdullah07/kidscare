import { z } from 'zod';

export const attendanceStatusSchema = z.enum(['PRESENT', 'ABSENT', 'EXCUSED', 'LEFT']);

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const checkInInputSchema = z
  .object({
    checkInTime: z.string().regex(timeRegex).optional(),
    checkInBy: z.string().min(1).max(100).optional(),
    note: z.string().max(500).optional(),
  })
  .strict();

export const checkOutInputSchema = z
  .object({
    checkOutTime: z.string().regex(timeRegex).optional(),
    checkOutBy: z.string().min(1).max(100),
    pickupContactId: z.string().min(1).optional(),
    pickupNote: z.string().max(500).optional(),
    note: z.string().max(500).optional(),
  })
  .strict();

export const attendanceUpdateInputSchema = z
  .object({
    status: attendanceStatusSchema.optional(),
    checkInTime: z.string().regex(timeRegex).nullable().optional(),
    checkInBy: z.string().min(1).max(100).nullable().optional(),
    checkOutTime: z.string().regex(timeRegex).nullable().optional(),
    checkOutBy: z.string().min(1).max(100).nullable().optional(),
    pickupContactId: z.string().min(1).nullable().optional(),
    pickupNote: z.string().max(500).nullable().optional(),
    note: z.string().max(500).nullable().optional(),
  })
  .strict();

export const attendanceSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  studentId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: attendanceStatusSchema,
  checkInTime: z.string().nullable().optional(),
  checkInBy: z.string().nullable().optional(),
  checkOutTime: z.string().nullable().optional(),
  checkOutBy: z.string().nullable().optional(),
  pickupContactId: z.string().nullable().optional(),
  pickupNote: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const excuseReasonSchema = z.enum(['SICKNESS', 'FAMILY_LEAVE', 'TRAVEL', 'DOCTOR', 'OTHER']);

export const createAttendanceExcuseInputSchema = z
  .object({
    studentId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reason: excuseReasonSchema,
    notes: z.string().max(1000).optional(),
  })
  .strict();

export const attendanceExcuseSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  studentId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: excuseReasonSchema,
  notes: z.string().nullable().optional(),
  status: z.enum(['PENDING', 'ACKNOWLEDGED']),
  createdById: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  student: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
    })
    .optional(),
});

export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;
export type CheckInInput = z.infer<typeof checkInInputSchema>;
export type CheckOutInput = z.infer<typeof checkOutInputSchema>;
export type AttendanceUpdateInput = z.infer<typeof attendanceUpdateInputSchema>;
export type Attendance = z.infer<typeof attendanceSchema>;
export type ExcuseReason = z.infer<typeof excuseReasonSchema>;
export type CreateAttendanceExcuseInput = z.infer<typeof createAttendanceExcuseInputSchema>;
export type AttendanceExcuse = z.infer<typeof attendanceExcuseSchema>;
