import { Inject, Injectable, Logger } from '@nestjs/common';
import { NotificationType, type Prisma } from '@kidscare/database';
import type {
  NotificationItem,
  RegisterPushTokenDto,
  SendNotificationPayload,
  BroadcastLog,
  CreateBroadcastDto,
  BroadcastStatsDto,
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

  async sendBroadcast(
    tenantId: string,
    senderId: string,
    dto: CreateBroadcastDto,
  ): Promise<{ success: boolean; log: BroadcastLog }> {
    const priority = dto.priority ?? 'NORMAL';
    const channels = dto.channels && dto.channels.length > 0 ? dto.channels : ['PUSH'];

    // 1. Resolve target recipient user IDs
    const targetUserIds = await this.repo.findTargetUserIds(
      tenantId,
      dto.targetType,
      dto.targetId,
      dto.studentIds,
    );

    let deliveredCount = 0;

    if (targetUserIds.length > 0) {
      // 2. Persist in-app notifications in batch
      await this.repo.createBatchNotifications(tenantId, targetUserIds, {
        title: dto.title,
        body: dto.body,
        type: NotificationType.ANNOUNCEMENT,
        data: {
          broadcast: true,
          priority,
          targetType: dto.targetType,
          targetName: dto.targetName,
        },
      });

      // 3. Gather push tokens and dispatch via Expo
      const pushTokens = await this.repo.findPushTokensForUsers(tenantId, targetUserIds);
      if (pushTokens.length > 0) {
        const messages = pushTokens.map((t) => ({
          to: t.token,
          sound: 'default' as const,
          title: priority === 'URGENT' ? `🚨 [ACİL] ${dto.title}` : dto.title,
          body: dto.body,
          data: {
            broadcast: true,
            priority,
            targetType: dto.targetType,
          },
        }));

        await this.expoPush.sendPushNotifications(messages);
      }

      deliveredCount = targetUserIds.length;
    }

    // 4. Create audit log
    const log = await this.repo.createBroadcastLog(tenantId, senderId, {
      title: dto.title,
      body: dto.body,
      targetType: dto.targetType,
      targetId: dto.targetId ?? null,
      targetName: dto.targetName ?? null,
      priority,
      recipientCount: targetUserIds.length,
      deliveredCount,
      channels,
    });

    return {
      success: true,
      log: {
        id: log.id,
        tenantId: log.tenantId,
        senderId: log.senderId,
        title: log.title,
        body: log.body,
        targetType: log.targetType,
        targetId: log.targetId,
        targetName: log.targetName,
        priority: log.priority,
        recipientCount: log.recipientCount,
        deliveredCount: log.deliveredCount,
        channels: log.channels,
        createdAt: log.createdAt.toISOString(),
      },
    };
  }

  async getBroadcastHistory(tenantId: string, limit = 50): Promise<BroadcastLog[]> {
    const logs = await this.repo.findBroadcastLogs(tenantId, limit);
    return logs.map((l) => ({
      id: l.id,
      tenantId: l.tenantId,
      senderId: l.senderId,
      senderName: l.sender
        ? [l.sender.firstName, l.sender.lastName].filter(Boolean).join(' ').trim() || l.sender.email
        : undefined,
      title: l.title,
      body: l.body,
      targetType: l.targetType,
      targetId: l.targetId,
      targetName: l.targetName,
      priority: l.priority,
      recipientCount: l.recipientCount,
      deliveredCount: l.deliveredCount,
      channels: l.channels,
      createdAt: l.createdAt.toISOString(),
    }));
  }

  async getBroadcastStats(tenantId: string): Promise<BroadcastStatsDto> {
    return this.repo.getBroadcastStats(tenantId);
  }
}
