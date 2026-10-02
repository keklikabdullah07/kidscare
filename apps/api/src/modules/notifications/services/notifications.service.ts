import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotificationType, type Prisma } from '@kidscare/database';
import type {
  NotificationItem,
  RegisterPushTokenDto,
  SendNotificationPayload,
} from '@kidscare/shared-types';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { ExpoPushService } from './expo-push.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(NotificationsRepository)
    private readonly repo: NotificationsRepository,
    @Inject(ExpoPushService)
    private readonly expoPush: ExpoPushService,
  ) {}

  async registerToken(
    tenantId: string,
    userId: string,
    dto: RegisterPushTokenDto,
  ): Promise<{ success: boolean }> {
    await this.repo.upsertPushToken(tenantId, userId, dto.token, dto.platform ?? 'mobile');
    this.logger.log(`📱 Push token registered for user=${userId} (${dto.platform ?? 'mobile'})`);
    return { success: true };
  }

  async unregisterToken(userId: string, token: string): Promise<{ success: boolean }> {
    await this.repo.deletePushToken(userId, token);
    this.logger.log(`📱 Push token removed for user=${userId}`);
    return { success: true };
  }

  async getUserNotifications(
    tenantId: string,
    userId: string,
    limit = 50,
  ): Promise<NotificationItem[]> {
    const list = await this.repo.findNotificationsByUser(tenantId, userId, limit);
    return list.map((n) => ({
      id: n.id,
      tenantId: n.tenantId,
      userId: n.userId,
      title: n.title,
      body: n.body,
      type: n.type,
      data: n.data as Record<string, unknown> | null,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    }));
  }

  async markAsRead(
    tenantId: string,
    userId: string,
    notificationId: string,
  ): Promise<{ success: boolean }> {
    await this.repo.markNotificationRead(tenantId, userId, notificationId);
    return { success: true };
  }

  async notifyUser(
    tenantId: string,
    userId: string,
    payload: SendNotificationPayload,
  ): Promise<void> {
    try {
      const type: NotificationType = (payload.type as NotificationType) ?? NotificationType.SYSTEM;
      // 1. Create persistent Notification record in DB
      await this.repo.createNotification(tenantId, userId, {
        title: payload.title,
        body: payload.body,
        type,
        data: payload.data as Prisma.InputJsonValue,
      });

      // 2. Lookup registered mobile tokens for this user
      const tokens = await this.repo.findPushTokensForUsers(tenantId, [userId]);
      if (tokens.length === 0) {
        this.logger.debug(`No push tokens found for user=${userId}, stored in DB only.`);
        return;
      }

      // 3. Dispatch to Expo Push service
      const messages = tokens.map((t) => ({
        to: t.token,
        sound: 'default' as const,
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
      }));

      await this.expoPush.sendPushNotifications(messages);
    } catch (err: unknown) {
      // Fail-safe: Notification logging should never break core workflow
      this.logger.warn(
        `Failed to notify user=${userId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async notifyStudentParents(
    tenantId: string,
    studentId: string,
    payload: SendNotificationPayload,
  ): Promise<void> {
    try {
      const parentId = await this.repo.findParentIdByStudentId(tenantId, studentId);
      if (!parentId) {
        this.logger.debug(`No parent associated with student=${studentId} for notification.`);
        return;
      }
      await this.notifyUser(tenantId, parentId, payload);
    } catch (err: unknown) {
      this.logger.warn(
        `Failed to notify parents for student=${studentId}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
