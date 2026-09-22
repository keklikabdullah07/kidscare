/* eslint-disable */
import { PrismaClient } from '@kidscare/database';
import { runWithTenant } from '@kidscare/tenant-context';
import { PickupService } from '../src/modules/pickup/services/pickup.service';
import type { IPickupRepository } from '../src/modules/pickup/repositories/pickup.repository';

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
  const tenantId = `pickup-int-${Math.random().toString(36).slice(2, 10)}`;
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const userId = `${tenantId}-admin-${nonce}`;
  const studentId = `${tenantId}-student-${nonce}`;
  await prisma.$transaction(async (tx: any) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
    await tx.tenant.create({ data: { id: tenantId, slug: `pickup-${nonce}`, name: tenantId } });
    await tx.user.create({
      data: { id: userId, tenantId, email: `${tenantId}-${nonce}@x`, passwordHash: 'x', role: 'ADMIN' },
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
      await tx.pickupEvent.deleteMany({ where: { tenantId: tid } });
      await tx.pickupAuthorization.deleteMany({ where: { tenantId: tid } });
      await tx.pickupContact.deleteMany({ where: { tenantId: tid } });
      await tx.student.deleteMany({ where: { tenantId: tid } });
      await tx.user.deleteMany({ where: { tenantId: tid } });
      await tx.tenant.deleteMany({ where: { id: tid } });
    });
  }
  tracked.clear();
}

beforeEach(async () => {
  await cleanup();
});
afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

function buildRepo(overrides: Partial<IPickupRepository> = {}): IPickupRepository {
  return {
    listContacts: async (tid: string) => {
      const tx = forTenant(tid);
      return tx.pickupContact.findMany({ where: { tenantId: tid }, orderBy: { createdAt: 'asc' } });
    },
    createContact: async (tid: string, data: any) => {
      const tx = forTenant(tid);
      return tx.pickupContact.create({ data: { ...data, tenantId: tid } });
    },
    updateContact: async () => {
      throw new Error('unused');
    },
    deleteContact: async () => {},
    findContact: async (tid: string, id: string) => {
      const tx = forTenant(tid);
      return tx.pickupContact.findFirst({ where: { id, tenantId: tid } });
    },
    listAuthorizations: async (tid: string) => {
      const tx = forTenant(tid);
      return tx.pickupAuthorization.findMany({ where: { tenantId: tid }, orderBy: { createdAt: 'desc' } });
    },
    createAuthorization: async (tid: string, data: any) => {
      const tx = forTenant(tid);
      return tx.pickupAuthorization.create({ data: { ...data, tenantId: tid } });
    },
    reviewAuthorization: async (tid: string, id: string, data: any) => {
      const tx = forTenant(tid);
      const existing = await tx.pickupAuthorization.findFirst({ where: { id, tenantId: tid } });
      if (!existing) throw new Error('not found');
      return tx.pickupAuthorization.update({ where: { id: existing.id }, data });
    },
    findAuthorization: async (tid: string, id: string) => {
      const tx = forTenant(tid);
      return tx.pickupAuthorization.findFirst({ where: { id, tenantId: tid } });
    },
    listEvents: async (tid: string) => {
      const tx = forTenant(tid);
      return tx.pickupEvent.findMany({ where: { tenantId: tid }, orderBy: { occurredAt: 'desc' } });
    },
    createEvent: async (tid: string, data: any) => {
      const tx = forTenant(tid);
      return tx.pickupEvent.create({ data: { ...data, tenantId: tid } });
    },
    ...overrides,
  };
}

describe('PickupService (integration)', () => {
  it('creates a pickup contact scoped to tenant', async () => {
    const { tenantId, userId, studentId } = await seedTenant();
    const repo = buildRepo();
    const svc = new PickupService(repo);

    let created: any;
    await runWithTenant({ tenantId, userId, role: 'ADMIN' }, async () => {
      created = await svc.createContact(tenantId, {
        studentId,
        fullName: 'Ayşe Teyze',
        relation: 'Teyze',
        phone: '05551112233',
      });
    });

    expect(created.fullName).toBe('Ayşe Teyze');
    expect(created.tenantId).toBe(tenantId);
    expect(created.isActive).toBe(true);

    // RLS check: query as a fresh tenant must not see this contact
    const other = await seedTenant();
    const tx = forTenant(other.tenantId);
    const rows = await tx.pickupContact.findMany({ where: { tenantId } });
    expect(rows).toEqual([]);
  });

  it('creates and reviews authorization PENDING → APPROVED', async () => {
    const { tenantId, userId, studentId } = await seedTenant();
    const repo = buildRepo();
    const svc = new PickupService(repo);

    let authId: string;
    await runWithTenant({ tenantId, userId, role: 'PARENT' }, async () => {
      const created = await svc.createAuthorization(tenantId, userId, {
        studentId,
        note: 'Geçici',
      });
      expect(created.status).toBe('PENDING');
      authId = created.id;
    });

    await runWithTenant({ tenantId, userId, role: 'ADMIN' }, async () => {
      const reviewed = await svc.reviewAuthorization(tenantId, authId!, userId, {
        status: 'APPROVED',
      });
      expect(reviewed.status).toBe('APPROVED');
      expect(reviewed.reviewedById).toBe(userId);
    });
  });

  it('creates a pickup event linked to student and contact', async () => {
    const { tenantId, userId, studentId } = await seedTenant();
    const repo = buildRepo();
    const svc = new PickupService(repo);

    let contactId: string;
    let eventId: string;
    await runWithTenant({ tenantId, userId, role: 'ADMIN' }, async () => {
      const contact = await svc.createContact(tenantId, {
        studentId,
        fullName: 'Dede',
        relation: 'Dede',
        phone: '05550000000',
      });
      contactId = contact.id;
      const event = await svc.createEvent(tenantId, userId, {
        studentId,
        pickupContactId: contact.id,
        pickupPersonName: 'Dede',
        verificationMethod: 'ID_CHECK',
      });
      eventId = event.id;
    });

    const tx = forTenant(tenantId);
    const event = await tx.pickupEvent.findFirst({ where: { id: eventId! } });
    expect(event).not.toBeNull();
    expect(event?.pickupContactId).toBe(contactId!);
    expect(event?.verifiedByUserId).toBe(userId);
    expect(event?.verificationMethod).toBe('ID_CHECK');
  });
});
