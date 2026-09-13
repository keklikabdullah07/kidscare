import { z } from 'zod';

export const tenantInputSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(128),
});

export type TenantInput = z.infer<typeof tenantInputSchema>;
