import type { AuthenticatedUser, AuthResponse, UserProfileUpdateInput } from '@kidscare/shared-types';
import { apiFetch } from './client';

export function updateProfile(payload: UserProfileUpdateInput): Promise<AuthenticatedUser> {
  return apiFetch<AuthenticatedUser>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function login(payload: {
  tenantSlug: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function signup(payload: {
  tenantSlug: string;
  tenantName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function me(): Promise<{ tenantId: string; userId: string; role: string }> {
  return apiFetch('/auth/me');
}

export function forgotPassword(payload: {
  tenantSlug: string;
  email: string;
}): Promise<{ success: boolean; message: string }> {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function verifyResetToken(token: string): Promise<{
  valid: boolean;
  email?: string;
  reason?: 'NOT_FOUND' | 'EXPIRED' | 'ALREADY_USED';
}> {
  return apiFetch(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
}

export function resetPassword(payload: {
  token: string;
  newPassword: string;
}): Promise<{ success: boolean; message: string }> {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
