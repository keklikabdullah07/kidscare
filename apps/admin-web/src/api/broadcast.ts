import { apiFetch } from './client';
import type { BroadcastLog, CreateBroadcastDto, BroadcastStatsDto } from '@kidscare/shared-types';

export async function fetchBroadcastStats(): Promise<BroadcastStatsDto> {
  return apiFetch<BroadcastStatsDto>('/notifications/broadcast/stats');
}

export async function fetchBroadcastHistory(limit = 50): Promise<BroadcastLog[]> {
  return apiFetch<BroadcastLog[]>(`/notifications/broadcast/history?limit=${limit}`);
}

export async function sendBroadcast(
  dto: CreateBroadcastDto,
): Promise<{ success: boolean; log: BroadcastLog }> {
  return apiFetch<{ success: boolean; log: BroadcastLog }>('/notifications/broadcast', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}
