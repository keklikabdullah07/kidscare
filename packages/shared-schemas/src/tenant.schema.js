import { z } from 'zod';
export const tenantStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']);
export const tenantInputSchema = z.object({
    slug: z
        .string()
        .min(2)
        .max(64)
        .regex(/^[a-z0-9-]+$/),
    name: z.string().min(2).max(128),
});
export const tenantCreateSchema = tenantInputSchema.extend({
    status: tenantStatusSchema.optional(),
});
export const tenantUpdateSchema = z
    .object({
    name: z.string().min(2).max(128).optional(),
    status: tenantStatusSchema.optional(),
})
    .strict();
