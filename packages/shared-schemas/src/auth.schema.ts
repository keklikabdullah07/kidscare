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

export const forgotPasswordSchema = z.object({
  tenantSlug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
  email: z.string().email(),
});

export const verifyResetTokenSchema = z.object({
  token: z.string().min(16).max(128),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16).max(128),
  newPassword: z.string().min(8).max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetTokenInput = z.infer<typeof verifyResetTokenSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
