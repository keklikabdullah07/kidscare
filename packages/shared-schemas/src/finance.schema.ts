import { z } from 'zod';

export const invoiceStatusSchema = z.enum([
  'PENDING',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'CANCELLED',
]);
export const paymentMethodSchema = z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'OTHER']);

export const createBillingPlanInputSchema = z
  .object({
    studentId: z.string().min(1),
    tuitionAmount: z.number().min(0),
    serviceAmount: z.number().min(0).optional().default(0),
    activityAmount: z.number().min(0).optional().default(0),
    discountPercent: z.number().min(0).max(100).optional().default(0),
    dueDayOfMonth: z.number().int().min(1).max(31).optional().default(5),
    notes: z.string().max(1000).optional(),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const createInvoiceInputSchema = z
  .object({
    studentId: z.string().min(1),
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Dönem YYYY-AA formatında olmalıdır (örn: 2026-10)'),
    totalAmount: z.number().min(0),
    dueDate: z.string().min(1),
    notes: z.string().max(1000).optional(),
  })
  .strict();

export const recordPaymentInputSchema = z
  .object({
    invoiceId: z.string().min(1),
    amount: z.number().positive('Ödeme tutarı 0 dan büyük olmalıdır'),
    method: paymentMethodSchema,
    referenceNo: z.string().max(100).optional(),
    notes: z.string().max(1000).optional(),
    paidAt: z.string().optional(),
  })
  .strict();

export type CreateBillingPlanInputType = z.infer<typeof createBillingPlanInputSchema>;
export type CreateInvoiceInputType = z.infer<typeof createInvoiceInputSchema>;
export type RecordPaymentInputType = z.infer<typeof recordPaymentInputSchema>;
