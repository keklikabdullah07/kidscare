import { z } from 'zod';
export const bloodTypeSchema = z.enum([
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    '0+',
    '0-',
    'UNKNOWN',
]);
export const emergencyContactSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1).max(100),
    relationship: z.string().min(1).max(50),
    phone: z.string().min(3).max(30),
    isAuthorizedPickup: z.boolean().default(false),
});
export const studentPassportSchema = z.object({
    bloodType: bloodTypeSchema.default('UNKNOWN'),
    allergies: z.array(z.string().max(100)).default([]),
    dietaryRestrictions: z.array(z.string().max(100)).default([]),
    chronicConditions: z.array(z.string().max(100)).default([]),
    regularMedications: z.array(z.string().max(100)).default([]),
    emergencyContacts: z.array(emergencyContactSchema).default([]),
    doctorName: z.string().max(100).optional(),
    doctorPhone: z.string().max(30).optional(),
    specialNotes: z.string().max(2000).optional(),
});
export const studentCreateSchema = z.object({
    parentId: z.string().nullable().optional(),
    firstName: z.string().min(1).max(64),
    lastName: z.string().min(1).max(64),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-AA-GG formatında olmalı'),
    gender: z.string().max(16).optional(),
    notes: z.string().max(2000).optional(),
    passport: studentPassportSchema.optional(),
});
export const studentUpdateSchema = z
    .object({
    parentId: z.string().nullable().optional(),
    firstName: z.string().min(1).max(64).optional(),
    lastName: z.string().min(1).max(64).optional(),
    dateOfBirth: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-AA-GG formatında olmalı')
        .optional(),
    gender: z.string().max(16).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
    passport: studentPassportSchema.nullable().optional(),
    isActive: z.boolean().optional(),
})
    .strict();
