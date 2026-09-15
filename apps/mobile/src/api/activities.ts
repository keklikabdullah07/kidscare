import type {
  ActivityPost,
  CreateActivityPostDto,
  ActivityFilterQuery,
} from '@kidscare/shared-types';
import { apiFetch } from './client';

export function getActivities(query?: ActivityFilterQuery): Promise<ActivityPost[]> {
  const params = new URLSearchParams();
  if (query?.classroom) params.append('classroom', query.classroom);
  if (query?.studentId) params.append('studentId', query.studentId);
  if (query?.tag) params.append('tag', query.tag);
  if (query?.limit) params.append('limit', String(query.limit));
  if (query?.offset) params.append('offset', String(query.offset));

  const qs = params.toString();
  return apiFetch<ActivityPost[]>(`/activities${qs ? `?${qs}` : ''}`);
}

export function createActivity(data: CreateActivityPostDto): Promise<ActivityPost> {
  return apiFetch<ActivityPost>('/activities', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteActivity(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/activities/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
