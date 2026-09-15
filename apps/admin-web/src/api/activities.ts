import type {
  ActivityPost,
  CreateActivityPostDto,
  ActivityFilterQuery,
} from '@kidscare/shared-types';
import { apiFetch } from './client';

export async function getActivities(query?: ActivityFilterQuery): Promise<ActivityPost[]> {
  const searchParams = new URLSearchParams();
  if (query?.classroom) searchParams.set('classroom', query.classroom);
  if (query?.studentId) searchParams.set('studentId', query.studentId);
  if (query?.tag) searchParams.set('tag', query.tag);
  if (query?.limit) searchParams.set('limit', String(query.limit));
  if (query?.offset) searchParams.set('offset', String(query.offset));

  const qs = searchParams.toString();
  return apiFetch<ActivityPost[]>(`/activities${qs ? `?${qs}` : ''}`);
}

export async function createActivity(dto: CreateActivityPostDto): Promise<ActivityPost> {
  return apiFetch<ActivityPost>('/activities', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function deleteActivity(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/activities/${id}`, {
    method: 'DELETE',
  });
}
