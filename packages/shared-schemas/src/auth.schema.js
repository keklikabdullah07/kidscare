import { z } from 'zod';
export const loginSchema = z.object({
    tenantSlug: z
        .string()
        .min(2)
        .max(64)
        .regex(/^[a-z0-9-]+$/),
    email: z.string().email(),
    password: z.string().min(1).max(128),
});
export const signupSchema = z.object({
    tenantSlug: z
        .string()
        .min(2)
        .max(64)
        .regex(/^[a-z0-9-]+$/),
    tenantName: z.string().min(2).max(128),
    email: z.string().email(),
    password: z.string().min(8).max(128),
});
