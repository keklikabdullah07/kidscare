import { Inject, Injectable } from '@nestjs/common';
import type {
  Notification as PrismaNotification,
  UserPushToken as PrismaUserPushToken,
  NotificationType as PrismaNotificationType,
  Prisma,
} from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export interface INotificationsRepository {
  upsertPushToken(
    tenantId: string,
    userId: string,
    token: string,
    platform: string,
  ): Promise<PrismaUserPushToken>;
  deletePushToken(userId: string, token: string): Promise<void>;
  findPushTokensForUsers(tenantId: string, userIds: string[]): Promise<PrismaUserPushToken[]>;
  createNotification(
    tenantId: string,
    userId: string,
    data: {
      title: string;
      body: string;
      type: PrismaNotificationType;
      data?: Prisma.InputJsonValue;
    },
  ): Promise<PrismaNotification>;
  findNotificationsByUser(
    tenantId: string,
    userId: string,
    limit?: number,
  ): Promise<PrismaNotification[]>;
  markNotificationRead(tenantId: string, userId: string, id: string): Promise<PrismaNotification>;
  findParentIdByStudentId(tenantId: string, studentId: string): Promise<string | null>;
}

@Injectable()
export class NotificationsRepository implements INotificationsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async upsertPushToken(
    tenantId: string,
    userId: string,
    token: string,
    platform: string,
  ): Promise<PrismaUserPushToken> {
    return this.prisma.withTenant((client) =>
      client.userPushToken.upsert({
        where: {
          userId_token: {
            userId,
            token,
          },
        },
        create: {
          tenantId,
          userId,
          token,
          platform,
        },
        update: {
          platform,
          updatedAt: new Date(),
        },
      }),
    );
  }

  async deletePushToken(userId: string, token: string): Promise<void> {
    await this.prisma.withTenant(async (client) => {
      try {
        await client.userPushToken.delete({
          where: {
            userId_token: {
              userId,
              token,
            },
          },
        });
      } catch {
        // quiet if already deleted
      }
    });
  }

  async findPushTokensForUsers(
    tenantId: string,
    userIds: string[],
  ): Promise<PrismaUserPushToken[]> {
    if (userIds.length === 0) return [];
    return this.prisma.withTenant((client) =>
      client.userPushToken.findMany({
        where: {
          tenantId,
          userId: { in: userIds },
        },
      }),
    );
  }

  async createNotification(
    tenantId: string,
    userId: string,
    data: {
      title: string;
      body: string;
      type: PrismaNotificationType;
      data?: Prisma.InputJsonValue;
    },
  ): Promise<PrismaNotification> {
    return this.prisma.withTenant((client) =>
      client.notification.create({
        data: {
          tenantId,
          userId,
          title: data.title,
          body: data.body,
          type: data.type,
          data: data.data ?? {},
        },
      }),
    );
  }

  async findNotificationsByUser(
    tenantId: string,
    userId: string,
    limit = 50,
  ): Promise<PrismaNotification[]> {
    return this.prisma.withTenant((client) =>
      client.notification.findMany({
        where: { tenantId, userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    );
  }

  async markNotificationRead(
    tenantId: string,
    userId: string,
    id: string,
  ): Promise<PrismaNotification> {
    return this.prisma.withTenant((client) =>
      client.notification.update({
        where: { id },
        data: { isRead: true },
      }),
    );
  }

  async findParentIdByStudentId(tenantId: string, studentId: string): Promise<string | null> {
    return this.prisma.withTenant(async (client) => {
      const student = await client.student.findUnique({
        where: { id: studentId },
        select: { parentId: true },
      });
      return student?.parentId ?? null;
    });
  }
}
