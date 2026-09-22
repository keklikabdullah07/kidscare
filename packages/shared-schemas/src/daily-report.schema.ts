import { z } from 'zod';

export const mealPortionSchema = z.enum(['ALL', 'HALF', 'LITTLE', 'NONE']);

export const mealsSchema = z
  .object({
    breakfast: mealPortionSchema.optional(),
    lunch: mealPortionSchema.optional(),
    afternoonSnack: mealPortionSchema.optional(),
    notes: z.string().max(500).optional(),
  })
  .strict();

export const napQualitySchema = z.enum(['GOOD', 'INTERRUPTED', 'NONE']);

export const napSchema = z
  .object({
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .optional(),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
      .optional(),
    quality: napQualitySchema.optional(),
    notes: z.string().max(500).optional(),
  })
  .strict();

export const pottyTypeSchema = z.enum(['WET', 'DIRTY', 'POTTY', 'ACCIDENT']);

export const pottyEntrySchema = z
  .object({
    id: z.string().min(1),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    type: pottyTypeSchema,
    notes: z.string().max(500).optional(),
  })
  .strict();

export const medicationStatusSchema = z.enum(['SCHEDULED', 'GIVEN', 'SKIPPED']);

export const medicationEntrySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1).max(100),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    givenBy: z.string().min(1).max(100),
    dosage: z.string().max(100).optional(),
    status: medicationStatusSchema.optional(),
    requestedBy: z.string().max(100).optional(),
    givenAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
    temperature: z.number().min(30).max(45).optional(),
    notes: z.string().max(500).optional(),
  })
  .strict();

export const studentMoodSchema = z.enum(['HAPPY', 'CALM', 'ENERGETIC', 'TIRED', 'CRANKY', 'SAD']);

export const dailyReportInputSchema = z
  .object({
    mood: studentMoodSchema.optional(),
    meals: mealsSchema.optional(),
    naps: napSchema.optional(),
    potty: z.array(pottyEntrySchema).optional(),
    activities: z.array(z.string().min(1).max(100)).optional(),
    medications: z.array(medicationEntrySchema).optional(),
    teacherNote: z.string().max(1000).optional(),
  })
  .strict();

export const bulkDailyReportItemSchema = dailyReportInputSchema.extend({
  studentId: z.string().min(1),
});

export const bulkDailyReportsInputSchema = z
  .object({
    items: z.array(bulkDailyReportItemSchema).min(1).max(100),
  })
  .strict();

export const dailyReportSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  studentId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mood: studentMoodSchema.nullable().optional(),
  meals: mealsSchema.nullable().optional(),
  naps: napSchema.nullable().optional(),
  potty: z.array(pottyEntrySchema).nullable().optional(),
  activities: z.array(z.string()).nullable().optional(),
  medications: z.array(medicationEntrySchema).nullable().optional(),
  teacherNote: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type MealPortion = z.infer<typeof mealPortionSchema>;
export type MealsData = z.infer<typeof mealsSchema>;
export type NapQuality = z.infer<typeof napQualitySchema>;
export type NapData = z.infer<typeof napSchema>;
export type PottyType = z.infer<typeof pottyTypeSchema>;
export type PottyEntry = z.infer<typeof pottyEntrySchema>;
export type MedicationStatus = z.infer<typeof medicationStatusSchema>;
export type MedicationEntry = z.infer<typeof medicationEntrySchema>;
export type StudentMood = z.infer<typeof studentMoodSchema>;
export type DailyReportInput = z.infer<typeof dailyReportInputSchema>;
export type BulkDailyReportItem = z.infer<typeof bulkDailyReportItemSchema>;
export type BulkDailyReportsInput = z.infer<typeof bulkDailyReportsInputSchema>;
export type DailyReport = z.infer<typeof dailyReportSchema>;
