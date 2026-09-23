export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
};

export type TenantSummary = Pick<Tenant, 'id' | 'slug' | 'name'>;

export interface OperationalAlertItem {
  id: string;
  type: 'MEDICATION' | 'INCIDENT' | 'PICKUP' | 'PARENT_REQUEST';
  title: string;
  description: string;
  studentName?: string | undefined;
  createdAt: string;
  actionUrl: string;
  urgency: 'HIGH' | 'MEDIUM';
}

export interface OperationalAlertsResponse {
  immediateActions: {
    pendingMedicationsCount: number;
    openIncidentsCount: number;
    pendingPickupAuthorizationsCount: number;
    pendingParentRequestsCount: number;
    items: OperationalAlertItem[];
  };
  dailyCompletion: {
    totalStudents: number;
    markedAttendanceCount: number;
    unmarkedAttendanceCount: number;
    filledDailyReportsCount: number;
    pendingDailyReportsCount: number;
  };
  trends: {
    consecutiveAbsentStudents: Array<{
      id: string;
      firstName: string;
      lastName: string;
      consecutiveDays: number;
    }>;
  };
}
