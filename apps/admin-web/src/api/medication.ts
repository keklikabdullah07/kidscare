import type { MedicationRecord, StandaloneMedicationStatus } from '@kidscare/shared-types';
import type {
  MedicationRecordApprove,
  MedicationRecordCreate,
  MedicationRecordGiven,
  MedicationRecordReject,
  MedicationRecordSkip,
} from '@kidscare/shared-schemas';
import { apiFetch } from './client';

export async function listMedicationRecords(
  studentId?: string,
  status?: StandaloneMedicationStatus,
): Promise<MedicationRecord[]> {
  const qs = new URLSearchParams();
  if (studentId) qs.set('studentId', studentId);
  if (status) qs.set('status', status);
  return apiFetch<MedicationRecord[]>(`/medication/records?${qs.toString()}`);
}

export async function createMedicationRecord(
  input: MedicationRecordCreate,
): Promise<MedicationRecord> {
  return apiFetch<MedicationRecord>('/medication/records', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function approveMedicationRecord(
  id: string,
  input: MedicationRecordApprove,
): Promise<MedicationRecord> {
  return apiFetch<MedicationRecord>(
    `/medication/records/${encodeURIComponent(id)}/approve`,
    { method: 'PATCH', body: JSON.stringify(input) },
  );
}

export async function rejectMedicationRecord(
  id: string,
  input: MedicationRecordReject,
): Promise<MedicationRecord> {
  return apiFetch<MedicationRecord>(
    `/medication/records/${encodeURIComponent(id)}/reject`,
    { method: 'PATCH', body: JSON.stringify(input) },
  );
}

export async function markMedicationGiven(
  id: string,
  input: MedicationRecordGiven,
): Promise<MedicationRecord> {
  return apiFetch<MedicationRecord>(
    `/medication/records/${encodeURIComponent(id)}/given`,
    { method: 'PATCH', body: JSON.stringify(input) },
  );
}

export async function markMedicationSkipped(
  id: string,
  input: MedicationRecordSkip,
): Promise<MedicationRecord> {
  return apiFetch<MedicationRecord>(
    `/medication/records/${encodeURIComponent(id)}/skip`,
    { method: 'PATCH', body: JSON.stringify(input) },
  );
}
