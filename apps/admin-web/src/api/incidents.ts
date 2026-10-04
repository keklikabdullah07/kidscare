import type { IncidentCategory, IncidentRecord } from '@kidscare/shared-types';
import type { IncidentRecordCreate } from '@kidscare/shared-schemas';
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
  input: { actionTaken?: string | undefined; parentNotified?: boolean | undefined },
): Promise<IncidentRecord> {
  const payload: Record<string, unknown> = {};
  if (typeof input.parentNotified === 'boolean') payload.parentNotified = input.parentNotified;
  if (input.actionTaken !== undefined) payload.actionTaken = input.actionTaken;
  return apiFetch<IncidentRecord>(`/incidents/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
