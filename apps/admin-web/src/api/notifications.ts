import { apiFetch } from './client';
import type { NotificationItem, RegisterPushTokenDto } from '@kidscare/shared-types';

export async function getNotifications(limit = 50): Promise<NotificationItem[]> {
  return apiFetch<NotificationItem[]>(`/notifications?limit=${limit}`);
}

export async function markNotificationAsRead(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function registerPushToken(dto: RegisterPushTokenDto): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>('/notifications/token', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}
