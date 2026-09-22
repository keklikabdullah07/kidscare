import type { IncidentCategory, IncidentRecord } from '@kidscare/shared-types';
import type {
  IncidentRecordCreate,
  IncidentRecordUpdate,
} from '@kidscare/shared-schemas';
import { apiFetch } from './client';

export async function listIncidents(
  studentId?: string,
  category?: IncidentCategory,
): Promise<IncidentRecord[]> {
  const qs = new URLSearchParams();
  if (studentId) qs.set('studentId', studentId);
  if (category) qs.set('category', category);
  return apiFetch<IncidentRecord[]>(`/incidents?${qs.toString()}`);
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
