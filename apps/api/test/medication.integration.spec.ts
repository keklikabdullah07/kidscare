/* eslint-disable */
import { PrismaClient } from '@kidscare/database';
import { runWithTenant } from '@kidscare/tenant-context';
import { MedicationService } from '../src/modules/medication/services/medication.service';
import type { IMedicationRepository } from '../src/modules/medication/repositories/medication.repository';

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

async function seedTenant(): Promise<{ tenantId: string; userId: string; studentId: string; teacherId: string }> {
  const tenantId = `med-int-${Math.random().toString(36).slice(2, 10)}`;
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const userId = `${tenantId}-admin-${nonce}`;
  const studentId = `${tenantId}-student-${nonce}`;
  const teacherId = `${tenantId}-teacher-${nonce}`;
  await prisma.$transaction(async (tx: any) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
    await tx.tenant.create({ data: { id: tenantId, slug: `med-${nonce}`, name: tenantId } });
    await tx.user.create({
      data: { id: userId, tenantId, email: `${tenantId}-a-${nonce}@x`, passwordHash: 'x', role: 'ADMIN' },
    });
    await tx.user.create({
      data: { id: teacherId, tenantId, email: `${tenantId}-t-${nonce}@x`, passwordHash: 'x', role: 'TEACHER' },
    });
    await tx.student.create({
      data: { id: studentId, tenantId, firstName: 'Test', lastName: 'Kid', dateOfBirth: new Date('2020-01-01') },
    });
  });
  tracked.add(tenantId);
  return { tenantId, userId, studentId, teacherId };
}

async function cleanup(): Promise<void> {
  for (const tid of tracked) {
    await prisma.$transaction(async (tx: any) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tid}'`);
      await tx.medicationRecord.deleteMany({ where: { tenantId: tid } });
      await tx.student.deleteMany({ where: { tenantId: tid } });
      await tx.user.deleteMany({ where: { tenantId: tid } });
      await tx.tenant.deleteMany({ where: { id: tid } });
    });
  }
  tracked.clear();
}

function buildRepo(overrides: Partial<IMedicationRepository> = {}): IMedicationRepository {
  return {
    list: async (tid: string) => {
      const tx = forTenant(tid);
      return tx.medicationRecord.findMany({ where: { tenantId: tid }, orderBy: { createdAt: 'asc' } });
    },
    find: async (tid: string, id: string) => {
      const tx = forTenant(tid);
      return tx.medicationRecord.findFirst({ where: { id, tenantId: tid } });
    },
    create: async (tid: string, data: any) => {
      const tx = forTenant(tid);
      return tx.medicationRecord.create({ data: { ...data, tenantId: tid } });
    },
    update: async (tid: string, id: string, data: any) => {
      const tx = forTenant(tid);
      const existing = await tx.medicationRecord.findFirst({ where: { id, tenantId: tid } });
      if (!existing) throw new Error('not found');
      return tx.medicationRecord.update({ where: { id: existing.id }, data });
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

describe('MedicationService (integration)', () => {
  it('full lifecycle: REQUESTED → APPROVED → GIVEN', async () => {
    const { tenantId, userId, studentId, teacherId } = await seedTenant();
    const repo = buildRepo();
    const svc = new MedicationService(repo);

    let recordId: string;
    await runWithTenant({ tenantId, userId, role: 'PARENT' }, async () => {
      const created = await svc.create(tenantId, userId, {
        studentId,
        medicationName: 'Parol',
        dosage: '5ml',
      });
      expect(created.status).toBe('REQUESTED');
      recordId = created.id;
    });

    await runWithTenant({ tenantId, userId, role: 'ADMIN' }, async () => {
      const approved = await svc.approve(tenantId, recordId!, userId, {});
      expect(approved.status).toBe('APPROVED');
      expect(approved.approvedById).toBe(userId);
    });

    await runWithTenant({ tenantId, userId: teacherId, role: 'TEACHER' }, async () => {
      const given = await svc.markGiven(tenantId, recordId!, teacherId, {});
      expect(given.status).toBe('GIVEN');
      expect(given.administeredById).toBe(teacherId);
      expect(given.givenAt).not.toBeNull();
    });

    const tx = forTenant(tenantId);
    const persisted = await tx.medicationRecord.findUnique({ where: { id: recordId! } });
    expect(persisted?.status).toBe('GIVEN');
    expect(persisted?.approvedById).toBe(userId);
    expect(persisted?.administeredById).toBe(teacherId);
  });

  it('rejects approving non-REQUESTED record', async () => {
    const { tenantId, userId, studentId } = await seedTenant();
    const repo = buildRepo();
    const svc = new MedicationService(repo);

    let recordId: string;
    await runWithTenant({ tenantId, userId, role: 'PARENT' }, async () => {
      const created = await svc.create(tenantId, userId, { studentId, medicationName: 'X', dosage: '1' });
      recordId = created.id;
    });
    await runWithTenant({ tenantId, userId, role: 'ADMIN' }, async () => {
      await svc.approve(tenantId, recordId!, userId, {});
      await expect(svc.approve(tenantId, recordId!, userId, {})).rejects.toThrow(/REQUESTED/);
    });
  });

  it('blocks marking given on unapproved record (ForbiddenException)', async () => {
    const { tenantId, userId, studentId, teacherId } = await seedTenant();
    const repo = buildRepo();
    const svc = new MedicationService(repo);

    let recordId: string;
    await runWithTenant({ tenantId, userId, role: 'PARENT' }, async () => {
      const created = await svc.create(tenantId, userId, { studentId, medicationName: 'X', dosage: '1' });
      recordId = created.id;
    });
    await runWithTenant({ tenantId, userId: teacherId, role: 'TEACHER' }, async () => {
      await expect(svc.markGiven(tenantId, recordId!, teacherId, {})).rejects.toThrow(/Onaylanmamış/);
    });
  });

  it('reject flow sets rejection reason', async () => {
    const { tenantId, userId, studentId } = await seedTenant();
    const repo = buildRepo();
    const svc = new MedicationService(repo);

    let recordId: string;
    await runWithTenant({ tenantId, userId, role: 'PARENT' }, async () => {
      const created = await svc.create(tenantId, userId, { studentId, medicationName: 'X', dosage: '1' });
      recordId = created.id;
    });
    await runWithTenant({ tenantId, userId, role: 'ADMIN' }, async () => {
      const rejected = await svc.reject(tenantId, recordId!, userId, { reason: 'Yanlış doz' });
      expect(rejected.status).toBe('REJECTED');
      expect(rejected.rejectionReason).toBe('Yanlış doz');
    });
  });
});
