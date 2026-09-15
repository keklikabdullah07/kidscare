import { z } from 'zod';

export const dailyMenuCreateInputSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-AA-GG (YYYY-MM-DD) formatında olmalıdır'),
  breakfast: z.array(z.string().min(1)).optional().default([]),
  lunch: z.array(z.string().min(1)).optional().default([]),
  snack: z.array(z.string().min(1)).optional().default([]),
  allergens: z.array(z.string().min(1)).optional().default([]),
  calories: z.number().int().nonnegative().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export const dailyMenuUpdateInputSchema = z.object({
  breakfast: z.array(z.string().min(1)).optional(),
  lunch: z.array(z.string().min(1)).optional(),
  snack: z.array(z.string().min(1)).optional(),
  allergens: z.array(z.string().min(1)).optional(),
  calories: z.number().int().nonnegative().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export const dailyMenuSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  date: z.string(),
  breakfast: z.array(z.string()),
  lunch: z.array(z.string()),
  snack: z.array(z.string()),
  allergens: z.array(z.string()),
  calories: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
