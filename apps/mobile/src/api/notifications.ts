import { apiFetch } from './client';
import type { NotificationItem, RegisterPushTokenDto } from '@kidscare/shared-types';

export async function registerPushToken(
  token: string,
  platform: 'ios' | 'android' | 'web' = 'android',
): Promise<{ success: boolean }> {
  const payload: RegisterPushTokenDto = { token, platform };
  return apiFetch<{ success: boolean }>('/notifications/token', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function unregisterPushToken(token: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>('/notifications/token', {
    method: 'DELETE',
    body: JSON.stringify({ token }),
  });
}

export async function listNotifications(limit = 30): Promise<NotificationItem[]> {
  return apiFetch<NotificationItem[]>(`/notifications?limit=${limit}`);
}

export async function markNotificationRead(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
  });
}
