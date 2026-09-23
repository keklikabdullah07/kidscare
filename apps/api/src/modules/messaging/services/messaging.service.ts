import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import type {
  ConversationCreate,
  ConversationStatusUpdate,
  MessageCreate,
  ParentRequestCreate,
  ParentRequestResolve,
} from '@kidscare/shared-schemas';
import type {
  Conversation,
  ConversationStatus,
  Message,
  ParentRequest,
  ParentRequestStatus,
} from '@kidscare/shared-types';
import type {
  ConversationRow,
  IMessagingRepository,
  MessageRow,
  ParentRequestRow,
} from '../repositories/messaging.repository';

@Injectable()
export class MessagingService {
  constructor(
    @Inject('IMessagingRepository')
    private readonly repo: IMessagingRepository,
  ) {}

  // ===== Conversations =====
  async listConversations(
    tenantId: string,
    userId: string,
    status?: ConversationStatus,
  ): Promise<Conversation[]> {
    const rows = await this.repo.listConversations(tenantId, { userId, status });
    return Promise.all(
      rows.map(async (row) => {
        const unreadCount = await this.repo.unreadCount(tenantId, row.id, userId);
        return this.conversationToResponse(row, unreadCount);
      }),
    );
  }

  async createConversation(
    tenantId: string,
    createdById: string,
    input: ConversationCreate,
  ): Promise<Conversation> {
    const participantIds = Array.from(new Set([createdById, ...input.participantIds]));
    const row = await this.repo.createConversation(
      tenantId,
      {
        subject: input.subject,
        category: input.category,
        studentId: input.studentId ?? null,
        isCritical: input.isCritical ?? false,
        createdById,
        status: 'OPEN',
        lastMessageAt: new Date(),
      },
      participantIds,
    );
    await this.repo.createMessage(tenantId, {
      conversationId: row.id,
      senderId: createdById,
      content: input.initialMessage,
      isCritical: input.isCritical ?? false,
    });
    return this.conversationToResponse(row, 0);
  }

  async updateStatus(
    tenantId: string,
    userId: string,
    id: string,
    input: ConversationStatusUpdate,
  ): Promise<Conversation> {
    const conv = await this.repo.findConversation(tenantId, id);
    if (!conv) throw new NotFoundException('Conversation not found');
    const isParticipant = conv.participants.some((p: { userId: string }) => p.userId === userId);
    if (!isParticipant) throw new ForbiddenException('Bu sohbete erişim yok');
    const row = await this.repo.updateConversationStatus(tenantId, id, input.status);
    return this.conversationToResponse(row, 0);
  }

  async listMessages(tenantId: string, userId: string, conversationId: string): Promise<Message[]> {
    const conv = await this.repo.findConversation(tenantId, conversationId);
    if (!conv) throw new NotFoundException('Conversation not found');
    const isParticipant = conv.participants.some((p: { userId: string }) => p.userId === userId);
    if (!isParticipant) throw new ForbiddenException('Bu sohbete erişim yok');
    const rows = await this.repo.listMessages(tenantId, conversationId);
    return rows.map((row) => this.messageToResponse(row));
  }

  async createMessage(
    tenantId: string,
    userId: string,
    conversationId: string,
    input: MessageCreate,
  ): Promise<Message> {
    const conv = await this.repo.findConversation(tenantId, conversationId);
    if (!conv) throw new NotFoundException('Conversation not found');
    const isParticipant = conv.participants.some((p: { userId: string }) => p.userId === userId);
    if (!isParticipant) throw new ForbiddenException('Bu sohbete erişim yok');
    if (conv.status !== 'OPEN') {
      throw new ForbiddenException('Kapalı sohbete mesaj gönderilemez');
    }
    const row = await this.repo.createMessage(tenantId, {
      conversationId,
      senderId: userId,
      content: input.content,
      isCritical: input.isCritical ?? false,
    });
    await this.repo.touchConversation(tenantId, conversationId, row.createdAt);
    return this.messageToResponse(row);
  }

  async markRead(tenantId: string, userId: string, conversationId: string): Promise<void> {
    const conv = await this.repo.findConversation(tenantId, conversationId);
    if (!conv) throw new NotFoundException('Conversation not found');
    const isParticipant = conv.participants.some((p: { userId: string }) => p.userId === userId);
    if (!isParticipant) throw new ForbiddenException('Bu sohbete erişim yok');
    const messages = await this.repo.listMessages(tenantId, conversationId);
    for (const msg of messages) {
      await this.repo.markMessageRead(tenantId, msg.id, userId);
    }
  }

  // ===== Parent Requests =====
  async listParentRequests(
    tenantId: string,
    filters?: { parentId?: string; status?: ParentRequestStatus },
  ): Promise<ParentRequest[]> {
    const rows = await this.repo.listParentRequests(tenantId, filters);
    return rows.map((row) => this.parentRequestToResponse(row));
  }

  async createParentRequest(
    tenantId: string,
    parentId: string,
    input: ParentRequestCreate,
  ): Promise<ParentRequest> {
    const row = await this.repo.createParentRequest(tenantId, {
      parentId,
      studentId: input.studentId ?? null,
      type: input.type,
      subject: input.subject,
      description: input.description,
      status: 'PENDING',
    });
    return this.parentRequestToResponse(row);
  }

  async resolveParentRequest(
    tenantId: string,
    resolvedById: string,
    id: string,
    input: ParentRequestResolve,
  ): Promise<ParentRequest> {
    const existing = await this.repo.findParentRequest(tenantId, id);
    if (!existing) throw new NotFoundException('ParentRequest not found');
    if (existing.status !== 'PENDING') {
      throw new ForbiddenException('Sadece PENDING talepler çözülebilir');
    }
    const row = await this.repo.updateParentRequest(tenantId, id, {
      status: input.status,
      resolvedBy: { connect: { id: resolvedById } },
      resolvedAt: new Date(),
      ...(input.resolutionNote !== undefined ? { resolutionNote: input.resolutionNote } : {}),
    });
    return this.parentRequestToResponse(row);
  }

  private conversationToResponse(row: ConversationRow, unreadCount: number): Conversation {
    return {
      id: row.id,
      tenantId: row.tenantId,
      subject: row.subject,
      category: row.category,
      status: row.status,
      isCritical: row.isCritical,
      studentId: row.studentId,
      createdById: row.createdById,
      participantIds: row.participants.map((p: { userId: string }) => p.userId),
      lastMessageAt: row.lastMessageAt ? row.lastMessageAt.toISOString() : null,
      unreadCount,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private messageToResponse(row: MessageRow): Message {
    return {
      id: row.id,
      tenantId: row.tenantId,
      conversationId: row.conversationId,
      senderId: row.senderId,
      content: row.content,
      isCritical: row.isCritical,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private parentRequestToResponse(row: ParentRequestRow): ParentRequest {
    return {
      id: row.id,
      tenantId: row.tenantId,
      parentId: row.parentId,
      studentId: row.studentId,
      type: row.type,
      subject: row.subject,
      description: row.description,
      status: row.status,
      resolvedById: row.resolvedById,
      resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
      resolutionNote: row.resolutionNote,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
