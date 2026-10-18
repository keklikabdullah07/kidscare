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

export const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-AA-GG formatında olmalı')
  .refine(
    (val) => {
      const today = new Date().toISOString().slice(0, 10);
      return val <= today;
    },
    { message: 'Doğum tarihi bugünden ileri bir tarih olamaz' },
  );

export const emergencyContactSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  relationship: z.string().min(1).max(50),
  phone: z
    .string()
    .trim()
    .min(3, 'Telefon numarası en az 3 karakter olmalıdır')
    .max(30, 'Telefon numarası en fazla 30 karakter olabilir'),
  isAuthorizedPickup: z.boolean().default(false),
});

export const studentPassportSchema = z.object({
  identityNumber: z.string().trim().max(11, 'TC Kimlik No en fazla 11 karakter olabilir').optional(),
  motherName: z.string().trim().max(100).optional(),
  fatherName: z.string().trim().max(100).optional(),
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
  classroomId: z.string().nullable().optional(),
  firstName: z.string().min(1).max(64),
  lastName: z.string().min(1).max(64),
  dateOfBirth: dateOfBirthSchema,
  gender: z.string().max(16).optional(),
  notes: z.string().max(2000).optional(),
  passport: studentPassportSchema.optional(),
  identityNumber: z.string().trim().max(11).optional(),
  motherName: z.string().trim().max(100).optional(),
  fatherName: z.string().trim().max(100).optional(),
});

export const studentUpdateSchema = z
  .object({
    parentId: z.string().nullable().optional(),
    classroomId: z.string().nullable().optional(),
    firstName: z.string().min(1).max(64).optional(),
    lastName: z.string().min(1).max(64).optional(),
    dateOfBirth: dateOfBirthSchema.optional(),
    gender: z.string().max(16).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
    passport: studentPassportSchema.nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type BloodTypeEnum = z.infer<typeof bloodTypeSchema>;
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;
export type StudentPassportInput = z.infer<typeof studentPassportSchema>;
export type StudentCreate = z.infer<typeof studentCreateSchema>;
export type StudentUpdate = z.infer<typeof studentUpdateSchema>;
