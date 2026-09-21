import { apiFetch } from './client';
import type { ParentChildOverview } from '@kidscare/shared-types';

export async function getParentChildrenOverview(date?: string): Promise<ParentChildOverview[]> {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  const response = await apiFetch<ParentChildOverview[] | { data: ParentChildOverview[] }>(
    `/parent/children${query}`,
  );
  if (Array.isArray(response)) {
    return response;
  }
  if (response && Array.isArray(response.data)) {
    return response.data;
  }
  return [];
}
