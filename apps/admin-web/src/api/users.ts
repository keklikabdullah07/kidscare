import type { User, UserRole } from '@kidscare/shared-types';
import { apiFetch } from './client';

export function listUsers(role?: UserRole): Promise<User[]> {
  const query = role ? `?role=${encodeURIComponent(role)}` : '';
  return apiFetch<User[]>(`/users${query}`);
}

export function inviteUser(payload: {
  email: string;
  password: string;
  role: 'TEACHER' | 'PARENT';
}): Promise<User> {
  return apiFetch<User>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
