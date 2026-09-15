import type { AuthResponse } from '@kidscare/shared-types';
import { apiFetch } from './client';

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
