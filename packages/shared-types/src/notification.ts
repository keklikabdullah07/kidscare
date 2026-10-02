export type NotificationType =
  | 'ATTENDANCE_CHECK_IN'
  | 'ATTENDANCE_CHECK_OUT'
  | 'DAILY_REPORT_SAVED'
  | 'MEDICATION_GIVEN'
  | 'ANNOUNCEMENT'
  | 'SYSTEM';

export type NotificationPlatform = 'ios' | 'android' | 'web';

export interface RegisterPushTokenDto {
  token: string;
  platform?: NotificationPlatform | undefined;
}

export interface NotificationItem {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, unknown> | null | undefined;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SendNotificationPayload {
  title: string;
  body: string;
  type?: NotificationType | undefined;
  data?: Record<string, unknown> | undefined;
}
