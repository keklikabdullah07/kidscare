export type BroadcastTargetType =
  'ALL_DAYCARE' | 'CLASSROOM' | 'SPECIFIC_STUDENTS' | 'TEACHERS_ONLY';

export type BroadcastPriority = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export interface BroadcastLog {
  id: string;
  tenantId: string;
  senderId: string;
  senderName?: string | undefined;
  title: string;
  body: string;
  targetType: BroadcastTargetType;
  targetId?: string | null | undefined;
  targetName?: string | null | undefined;
  priority: BroadcastPriority;
  recipientCount: number;
  deliveredCount: number;
  channels: string[];
  createdAt: string;
}

export interface CreateBroadcastDto {
  title: string;
  body: string;
  targetType: BroadcastTargetType;
  targetId?: string | undefined;
  targetName?: string | undefined;
  studentIds?: string[] | undefined;
  priority?: BroadcastPriority | undefined;
  channels?: string[] | undefined;
}

export interface BroadcastStatsDto {
  totalBroadcasts: number;
  thisMonthBroadcasts: number;
  urgentBroadcasts: number;
  totalDelivered: number;
}
