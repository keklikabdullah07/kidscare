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
