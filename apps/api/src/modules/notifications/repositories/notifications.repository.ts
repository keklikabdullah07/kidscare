import { Inject, Injectable } from '@nestjs/common';
import type {
  Notification as PrismaNotification,
  UserPushToken as PrismaUserPushToken,
  NotificationType as PrismaNotificationType,
  BroadcastLog as PrismaBroadcastLog,
  BroadcastTargetType as PrismaBroadcastTargetType,
  BroadcastPriority as PrismaBroadcastPriority,
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
  createBatchNotifications(
    tenantId: string,
    userIds: string[],
    data: {
      title: string;
      body: string;
      type: PrismaNotificationType;
      data?: Prisma.InputJsonValue;
    },
  ): Promise<number>;
  findNotificationsByUser(
    tenantId: string,
    userId: string,
    limit?: number,
  ): Promise<PrismaNotification[]>;
  markNotificationRead(tenantId: string, userId: string, id: string): Promise<PrismaNotification>;
  findParentIdByStudentId(tenantId: string, studentId: string): Promise<string | null>;
  findTargetUserIds(
    tenantId: string,
    targetType: PrismaBroadcastTargetType,
    targetId?: string | null,
    studentIds?: string[],
  ): Promise<string[]>;
  createBroadcastLog(
    tenantId: string,
    senderId: string,
    data: {
      title: string;
      body: string;
      targetType: PrismaBroadcastTargetType;
      targetId?: string | null;
      targetName?: string | null;
      priority: PrismaBroadcastPriority;
      recipientCount: number;
      deliveredCount: number;
      channels: string[];
    },
  ): Promise<PrismaBroadcastLog>;
  findBroadcastLogs(
    tenantId: string,
    limit?: number,
  ): Promise<
    (PrismaBroadcastLog & {
      sender?: { firstName: string | null; lastName: string | null; email: string };
    })[]
  >;
  getBroadcastStats(tenantId: string): Promise<{
    totalBroadcasts: number;
    thisMonthBroadcasts: number;
    urgentBroadcasts: number;
    totalDelivered: number;
  }>;
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

  async createBatchNotifications(
    tenantId: string,
    userIds: string[],
    data: {
      title: string;
      body: string;
      type: PrismaNotificationType;
      data?: Prisma.InputJsonValue;
    },
  ): Promise<number> {
    if (userIds.length === 0) return 0;
    return this.prisma.withTenant(async (client) => {
      const result = await client.notification.createMany({
        data: userIds.map((userId) => ({
          tenantId,
          userId,
          title: data.title,
          body: data.body,
          type: data.type,
          data: data.data ?? {},
        })),
      });
      return result.count;
    });
  }

  async findTargetUserIds(
    tenantId: string,
    targetType: PrismaBroadcastTargetType,
    targetId?: string | null,
    studentIds?: string[],
  ): Promise<string[]> {
    return this.prisma.withTenant(async (client) => {
      const userIds = new Set<string>();

      if (targetType === 'ALL_DAYCARE') {
        const students = await client.student.findMany({
          where: { tenantId, deletedAt: null, isActive: true, parentId: { not: null } },
          select: { parentId: true },
        });
        for (const s of students) {
          if (s.parentId) userIds.add(s.parentId);
        }

        const teachers = await client.user.findMany({
          where: { tenantId, role: 'TEACHER', isActive: true },
          select: { id: true },
        });
        for (const t of teachers) {
          userIds.add(t.id);
        }
      } else if (targetType === 'CLASSROOM') {
        if (targetId) {
          const students = await client.student.findMany({
            where: {
              tenantId,
              classroomId: targetId,
              deletedAt: null,
              isActive: true,
              parentId: { not: null },
            },
            select: { parentId: true },
          });
          for (const s of students) {
            if (s.parentId) userIds.add(s.parentId);
          }
        }
      } else if (targetType === 'SPECIFIC_STUDENTS') {
        if (studentIds && studentIds.length > 0) {
          const students = await client.student.findMany({
            where: {
              tenantId,
              id: { in: studentIds },
              deletedAt: null,
              parentId: { not: null },
            },
            select: { parentId: true },
          });
          for (const s of students) {
            if (s.parentId) userIds.add(s.parentId);
          }
        }
      } else if (targetType === 'TEACHERS_ONLY') {
        const teachers = await client.user.findMany({
          where: { tenantId, role: 'TEACHER', isActive: true },
          select: { id: true },
        });
        for (const t of teachers) {
          userIds.add(t.id);
        }
      }

      return Array.from(userIds);
    });
  }

  async createBroadcastLog(
    tenantId: string,
    senderId: string,
    data: {
      title: string;
      body: string;
      targetType: PrismaBroadcastTargetType;
      targetId?: string | null;
      targetName?: string | null;
      priority: PrismaBroadcastPriority;
      recipientCount: number;
      deliveredCount: number;
      channels: string[];
    },
  ): Promise<PrismaBroadcastLog> {
    return this.prisma.withTenant((client) =>
      client.broadcastLog.create({
        data: {
          tenantId,
          senderId,
          title: data.title,
          body: data.body,
          targetType: data.targetType,
          targetId: data.targetId ?? null,
          targetName: data.targetName ?? null,
          priority: data.priority,
          recipientCount: data.recipientCount,
          deliveredCount: data.deliveredCount,
          channels: data.channels,
        },
      }),
    );
  }

  async findBroadcastLogs(
    tenantId: string,
    limit = 50,
  ): Promise<
    (PrismaBroadcastLog & {
      sender?: { firstName: string | null; lastName: string | null; email: string };
    })[]
  > {
    return this.prisma.withTenant((client) =>
      client.broadcastLog.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          sender: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
    );
  }

  async getBroadcastStats(tenantId: string): Promise<{
    totalBroadcasts: number;
    thisMonthBroadcasts: number;
    urgentBroadcasts: number;
    totalDelivered: number;
  }> {
    return this.prisma.withTenant(async (client) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalBroadcasts, thisMonthBroadcasts, urgentBroadcasts, deliveredAgg] =
        await Promise.all([
          client.broadcastLog.count({ where: { tenantId } }),
          client.broadcastLog.count({
            where: { tenantId, createdAt: { gte: startOfMonth } },
          }),
          client.broadcastLog.count({
            where: { tenantId, priority: 'URGENT' },
          }),
          client.broadcastLog.aggregate({
            where: { tenantId },
            _sum: { deliveredCount: true },
          }),
        ]);

      return {
        totalBroadcasts,
        thisMonthBroadcasts,
        urgentBroadcasts,
        totalDelivered: deliveredAgg._sum.deliveredCount ?? 0,
      };
    });
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
