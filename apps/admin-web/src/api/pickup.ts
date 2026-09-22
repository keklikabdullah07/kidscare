import type {
  PickupAuthorization,
  PickupAuthorizationStatus,
  PickupContact,
  PickupEvent,
  PickupVerificationMethod,
} from '@kidscare/shared-types';
import type {
  PickupAuthorizationCreate,
  PickupAuthorizationReview,
  PickupContactCreate,
  PickupContactUpdate,
  PickupEventCreate,
} from '@kidscare/shared-schemas';
import { apiFetch } from './client';

// ===== Contacts =====
export async function listPickupContacts(studentId: string): Promise<PickupContact[]> {
  const qs = new URLSearchParams({ studentId }).toString();
  return apiFetch<PickupContact[]>(`/pickup/contacts?${qs}`);
}

export async function createPickupContact(input: PickupContactCreate): Promise<PickupContact> {
  return apiFetch<PickupContact>('/pickup/contacts', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updatePickupContact(
  id: string,
  input: PickupContactUpdate,
): Promise<PickupContact> {
  return apiFetch<PickupContact>(`/pickup/contacts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deletePickupContact(id: string): Promise<void> {
  await apiFetch<void>(`/pickup/contacts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// ===== Authorizations =====
export async function listPickupAuthorizations(
  studentId?: string,
  status?: PickupAuthorizationStatus,
): Promise<PickupAuthorization[]> {
  const qs = new URLSearchParams();
  if (studentId) qs.set('studentId', studentId);
  if (status) qs.set('status', status);
  return apiFetch<PickupAuthorization[]>(`/pickup/authorizations?${qs.toString()}`);
}

export async function createPickupAuthorization(
  input: PickupAuthorizationCreate,
): Promise<PickupAuthorization> {
  return apiFetch<PickupAuthorization>('/pickup/authorizations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function reviewPickupAuthorization(
  id: string,
  input: PickupAuthorizationReview,
): Promise<PickupAuthorization> {
  return apiFetch<PickupAuthorization>(
    `/pickup/authorizations/${encodeURIComponent(id)}/review`,
    { method: 'PATCH', body: JSON.stringify(input) },
  );
}

// ===== Events =====
export async function listPickupEvents(
  studentId?: string,
  from?: string,
  to?: string,
): Promise<PickupEvent[]> {
  const qs = new URLSearchParams();
  if (studentId) qs.set('studentId', studentId);
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);
  return apiFetch<PickupEvent[]>(`/pickup/events?${qs.toString()}`);
}

export async function createPickupEvent(
  studentId: string,
  pickupPersonName: string,
  verificationMethod: PickupVerificationMethod,
  opts?: {
    pickupContactId?: string;
    authorizationId?: string;
    pickupPersonPhone?: string;
    note?: string;
  },
): Promise<PickupEvent> {
  const payload: PickupEventCreate = {
    studentId,
    pickupPersonName,
    verificationMethod,
    ...(opts?.pickupContactId ? { pickupContactId: opts.pickupContactId } : {}),
    ...(opts?.authorizationId ? { authorizationId: opts.authorizationId } : {}),
    ...(opts?.pickupPersonPhone ? { pickupPersonPhone: opts.pickupPersonPhone } : {}),
    ...(opts?.note ? { note: opts.note } : {}),
  };
  return apiFetch<PickupEvent>('/pickup/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
