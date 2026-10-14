export type EventConsentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type EventConsentDecision = 'APPROVED' | 'DECLINED';

export type EventConsentResponseItem = {
  id: string;
  tenantId: string;
  consentId: string;
  studentId: string;
  parentUserId: string;
  decision: EventConsentDecision;
  notes?: string | null | undefined;
  respondedAt: string;
  student?:
    | {
        id: string;
        firstName: string;
        lastName: string;
      }
    | undefined;
  parentUser?:
    | {
        id: string;
        email: string;
      }
    | undefined;
};

export type EventConsent = {
  id: string;
  tenantId: string;
  classroomId?: string | null | undefined;
  title: string;
  eventDate: string; // ISO
  location?: string | null | undefined;
  price?: number | null | undefined;
  description?: string | null | undefined;
  deadline?: string | null | undefined; // ISO
  status: EventConsentStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  classroom?:
    | {
        id: string;
        name: string;
      }
    | null
    | undefined;
  responses?: EventConsentResponseItem[] | undefined;
  stats?:
    | {
        totalStudents: number;
        approvedCount: number;
        declinedCount: number;
        pendingCount: number;
      }
    | undefined;
  myResponse?: EventConsentResponseItem | null | undefined;
};

export type CreateEventConsentInput = {
  classroomId?: string | undefined;
  title: string;
  eventDate: string; // ISO
  location?: string | undefined;
  price?: number | undefined;
  description?: string | undefined;
  deadline?: string | undefined; // ISO
};

export type RespondEventConsentInput = {
  studentId: string;
  decision: EventConsentDecision;
  notes?: string | undefined;
};
