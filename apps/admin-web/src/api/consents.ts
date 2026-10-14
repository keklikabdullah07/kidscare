import { apiFetch } from './client';
import type {
  CreateEventConsentInput,
  EventConsent,
  EventConsentResponseItem,
  RespondEventConsentInput,
} from '@kidscare/shared-types';

export async function getEventConsents(params?: {
  classroomId?: string;
  status?: string;
}): Promise<EventConsent[]> {
  const query = new URLSearchParams();
  if (params?.classroomId) query.set('classroomId', params.classroomId);
  if (params?.status) query.set('status', params.status);
  const qStr = query.toString();
  return apiFetch<EventConsent[]>(`/events/consents${qStr ? `?${qStr}` : ''}`);
}

export async function createEventConsent(payload: CreateEventConsentInput): Promise<EventConsent> {
  return apiFetch<EventConsent>('/events/consents', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getEventConsent(id: string): Promise<EventConsent> {
  return apiFetch<EventConsent>(`/events/consents/${encodeURIComponent(id)}`);
}

export async function respondEventConsent(
  consentId: string,
  payload: RespondEventConsentInput,
): Promise<EventConsentResponseItem> {
  return apiFetch<EventConsentResponseItem>(
    `/events/consents/${encodeURIComponent(consentId)}/respond`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}
