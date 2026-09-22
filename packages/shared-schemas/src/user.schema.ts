import { z } from 'zod';

export const userRoleSchema = z.enum(['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT']);

export const userCreateSchema = z.object({
  tenantId: z.string().cuid(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: userRoleSchema,
});

/** Tenant-scoped invite from admin panel (no tenantId in body). */
export const userInviteSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['TEACHER', 'PARENT']),
});

export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserInvite = z.infer<typeof userInviteSchema>;
