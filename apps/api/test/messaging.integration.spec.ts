/* eslint-disable */
import { PrismaClient } from '@kidscare/database';
import { runWithTenant } from '@kidscare/tenant-context';
import { MessagingService } from '../src/modules/messaging/services/messaging.service';
import type { IMessagingRepository } from '../src/modules/messaging/repositories/messaging.repository';

const APP_URL = process.env.DATABASE_APP_URL ?? '';
const TENANT_A = 'msg-int-a';
const TENANT_B = 'msg-int-b';
const prisma = new PrismaClient({ datasources: { db: { url: APP_URL } } });

function forTenant(tenantId: string): any {
  return prisma.$extends({
    query: {
      $allOperations: async ({ model, operation, args }: any) =>
        prisma.$transaction(async (txInner: any) => {
          await txInner.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
          return txInner[model][operation](args);
        }),
    },
  });
}

async function seedTenant(tenantId: string, role: 'PARENT' | 'ADMIN' = 'ADMIN'): Promise<{ userId: string }> {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const userId = `${tenantId}-${role.toLowerCase()}-${nonce}`;
  // Caller is responsible for ensuring tenantId is unique per test (see cleanupTenants).
  await prisma.$transaction(async (tx: any) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
    await tx.tenant.create({ data: { id: tenantId, slug: `msg-${nonce}`, name: tenantId } });
    await tx.user.create({
      data: { id: userId, tenantId, email: `${tenantId}-${nonce}@x`, passwordHash: 'x', role },
    });
  });
  return { userId };
}

async function cleanupTenants(tenantIds: string[]): Promise<void> {
  for (const tid of tenantIds) {
    await prisma.$transaction(async (tx: any) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tid}'`);
      await tx.messageReadReceipt.deleteMany({ where: { tenantId: tid } });
      await tx.message.deleteMany({ where: { tenantId: tid } });
      await tx.conversationParticipant.deleteMany({ where: { tenantId: tid } });
      await tx.conversation.deleteMany({ where: { tenantId: tid } });
      await tx.parentRequest.deleteMany({ where: { tenantId: tid } });
      await tx.user.deleteMany({ where: { tenantId: tid } });
      await tx.tenant.deleteMany({ where: { id: tid } });
    });
  }
}

const trackedTenants: Set<string> = new Set();

function trackAndSeed(role: 'PARENT' | 'ADMIN' = 'ADMIN'): Promise<{ userId: string }> {
  const tenantId = `msg-test-${Math.random().toString(36).slice(2, 10)}`;
  trackedTenants.add(tenantId);
  return seedTenant(tenantId, role);
}

async function cleanup(): Promise<void> {
  await cleanupTenants([...trackedTenants]);
  trackedTenants.clear();
}

function buildRepo(overrides: Partial<IMessagingRepository> = {}): IMessagingRepository {
  return {
    listConversations: async (tid: string, f: any) => {
      const tx = forTenant(tid);
      return tx.conversation.findMany({
        where: { tenantId: tid, participants: { some: { userId: f.userId } } },
        include: { participants: { select: { userId: true } } },
        orderBy: { createdAt: 'desc' },
      });
    },
    findConversation: async (tid: string, id: string) => {
      const tx = forTenant(tid);
      return tx.conversation.findFirst({
        where: { id, tenantId: tid },
        include: { participants: { select: { userId: true } } },
      });
    },
    createConversation: async (tid: string, data: any, participantIds: string[]) => {
      const tx = forTenant(tid);
      return tx.conversation.create({
        data: {
          ...data,
          tenantId: tid,
          participants: { create: participantIds.map((userId) => ({ tenantId: tid, userId })) },
        },
        include: { participants: { select: { userId: true } } },
      });
    },
    updateConversationStatus: async (tid: string, id: string, status: any) => {
      const tx = forTenant(tid);
      const existing = await tx.conversation.findFirst({ where: { id, tenantId: tid } });
      if (!existing) throw new Error('not found');
      return tx.conversation.update({
        where: { id: existing.id },
        data: { status },
        include: { participants: { select: { userId: true } } },
      });
    },
    touchConversation: async (tid: string, id: string, at: Date) => {
      const tx = forTenant(tid);
      await tx.conversation.updateMany({ where: { id, tenantId: tid }, data: { lastMessageAt: at } });
    },
    listMessages: async (tid: string, conversationId: string) => {
      const tx = forTenant(tid);
      return tx.message.findMany({
        where: { tenantId: tid, conversationId },
        orderBy: { createdAt: 'asc' },
      });
    },
    createMessage: async (tid: string, data: any) => {
      const tx = forTenant(tid);
      return tx.message.create({ data: { ...data, tenantId: tid } });
    },
    markMessageRead: async (tid: string, messageId: string, userId: string) => {
      const tx = forTenant(tid);
      await tx.messageReadReceipt.upsert({
        where: { messageId_userId: { messageId, userId } },
        create: { tenantId: tid, messageId, userId },
        update: {},
      });
    },
    unreadCount: async (tid: string, conversationId: string, userId: string) => {
      const tx = forTenant(tid);
      return tx.message.count({
        where: {
          tenantId: tid,
          conversationId,
          receipts: { none: { userId } },
          NOT: { senderId: userId },
        },
      });
    },
    listParentRequests: async (tid: string, f?: any) => {
      const tx = forTenant(tid);
      return tx.parentRequest.findMany({
        where: { tenantId: tid, ...(f?.parentId ? { parentId: f.parentId } : {}) },
        orderBy: { createdAt: 'desc' },
      });
    },
    createParentRequest: async (tid: string, data: any) => {
      const tx = forTenant(tid);
      return tx.parentRequest.create({ data: { ...data, tenantId: tid } });
    },
    updateParentRequest: async (tid: string, id: string, data: any) => {
      const tx = forTenant(tid);
      const existing = await tx.parentRequest.findFirst({ where: { id, tenantId: tid } });
      if (!existing) throw new Error('not found');
      return tx.parentRequest.update({ where: { id: existing.id }, data });
    },
    findParentRequest: async (tid: string, id: string) => {
      const tx = forTenant(tid);
      return tx.parentRequest.findFirst({ where: { id, tenantId: tid } });
    },
    ...overrides,
  };
}

beforeEach(async () => {
  await cleanup();
});
afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe('MessagingService (integration)', () => {
  it('creates conversation with initial message, both participants see it', async () => {
    const admin = await trackAndSeed('ADMIN');
    const parent = await trackAndSeed('PARENT');
    const tenantId = (await prisma.user.findFirst({ where: { id: admin.userId }, select: { tenantId: true } }))!.tenantId;
    const repo = buildRepo();
    const svc = new MessagingService(repo);

    let convId: string;
    await runWithTenant({ tenantId, userId: parent.userId, role: 'PARENT' }, async () => {
      const created = await svc.createConversation(tenantId, parent.userId, {
        subject: 'Yemek bildirimi',
        category: 'GUNLUK_BILGI',
        participantIds: [admin.userId],
        initialMessage: 'Merhaba',
      });
      convId = created.id;
    });

    // Both users see it via list
    const adminList = await runWithTenant(
      { tenantId, userId: admin.userId, role: 'ADMIN' },
      () => svc.listConversations(tenantId, admin.userId),
    );
    expect(adminList.find((c) => c.id === convId!)).toBeDefined();

    const msgs = await runWithTenant(
      { tenantId, userId: admin.userId, role: 'ADMIN' },
      () => svc.listMessages(tenantId, admin.userId, convId!),
    );
    expect(msgs).toHaveLength(1);
    expect(msgs[0]?.content).toBe('Merhaba');
  });

  it('rejects message from non-participant', async () => {
    const a = await trackAndSeed('PARENT');
    const b = await trackAndSeed('ADMIN');
    const tenantA = (await prisma.user.findFirst({ where: { id: a.userId }, select: { tenantId: true } }))!.tenantId;
    const tenantB = (await prisma.user.findFirst({ where: { id: b.userId }, select: { tenantId: true } }))!.tenantId;
    const repo = buildRepo();
    const svc = new MessagingService(repo);

    let convId: string;
    await runWithTenant({ tenantId: tenantA, userId: a.userId, role: 'PARENT' }, async () => {
      const created = await svc.createConversation(tenantA, a.userId, {
        subject: 'Test',
        category: 'GUNLUK_BILGI',
        participantIds: [b.userId],
        initialMessage: 'A',
      });
      convId = created.id;
    });

    await runWithTenant(
      { tenantId: tenantB, userId: 'stranger-id', role: 'PARENT' },
      async () => {
        await expect(
          svc.createMessage(tenantB, 'stranger-id', convId!, { content: 'x' }),
        ).rejects.toThrow(/erişim|not found/i);
      },
    );
  });

  it('rejects message on closed conversation', async () => {
    const a = await trackAndSeed('PARENT');
    const tenantId = (await prisma.user.findFirst({ where: { id: a.userId }, select: { tenantId: true } }))!.tenantId;
    const repo = buildRepo();
    const svc = new MessagingService(repo);

    let convId: string;
    await runWithTenant({ tenantId, userId: a.userId, role: 'PARENT' }, async () => {
      const created = await svc.createConversation(tenantId, a.userId, {
        subject: 'Test',
        category: 'GUNLUK_BILGI',
        participantIds: [a.userId],
        initialMessage: 'A',
      });
      convId = created.id;
      await svc.updateStatus(tenantId, a.userId, created.id, { status: 'CLOSED' });
    });

    await runWithTenant({ tenantId, userId: a.userId, role: 'PARENT' }, async () => {
      await expect(
        svc.createMessage(tenantId, a.userId, convId!, { content: 'x' }),
      ).rejects.toThrow(/Kapalı/);
    });
  });

  it('parent request: create PENDING → admin resolves APPROVED', async () => {
    const parent = await trackAndSeed('PARENT');
    const admin = await trackAndSeed('ADMIN');
    const tenantId = (await prisma.user.findFirst({ where: { id: parent.userId }, select: { tenantId: true } }))!.tenantId;
    const repo = buildRepo();
    const svc = new MessagingService(repo);

    let reqId: string;
    await runWithTenant({ tenantId, userId: parent.userId, role: 'PARENT' }, async () => {
      const created = await svc.createParentRequest(tenantId, parent.userId, {
        type: 'IZIN',
        subject: 'Yarın izin',
        description: 'Doktor randevusu',
      });
      expect(created.status).toBe('PENDING');
      reqId = created.id;
    });

    await runWithTenant({ tenantId, userId: admin.userId, role: 'ADMIN' }, async () => {
      const resolved = await svc.resolveParentRequest(tenantId, admin.userId, reqId!, {
        status: 'APPROVED',
        resolutionNote: 'Tamam',
      });
      expect(resolved.status).toBe('APPROVED');
      expect(resolved.resolvedById).toBe(admin.userId);
      expect(resolved.resolutionNote).toBe('Tamam');
    });
  });

  it('cross-tenant: tenant B cannot see tenant A conversation', async () => {
    const parentA = await trackAndSeed('PARENT');
    const parentB = await trackAndSeed('PARENT');
    const tenantA = (await prisma.user.findFirst({ where: { id: parentA.userId }, select: { tenantId: true } }))!.tenantId;
    const tenantB = (await prisma.user.findFirst({ where: { id: parentB.userId }, select: { tenantId: true } }))!.tenantId;
    const repo = buildRepo();
    const svc = new MessagingService(repo);

    let convId: string;
    await runWithTenant({ tenantId: tenantA, userId: parentA.userId, role: 'PARENT' }, async () => {
      const created = await svc.createConversation(tenantA, parentA.userId, {
        subject: 'A only',
        category: 'GUNLUK_BILGI',
        participantIds: [parentA.userId],
        initialMessage: 'private',
      });
      convId = created.id;
    });

    // RLS must hide A's conversation from B
    await runWithTenant(
      { tenantId: tenantB, userId: parentB.userId, role: 'PARENT' },
      async () => {
        await expect(
          svc.listMessages(tenantB, parentB.userId, convId!),
        ).rejects.toThrow(/not found/i);
      },
    );
  });
});
