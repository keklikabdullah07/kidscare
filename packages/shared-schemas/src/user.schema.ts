import { z } from 'zod';

export const userRoleSchema = z.enum(['ADMIN', 'TEACHER', 'PARENT']);

export const userCreateSchema = z.object({
  tenantId: z.string().cuid(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: userRoleSchema,
});

export type UserCreate = z.infer<typeof userCreateSchema>;
