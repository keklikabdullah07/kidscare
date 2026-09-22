export type IncidentCategory =
  | 'DUSME'
  | 'YARALANMA'
  | 'HASTALIK'
  | 'DAVRANIS'
  | 'KAZA'
  | 'DIGER';

export type IncidentRecord = {
  id: string;
  tenantId: string;
  studentId: string;
  category: IncidentCategory;
  occurredAt: string;
  description: string;
  actionTaken?: string | null;
  parentNotified: boolean;
  parentNotifiedAt?: string | null;
  parentNotifiedById?: string | null;
  reportedById: string;
  createdAt: string;
  updatedAt: string;
};
