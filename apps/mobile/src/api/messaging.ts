import type {
  Conversation,
  ConversationStatus,
  Message,
  ParentRequest,
  ParentRequestStatus,
} from '@kidscare/shared-types';
import type {
  ConversationCreate,
  ConversationStatusUpdate,
  MessageCreate,
  ParentRequestCreate,
  ParentRequestResolve,
} from '@kidscare/shared-schemas';
import { apiFetch } from './client';

export async function listConversations(status?: ConversationStatus): Promise<Conversation[]> {
  const qs = status ? `?status=${status}` : '';
  return apiFetch<Conversation[]>(`/messaging/conversations${qs}`);
}

export async function createConversation(input: ConversationCreate): Promise<Conversation> {
  return apiFetch<Conversation>('/messaging/conversations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateConversationStatus(
  id: string,
  input: ConversationStatusUpdate,
): Promise<Conversation> {
  return apiFetch<Conversation>(`/messaging/conversations/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  return apiFetch<Message[]>(
    `/messaging/conversations/${encodeURIComponent(conversationId)}/messages`,
  );
}

export async function sendMessage(
  conversationId: string,
  input: MessageCreate,
): Promise<Message> {
  return apiFetch<Message>(
    `/messaging/conversations/${encodeURIComponent(conversationId)}/messages`,
    { method: 'POST', body: JSON.stringify(input) },
  );
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await apiFetch<void>(`/messaging/conversations/${encodeURIComponent(conversationId)}/read`, {
    method: 'POST',
  });
}

// ===== Parent Requests =====
export async function listParentRequests(
  status?: ParentRequestStatus,
): Promise<ParentRequest[]> {
  const qs = status ? `?status=${status}` : '';
  return apiFetch<ParentRequest[]>(`/messaging/parent-requests${qs}`);
}

export async function createParentRequest(input: ParentRequestCreate): Promise<ParentRequest> {
  return apiFetch<ParentRequest>('/messaging/parent-requests', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function resolveParentRequest(
  id: string,
  input: ParentRequestResolve,
): Promise<ParentRequest> {
  return apiFetch<ParentRequest>(
    `/messaging/parent-requests/${encodeURIComponent(id)}/resolve`,
    { method: 'PATCH', body: JSON.stringify(input) },
  );
}
