import { PrismaClient } from '../generated/client';
import { withTenantContext } from './tenant.middleware';

const prisma = new PrismaClient();
const DEMO_TENANT_ID = 'demo-tenant-seed-001';
const TENANT_A_ID = 'mw-tenant-a';
const TENANT_B_ID = 'mw-tenant-b';

/**
 * Under FORCE ROW LEVEL SECURITY every tenant-scoped write must run inside a
 * transaction whose session variable matches the row being written.
 *
 * We use `upsert` for setup so that re-running the spec against a database
 * that still contains rows from a previous run doesn't blow up on unique
 * constraints. (RLS hides those rows from plain `SELECT`, but the unique
 * index still fires on INSERT.)
 */
async function withTenantSession<T>(
  tenantId: string,
  // The transaction client returned by Prisma's `$transaction(...)` is typed
  // `any` because Prisma doesn't expose a generic for it; see the comment in
  // `tenant.middleware.ts` for the same rationale.
  fn: (tx: any) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
    return fn(tx);
  });
}

describe('withTenantContext', () => {
  // The transaction client `tx` is typed `any` (see comment in
  // `withTenantSession`); every `tx.<model>.<op>(...)` call in this file
  // triggers the `@typescript-eslint/no-unsafe-*` family. The runtime type
  // is correct — these are first-class Prisma model delegates — but Prisma
  // does not expose a generic for the `$transaction(...)` return value.
  /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
  beforeAll(async () => {
    // Three tenants, one user per tenant
    await withTenantSession(DEMO_TENANT_ID, async (tx) => {
      await tx.tenant.upsert({
        where: { id: DEMO_TENANT_ID },
        update: {},
        create: { id: DEMO_TENANT_ID, slug: 'demo', name: 'Demo Kreş' },
      });
    });
    await withTenantSession(TENANT_A_ID, async (tx) => {
      await tx.tenant.upsert({
        where: { id: TENANT_A_ID },
        update: {},
        create: { id: TENANT_A_ID, slug: 'mw-a', name: 'A' },
      });
      await tx.user.upsert({
        where: {
          tenantId_email: { tenantId: TENANT_A_ID, email: 'a@x' },
        },
        update: {},
        create: {
          tenantId: TENANT_A_ID,
          email: 'a@x',
          passwordHash: 'x',
          role: 'ADMIN',
        },
      });
    });
    await withTenantSession(TENANT_B_ID, async (tx) => {
      await tx.tenant.upsert({
        where: { id: TENANT_B_ID },
        update: {},
        create: { id: TENANT_B_ID, slug: 'mw-b', name: 'B' },
      });
      await tx.user.upsert({
        where: {
          tenantId_email: { tenantId: TENANT_B_ID, email: 'b@x' },
        },
        update: {},
        create: {
          tenantId: TENANT_B_ID,
          email: 'b@x',
          passwordHash: 'x',
          role: 'ADMIN',
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

  it('returns rows where tenantId matches the context', async () => {
    const extended = prisma.$extends(
      withTenantContext({ tenantId: TENANT_A_ID, userId: 'u', role: 'ADMIN' }),
    );
    const rows = await extended.user.findMany();

    expect(rows).toHaveLength(1);
    expect(rows[0]?.email).toBe('a@x');
  });

  it('returns empty when context tenantId does not match any row', async () => {
    const extended = prisma.$extends(
      withTenantContext({ tenantId: 'does-not-exist', userId: 'u', role: 'ADMIN' }),
    );
    const rows = await extended.user.findMany();
    expect(rows).toEqual([]);
  });
});
