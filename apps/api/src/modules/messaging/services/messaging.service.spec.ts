import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type {
  ConversationRow,
  MessageRow,
  ParentRequestRow,
} from '../repositories/messaging.repository';
import { MessagingService } from './messaging.service';
import type { IMessagingRepository } from '../repositories/messaging.repository';

const baseConversation: ConversationRow = {
  id: 'c-1',
  tenantId: 't-1',
  subject: 'Yemek bildirimi',
  category: 'GUNLUK_BILGI',
  status: 'OPEN',
  isCritical: false,
  studentId: 's-1',
  createdById: 'parent-1',
  lastMessageAt: new Date('2026-09-15T10:00:00Z'),
  createdAt: new Date('2026-09-15T10:00:00Z'),
  updatedAt: new Date('2026-09-15T10:00:00Z'),
  participants: [{ userId: 'parent-1' }, { userId: 'admin-1' }],
};

const baseMessage: MessageRow = {
  id: 'm-1',
  tenantId: 't-1',
  conversationId: 'c-1',
  senderId: 'parent-1',
  content: 'Merhaba',
  isCritical: false,
  createdAt: new Date('2026-09-15T10:00:00Z'),
  updatedAt: new Date('2026-09-15T10:00:00Z'),
};

const baseParentRequest: ParentRequestRow = {
  id: 'pr-1',
  tenantId: 't-1',
  parentId: 'parent-1',
  studentId: 's-1',
  type: 'IZIN',
  subject: 'Yarın izin',
  description: 'Doktor randevusu',
  status: 'PENDING',
  resolvedById: null,
  resolvedAt: null,
  resolutionNote: null,
  createdAt: new Date('2026-09-15T10:00:00Z'),
  updatedAt: new Date('2026-09-15T10:00:00Z'),
};

describe('MessagingService', () => {
  let service: MessagingService;
  let repo: jest.Mocked<IMessagingRepository>;

  beforeEach(() => {
    repo = {
      listConversations: jest.fn(),
      findConversation: jest.fn(),
      createConversation: jest.fn(),
      updateConversationStatus: jest.fn(),
      touchConversation: jest.fn(),
      listMessages: jest.fn(),
      createMessage: jest.fn(),
      markMessageRead: jest.fn(),
      unreadCount: jest.fn(),
      listParentRequests: jest.fn(),
      createParentRequest: jest.fn(),
      updateParentRequest: jest.fn(),
      findParentRequest: jest.fn(),
    };
    service = new MessagingService(repo);
  });

  describe('conversations', () => {
    it('lists conversations with unread count', async () => {
      repo.listConversations.mockResolvedValue([baseConversation]);
      repo.unreadCount.mockResolvedValue(3);
      const res = await service.listConversations('t-1', 'parent-1');
      expect(res[0]?.id).toBe('c-1');
      expect(res[0]?.unreadCount).toBe(3);
      expect(res[0]?.participantIds).toEqual(['parent-1', 'admin-1']);
    });

    it('creates conversation with initial message and deduped participants', async () => {
      repo.createConversation.mockResolvedValue(baseConversation);
      repo.createMessage.mockResolvedValue(baseMessage);
      await service.createConversation('t-1', 'parent-1', {
        subject: 'S',
        category: 'DUYURU',
        participantIds: ['admin-1', 'parent-1'],
        initialMessage: 'Selam',
      });
      expect(repo.createConversation).toHaveBeenCalledWith(
        't-1',
        expect.objectContaining({ subject: 'S', createdById: 'parent-1' }),
        ['parent-1', 'admin-1'],
      );
      expect(repo.createMessage).toHaveBeenCalledWith(
        't-1',
        expect.objectContaining({ content: 'Selam', senderId: 'parent-1' }),
      );
    });

    it('rejects message from non-participant', async () => {
      repo.findConversation.mockResolvedValue(baseConversation);
      await expect(
        service.createMessage('t-1', 'stranger', 'c-1', { content: 'hi' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('rejects message on closed conversation', async () => {
      repo.findConversation.mockResolvedValue({ ...baseConversation, status: 'CLOSED' });
      await expect(
        service.createMessage('t-1', 'parent-1', 'c-1', { content: 'hi' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('updates conversation status', async () => {
      repo.findConversation.mockResolvedValue(baseConversation);
      repo.updateConversationStatus.mockResolvedValue({
        ...baseConversation,
        status: 'CLOSED',
      });
      const res = await service.updateStatus('t-1', 'parent-1', 'c-1', { status: 'CLOSED' });
      expect(res.status).toBe('CLOSED');
    });

    it('throws when updating non-participant conversation', async () => {
      repo.findConversation.mockResolvedValue(baseConversation);
      await expect(
        service.updateStatus('t-1', 'stranger', 'c-1', { status: 'CLOSED' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFound on missing conversation', async () => {
      repo.findConversation.mockResolvedValue(null);
      await expect(
        service.updateStatus('t-1', 'parent-1', 'missing', { status: 'CLOSED' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('marks all messages read', async () => {
      repo.findConversation.mockResolvedValue(baseConversation);
      repo.listMessages.mockResolvedValue([baseMessage, { ...baseMessage, id: 'm-2' }]);
      await service.markRead('t-1', 'parent-1', 'c-1');
      expect(repo.markMessageRead).toHaveBeenCalledTimes(2);
    });
  });

  describe('parent requests', () => {
    it('creates request as PENDING', async () => {
      repo.createParentRequest.mockResolvedValue(baseParentRequest);
      await service.createParentRequest('t-1', 'parent-1', {
        type: 'IZIN',
        subject: 'Yarın izin',
        description: 'Doktor',
      });
      expect(repo.createParentRequest).toHaveBeenCalledWith(
        't-1',
        expect.objectContaining({ status: 'PENDING', parentId: 'parent-1' }),
      );
    });

    it('approves request and sets resolvedAt + resolvedBy', async () => {
      repo.findParentRequest.mockResolvedValue(baseParentRequest);
      repo.updateParentRequest.mockResolvedValue({
        ...baseParentRequest,
        status: 'APPROVED',
        resolvedById: 'admin-1',
        resolvedAt: new Date('2026-09-15T11:00:00Z'),
      });
      const res = await service.resolveParentRequest('t-1', 'admin-1', 'pr-1', {
        status: 'APPROVED',
        resolutionNote: 'Tamam',
      });
      expect(res.status).toBe('APPROVED');
      expect(repo.updateParentRequest).toHaveBeenCalledWith(
        't-1',
        'pr-1',
        expect.objectContaining({
          status: 'APPROVED',
          resolvedBy: { connect: { id: 'admin-1' } },
        }),
      );
    });

    it('rejects resolving non-PENDING request', async () => {
      repo.findParentRequest.mockResolvedValue({ ...baseParentRequest, status: 'APPROVED' });
      await expect(
        service.resolveParentRequest('t-1', 'admin-1', 'pr-1', { status: 'REJECTED' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
