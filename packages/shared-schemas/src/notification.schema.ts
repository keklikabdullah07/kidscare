import { z } from 'zod';

export const notificationTypeSchema = z.enum([
  'ATTENDANCE_CHECK_IN',
  'ATTENDANCE_CHECK_OUT',
  'DAILY_REPORT_SAVED',
  'MEDICATION_GIVEN',
  'ANNOUNCEMENT',
  'SYSTEM',
]);

export const registerPushTokenSchema = z
  .object({
    token: z.string().min(5).max(500),
    platform: z.enum(['ios', 'android', 'web']).optional(),
  })
  .strict();

export const sendNotificationSchema = z
  .object({
    title: z.string().min(1).max(200),
    body: z.string().min(1).max(1000),
    type: notificationTypeSchema.optional(),
    data: z.record(z.unknown()).optional(),
  })
  .strict();

export type NotificationTypeDto = z.infer<typeof notificationTypeSchema>;
export type RegisterPushTokenInput = z.infer<typeof registerPushTokenSchema>;
export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
