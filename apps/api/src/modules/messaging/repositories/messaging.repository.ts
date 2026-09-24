import { Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@kidscare/database';
import type { ConversationStatus } from '@kidscare/shared-types';
import { PrismaService } from '../../../prisma/prisma.service';

export type ConversationRow = Prisma.ConversationGetPayload<{
  select: {
    id: true;
    tenantId: true;
    subject: true;
    category: true;
    status: true;
    isCritical: true;
    studentId: true;
    createdById: true;
    lastMessageAt: true;
    createdAt: true;
    updatedAt: true;
    participants: { select: { userId: true } };
  };
}>;

export type MessageRow = Prisma.MessageGetPayload<{
  select: {
    id: true;
    tenantId: true;
    conversationId: true;
    senderId: true;
    content: true;
    isCritical: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export type ParentRequestRow = Prisma.ParentRequestGetPayload<{
  select: {
    id: true;
    tenantId: true;
    parentId: true;
    studentId: true;
    type: true;
    subject: true;
    description: true;
    status: true;
    resolvedById: true;
    resolvedAt: true;
    resolutionNote: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

const CONVERSATION_SELECT = {
  id: true,
  tenantId: true,
  subject: true,
  category: true,
  status: true,
  isCritical: true,
  studentId: true,
  createdById: true,
  lastMessageAt: true,
  createdAt: true,
  updatedAt: true,
  participants: { select: { userId: true } },
} as const;

const MESSAGE_SELECT = {
  id: true,
  tenantId: true,
  conversationId: true,
  senderId: true,
  content: true,
  isCritical: true,
  createdAt: true,
  updatedAt: true,
} as const;

const PARENT_REQUEST_SELECT = {
  id: true,
  tenantId: true,
  parentId: true,
  studentId: true,
  type: true,
  subject: true,
  description: true,
  status: true,
  resolvedById: true,
  resolvedAt: true,
  resolutionNote: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface IMessagingRepository {
  listConversations(
    tenantId: string,
    filters: { userId: string; status?: Prisma.ConversationWhereInput['status'] },
  ): Promise<ConversationRow[]>;
  findConversation(tenantId: string, id: string): Promise<ConversationRow | null>;
  createConversation(
    tenantId: string,
    data: Omit<Prisma.ConversationUncheckedCreateInput, 'tenantId'>,
    participantIds: string[],
  ): Promise<ConversationRow>;
  updateConversationStatus(
    tenantId: string,
    id: string,
    status: Prisma.ConversationUpdateInput['status'],
  ): Promise<ConversationRow>;
  touchConversation(tenantId: string, id: string, at: Date): Promise<void>;
  listMessages(tenantId: string, conversationId: string): Promise<MessageRow[]>;
  createMessage(
    tenantId: string,
    data: Omit<Prisma.MessageUncheckedCreateInput, 'tenantId'>,
  ): Promise<MessageRow>;
  markMessageRead(tenantId: string, messageId: string, userId: string): Promise<void>;
  unreadCount(tenantId: string, conversationId: string, userId: string): Promise<number>;

  listParentRequests(
    tenantId: string,
    filters?: { parentId?: string; status?: Prisma.ParentRequestWhereInput['status'] },
  ): Promise<ParentRequestRow[]>;
  createParentRequest(
    tenantId: string,
    data: Omit<Prisma.ParentRequestUncheckedCreateInput, 'tenantId'>,
  ): Promise<ParentRequestRow>;
  updateParentRequest(
    tenantId: string,
    id: string,
    data: Prisma.ParentRequestUpdateInput,
  ): Promise<ParentRequestRow>;
  findParentRequest(tenantId: string, id: string): Promise<ParentRequestRow | null>;
  resolveDefaultParticipants(
    tenantId: string,
    createdById: string,
    studentId?: string | null,
  ): Promise<string[]>;
}

@Injectable()
export class MessagingRepository implements IMessagingRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listConversations(
    tenantId: string,
    filters: { userId: string; status?: Prisma.ConversationWhereInput['status'] },
  ): Promise<ConversationRow[]> {
    return this.prisma.withTenant((client) =>
      client.conversation.findMany({
        where: {
          tenantId,
          participants: { some: { userId: filters.userId } },
          ...(filters.status ? { status: filters.status } : {}),
        },
        select: CONVERSATION_SELECT,
        orderBy: [{ isCritical: 'desc' }, { lastMessageAt: 'desc' }],
      }),
    );
  }

  async findConversation(tenantId: string, id: string): Promise<ConversationRow | null> {
    return this.prisma.withTenant((client) =>
      client.conversation.findFirst({ where: { tenantId, id }, select: CONVERSATION_SELECT }),
    );
  }

  async createConversation(
    tenantId: string,
    data: Omit<Prisma.ConversationUncheckedCreateInput, 'tenantId'>,
    participantIds: string[],
  ): Promise<ConversationRow> {
    return this.prisma.withTenant((client) =>
      client.conversation.create({
        data: {
          ...data,
          tenantId,
          participants: {
            create: participantIds.map((userId) => ({ tenantId, userId })),
          },
        },
        select: CONVERSATION_SELECT,
      }),
    );
  }

  async updateConversationStatus(
    tenantId: string,
    id: string,
    status: ConversationStatus,
  ): Promise<ConversationRow> {
    return this.prisma.withTenant(async (client) => {
      const existing = await client.conversation.findFirst({
        where: { tenantId, id },
        select: { id: true },
      });
      if (!existing) throw new Error('Conversation not found');
      return client.conversation.update({
        where: { id: existing.id },
        data: status !== undefined ? { status } : {},
        select: CONVERSATION_SELECT,
      });
    });
  }

  async touchConversation(tenantId: string, id: string, at: Date): Promise<void> {
    await this.prisma.withTenant(async (client) => {
      const existing = await client.conversation.findFirst({
        where: { tenantId, id },
        select: { id: true },
      });
      if (!existing) return;
      await client.conversation.update({
        where: { id: existing.id },
        data: { lastMessageAt: at },
      });
    });
  }

  async listMessages(tenantId: string, conversationId: string): Promise<MessageRow[]> {
    return this.prisma.withTenant((client) =>
      client.message.findMany({
        where: { tenantId, conversationId },
        select: MESSAGE_SELECT,
        orderBy: { createdAt: 'asc' },
      }),
    );
  }

  async createMessage(
    tenantId: string,
    data: Omit<Prisma.MessageUncheckedCreateInput, 'tenantId'>,
  ): Promise<MessageRow> {
    return this.prisma.withTenant((client) =>
      client.message.create({ data: { ...data, tenantId }, select: MESSAGE_SELECT }),
    );
  }

  async markMessageRead(tenantId: string, messageId: string, userId: string): Promise<void> {
    await this.prisma.withTenant((client) =>
      client.messageReadReceipt.upsert({
        where: { messageId_userId: { messageId, userId } },
        create: { tenantId, messageId, userId },
        update: {},
      }),
    );
  }

  async unreadCount(tenantId: string, conversationId: string, userId: string): Promise<number> {
    return this.prisma.withTenant((client) =>
      client.message.count({
        where: {
          tenantId,
          conversationId,
          receipts: { none: { userId } },
          NOT: { senderId: userId },
        },
      }),
    );
  }

  async listParentRequests(
    tenantId: string,
    filters?: { parentId?: string; status?: Prisma.ParentRequestWhereInput['status'] },
  ): Promise<ParentRequestRow[]> {
    return this.prisma.withTenant((client) =>
      client.parentRequest.findMany({
        where: {
          tenantId,
          ...(filters?.parentId ? { parentId: filters.parentId } : {}),
          ...(filters?.status ? { status: filters.status } : {}),
        },
        select: PARENT_REQUEST_SELECT,
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async createParentRequest(
    tenantId: string,
    data: Omit<Prisma.ParentRequestUncheckedCreateInput, 'tenantId'>,
  ): Promise<ParentRequestRow> {
    return this.prisma.withTenant((client) =>
      client.parentRequest.create({ data: { ...data, tenantId }, select: PARENT_REQUEST_SELECT }),
    );
  }

  async updateParentRequest(
    tenantId: string,
    id: string,
    data: Prisma.ParentRequestUpdateInput,
  ): Promise<ParentRequestRow> {
    return this.prisma.withTenant(async (client) => {
      const existing = await client.parentRequest.findFirst({
        where: { tenantId, id },
        select: { id: true },
      });
      if (!existing) throw new Error('ParentRequest not found');
      return client.parentRequest.update({
        where: { id: existing.id },
        data,
        select: PARENT_REQUEST_SELECT,
      });
    });
  }

  async findParentRequest(tenantId: string, id: string): Promise<ParentRequestRow | null> {
    return this.prisma.withTenant((client) =>
      client.parentRequest.findFirst({ where: { tenantId, id }, select: PARENT_REQUEST_SELECT }),
    );
  }

  async resolveDefaultParticipants(
    tenantId: string,
    createdById: string,
    studentId?: string | null,
  ): Promise<string[]> {
    return this.prisma.withTenant(async (client) => {
      const recipientIds = new Set<string>();

      // Always include active admins
      const admins = await client.user.findMany({
        where: { tenantId, role: { in: ['ADMIN', 'SUPER_ADMIN'] }, isActive: true },
        select: { id: true },
      });
      for (const a of admins) {
        if (a.id !== createdById) recipientIds.add(a.id);
      }

      if (studentId) {
        const student = await client.student.findFirst({
          where: { tenantId, id: studentId },
          select: { parentId: true, classroomId: true },
        });

        if (student) {
          if (student.parentId && student.parentId !== createdById) {
            recipientIds.add(student.parentId);
          }

          if (student.classroomId) {
            const teachers = await client.classroomTeacher.findMany({
              where: {
                tenantId,
                classroomId: student.classroomId,
                removedAt: null,
              },
              select: { teacherId: true },
            });
            for (const t of teachers) {
              if (t.teacherId !== createdById) recipientIds.add(t.teacherId);
            }
          }
        }
      }

      return Array.from(recipientIds);
    });
  }
}
