import { z } from 'zod';

export const userRoleSchema = z.enum([
  'SUPER_ADMIN',
  'ADMIN',
  'TEACHER',
  'PARENT',
  'SERVICE_STAFF',
]);

export const userCreateSchema = z.object({
  tenantId: z.string().cuid(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: userRoleSchema,
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  avatarUrl: z.string().max(1000).optional(),
});

/** Tenant-scoped invite from admin panel (no tenantId in body). */
export const userInviteSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['TEACHER', 'PARENT', 'SERVICE_STAFF']),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
});

export const userProfileUpdateSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  avatarUrl: z.string().max(1000).optional(),
  phone: z.string().max(30).optional(),
});

export type UserCreate = z.infer<typeof userCreateSchema>;
export type UserInvite = z.infer<typeof userInviteSchema>;
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>;
