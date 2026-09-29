import type { IncidentRecord, IncidentCategory } from '@kidscare/shared-types';
import type { IncidentRecordCreate, IncidentRecordUpdate } from '@kidscare/shared-schemas';
import { apiFetch } from './client';

export interface IncidentFilters {
  studentId?: string;
  category?: IncidentCategory;
  from?: string;
  to?: string;
}

export async function listIncidents(filters?: IncidentFilters): Promise<IncidentRecord[]> {
  const params = new URLSearchParams();
  if (filters?.studentId) params.append('studentId', filters.studentId);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.from) params.append('from', filters.from);
  if (filters?.to) params.append('to', filters.to);
  const qs = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<IncidentRecord[]>(`/incidents${qs}`);
}

export async function createIncident(input: IncidentRecordCreate): Promise<IncidentRecord> {
  return apiFetch<IncidentRecord>('/incidents', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateIncident(
  id: string,
  input: IncidentRecordUpdate,
): Promise<IncidentRecord> {
  return apiFetch<IncidentRecord>(`/incidents/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
