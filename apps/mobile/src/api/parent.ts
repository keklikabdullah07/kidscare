import { apiFetch } from './client';
import type { ParentChildOverview } from '@kidscare/shared-types';

export async function fetchParentChildrenOverview(date?: string): Promise<ParentChildOverview[]> {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  const response = await apiFetch<{ data: ParentChildOverview[] }>(`/parent/children${query}`);
  return response.data;
}
