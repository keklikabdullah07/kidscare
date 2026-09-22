export type ConversationStatus = 'OPEN' | 'CLOSED' | 'ARCHIVED';

export type ConversationCategory =
  | 'ACIL'
  | 'SAGLIK'
  | 'IZIN'
  | 'TESLIM'
  | 'GUNLUK_BILGI'
  | 'DUYURU'
  | 'ODEME'
  | 'RANDEVU';

export type Conversation = {
  id: string;
  tenantId: string;
  subject: string;
  category: ConversationCategory;
  status: ConversationStatus;
  isCritical: boolean;
  studentId?: string | null;
  createdById: string;
  participantIds: string[];
  lastMessageAt?: string | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Message = {
  id: string;
  tenantId: string;
  conversationId: string;
  senderId: string;
  content: string;
  isCritical: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ParentRequestType = 'IZIN' | 'BILGI_TALEP' | 'DEGISIKLIK' | 'DIGER';
export type ParentRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ParentRequest = {
  id: string;
  tenantId: string;
  parentId: string;
  studentId?: string | null;
  type: ParentRequestType;
  subject: string;
  description: string;
  status: ParentRequestStatus;
  resolvedById?: string | null;
  resolvedAt?: string | null;
  resolutionNote?: string | null;
  createdAt: string;
  updatedAt: string;
};
