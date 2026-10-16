import type { UserRole } from './user';

export type JwtClaims = {
  sub: string; // user id
  tenantId: string;
  role: UserRole;
};

export type LoginRequest = {
  tenantSlug: string;
  email: string;
  password: string;
};

export type SignupRequest = {
  tenantSlug: string;
  tenantName: string;
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
};

export type AuthResponse = {
  token: string;
  user: AuthenticatedUser;
};

export type ForgotPasswordInput = {
  tenantSlug: string;
  email: string;
};

export type ForgotPasswordResponse = {
  success: boolean;
  message: string;
};

export type VerifyResetTokenResponse = {
  valid: boolean;
  email?: string;
  reason?: 'NOT_FOUND' | 'EXPIRED' | 'ALREADY_USED';
};

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

export type ResetPasswordResponse = {
  success: boolean;
  message: string;
};
