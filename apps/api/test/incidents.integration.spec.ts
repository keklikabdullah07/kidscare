/* eslint-disable */
import { PrismaClient } from '@kidscare/database';
import { runWithTenant } from '@kidscare/tenant-context';
import { IncidentsService } from '../src/modules/incidents/services/incidents.service';
import type { IIncidentsRepository } from '../src/modules/incidents/repositories/incidents.repository';

const APP_URL = process.env.DATABASE_APP_URL ?? '';
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

const tracked: Set<string> = new Set();

async function seedTenant(): Promise<{ tenantId: string; userId: string; studentId: string }> {
  const tenantId = `inc-int-${Math.random().toString(36).slice(2, 10)}`;
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const userId = `${tenantId}-teacher-${nonce}`;
  const studentId = `${tenantId}-student-${nonce}`;
  await prisma.$transaction(async (tx: any) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
    await tx.tenant.create({ data: { id: tenantId, slug: `inc-${nonce}`, name: tenantId } });
    await tx.user.create({
      data: { id: userId, tenantId, email: `${tenantId}-${nonce}@x`, passwordHash: 'x', role: 'TEACHER' },
    });
    await tx.student.create({
      data: { id: studentId, tenantId, firstName: 'Test', lastName: 'Kid', dateOfBirth: new Date('2020-01-01') },
    });
  });
  tracked.add(tenantId);
  return { tenantId, userId, studentId };
}

async function cleanup(): Promise<void> {
  for (const tid of tracked) {
    await prisma.$transaction(async (tx: any) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tid}'`);
      await tx.incidentRecord.deleteMany({ where: { tenantId: tid } });
      await tx.student.deleteMany({ where: { tenantId: tid } });
      await tx.user.deleteMany({ where: { tenantId: tid } });
      await tx.tenant.deleteMany({ where: { id: tid } });
    });
  }
  tracked.clear();
}

function buildRepo(): IIncidentsRepository {
  return {
    list: async (tid: string, f?: any) => {
      const tx = forTenant(tid);
      return tx.incidentRecord.findMany({
        where: {
          tenantId: tid,
          ...(f?.studentId ? { studentId: f.studentId } : {}),
          ...(f?.category ? { category: f.category } : {}),
        },
        orderBy: { occurredAt: 'desc' },
      });
    },
    find: async (tid: string, id: string) => {
      const tx = forTenant(tid);
      return tx.incidentRecord.findFirst({ where: { id, tenantId: tid } });
    },
    create: async (tid: string, data: any) => {
      const tx = forTenant(tid);
      return tx.incidentRecord.create({ data: { ...data, tenantId: tid } });
    },
    update: async (tid: string, id: string, data: any) => {
      const tx = forTenant(tid);
      const existing = await tx.incidentRecord.findFirst({ where: { id, tenantId: tid } });
      if (!existing) throw new Error('not found');
      return tx.incidentRecord.update({ where: { id: existing.id }, data });
    },
  };
}

beforeEach(async () => {
  await cleanup();
});
afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe('IncidentsService (integration)', () => {
  it('creates incident and tracks parent notification', async () => {
    const { tenantId, userId, studentId } = await seedTenant();
    const repo = buildRepo();
    const svc = new IncidentsService(repo);

    let incidentId: string;
    await runWithTenant({ tenantId, userId, role: 'TEACHER' }, async () => {
      const created = await svc.create(tenantId, userId, {
        studentId,
        category: 'DUSME',
        occurredAt: new Date('2026-09-15T10:00:00Z'),
        description: 'Bahçede düştü',
        actionTaken: 'Buz konuldu',
      });
      expect(created.parentNotified).toBe(false);
      incidentId = created.id;
    });

    // Now mark parent notified
    await runWithTenant({ tenantId, userId, role: 'TEACHER' }, async () => {
      const updated = await svc.update(tenantId, incidentId!, userId, { parentNotified: true });
      expect(updated.parentNotified).toBe(true);
      expect(updated.parentNotifiedById).toBe(userId);
      expect(updated.parentNotifiedAt).not.toBeNull();
    });

    // Verify in DB
    const tx = forTenant(tenantId);
    const persisted = await tx.incidentRecord.findUnique({ where: { id: incidentId! } });
    expect(persisted?.parentNotified).toBe(true);
    expect(persisted?.parentNotifiedById).toBe(userId);
  });

  it('creates incident without parent notification by default', async () => {
    const { tenantId, userId, studentId } = await seedTenant();
    const repo = buildRepo();
    const svc = new IncidentsService(repo);

    await runWithTenant({ tenantId, userId, role: 'TEACHER' }, async () => {
      const created = await svc.create(tenantId, userId, {
        studentId,
        category: 'YARALANMA',
        occurredAt: new Date('2026-09-15T11:00:00Z'),
        description: 'Sıyrık',
      });
      expect(created.parentNotified).toBe(false);
      expect(created.parentNotifiedAt).toBeNull();
    });
  });

  it('lists incidents filtered by student', async () => {
    const { tenantId, userId, studentId } = await seedTenant();
    const repo = buildRepo();
    const svc = new IncidentsService(repo);

    await runWithTenant({ tenantId, userId, role: 'TEACHER' }, async () => {
      await svc.create(tenantId, userId, {
        studentId,
        category: 'KAZA',
        occurredAt: new Date(),
        description: 'A',
      });
      const list = await svc.list(tenantId, { studentId });
      expect(list.length).toBeGreaterThan(0);
      expect(list.every((i) => i.studentId === studentId)).toBe(true);
    });
  });
});
