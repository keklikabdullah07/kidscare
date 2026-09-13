/* eslint-disable */
import { AUTH_LOOKUP_USER_COLUMNS, PrismaClient, createAuthLookupClient } from '@kidscare/database';
import { runWithTenant } from '@kidscare/tenant-context';

// kidscare_app role → RLS is FORCE'd; this is what production sees.
const APP_URL = process.env.DATABASE_APP_URL ?? '';
// kidscare_auth_lookup role → column-level SELECT only on users + tenants.
const AUTH_URL = process.env.DATABASE_AUTH_LOOKUP_URL ?? '';

const prisma = new PrismaClient({
  datasources: { db: { url: APP_URL } },
});

// One-time cleanup: previous runs (and the seed in `packages/database`)
// left rows in the DB. RLS forces us to set `app.tenant_id` to the row's
// tenant column to remove it; iterate the fixture tenant ids.
async function cleanupFixtures(): Promise<void> {
  // The transaction callback receives `tx: any` because Prisma doesn't
  // expose the interactive-transaction client as a generic type. Same
  // rationale as `forTenant` above.
  /* (lint disabled via file-top directive) */
  for (const tenantId of ['demo-tenant-seed-001', TENANT_A_ID, TENANT_B_ID]) {
    await prisma.$transaction(async (tx: any) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
      await tx.user.deleteMany({ where: { tenantId } });
      await tx.tenant.deleteMany({ where: { id: tenantId } });
    });
  }
  /* (lint disabled via file-top directive) */
}
beforeEach(async () => {
  await cleanupFixtures();
});
afterAll(async () => {
  await cleanupFixtures();
  await prisma.$disconnect();
});

/**
 * Seed two tenants + one admin user each. Every write runs inside a
 * transaction that sets `app.tenant_id` first, otherwise FORCE RLS would
 * block the INSERT (Postgres 16 evaluates `USING` as a WITH CHECK for
 * `FOR ALL` policies without an explicit `WITH CHECK` — the initial
 * migration has WITH CHECK; this helper is the application-side mirror).
 */
// RLS policy shape:
//   tenants: USING (id = current_setting('app.tenant_id', true))
//   users:   USING ("tenantId" = current_setting('app.tenant_id', true))
//
// To INSERT a tenant row, the new row's `id` MUST equal the session
// variable. To INSERT a user, its `tenantId` MUST equal the session
// variable. We pin both ids in the test fixture so SET LOCAL matches the
// row's tenant column on every insert.
const TENANT_A_ID = 'integration-tenant-a';
const TENANT_B_ID = 'integration-tenant-b';

async function seedTwoTenants(): Promise<{
  a: { id: string };
  b: { id: string };
  emailA: string;
  emailB: string;
}> {
  // Use interactive transactions — Prisma guarantees that all `tx.*`
  // queries run on the same connection, so `SET LOCAL` applied via
  // `tx.$executeRawUnsafe` is visible to the subsequent `tx.tenant.create`.
  // Slug + email are randomized so multiple `seedTwoTenants` calls in the
  // same Jest worker don't trip the unique constraints.
  /* (lint disabled via file-top directive) */
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const emailA = `a-${nonce}@x`;
  const emailB = `b-${nonce}@x`;
  const slugA = `int-a-${nonce}`;
  const slugB = `int-b-${nonce}`;
  const a = await prisma.$transaction(async (tx: any) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${TENANT_A_ID}'`);
    return tx.tenant.create({
      data: { id: TENANT_A_ID, slug: slugA, name: 'A' },
    });
  });
  const b = await prisma.$transaction(async (tx: any) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${TENANT_B_ID}'`);
    return tx.tenant.create({
      data: { id: TENANT_B_ID, slug: slugB, name: 'B' },
    });
  });
  await prisma.$transaction(async (tx: any) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${TENANT_A_ID}'`);
    await tx.user.create({
      data: {
        id: `integration-user-a-${nonce}`,
        tenantId: TENANT_A_ID,
        email: emailA,
        passwordHash: 'x',
        role: 'ADMIN',
      },
    });
  });
  await prisma.$transaction(async (tx: any) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${TENANT_B_ID}'`);
    await tx.user.create({
      data: {
        id: `integration-user-b-${nonce}`,
        tenantId: TENANT_B_ID,
        email: emailB,
        passwordHash: 'x',
        role: 'ADMIN',
      },
    });
  });
  /* (lint disabled via file-top directive) */
  return { a, b, emailA, emailB };
}

/**
 * Wraps `prisma` in the same `$extends` middleware shape that
 * `withTenantContext` (Task 8) installs, but inlined here so the test
 * exercises the exact RLS+tx path without depending on the package
 * barrel's exact API.
 *
 * Critical: we invoke `tx[model][operation](args)` directly inside the
 * transaction, not the extension's `query(args)` callback. The latter
 * binds to the *outer* extended client and runs on a different
 * connection than the `SET LOCAL` we just issued. Same lesson as the
 * Task 7 seed fix and the Task 8 middleware.
 */
function forTenant(tenantId: string): any {
  // The Prisma $extends / $transaction callback types are intentionally
  // `any`; see packages/database/src/middleware/tenant.middleware.ts for
  // the full rationale.
  /* (lint disabled via file-top directive) */
  return prisma.$extends({
    query: {
      $allOperations: async ({ model, operation, args }: any) =>
        prisma.$transaction(async (txInner: any) => {
          await txInner.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
          return txInner[model][operation](args);
        }),
    },
  });
  /* (lint disabled via file-top directive) */
}

describe('tenant isolation (RLS + AsyncLocalStorage)', () => {
  it("within-tenant read returns only that tenant's rows", async () => {
    const { a, emailA } = await seedTwoTenants();
    let rows: { email: string }[] = [];
    await runWithTenant({ tenantId: a.id, userId: 'u', role: 'ADMIN' }, async () => {
      const tx = forTenant(a.id);
      rows = await tx.user.findMany({ select: { email: true } });
    });
    expect(rows.map((r) => r.email)).toEqual([emailA]);
  });

  it('cross-tenant read returns empty', async () => {
    const { a, b } = await seedTwoTenants();
    let rows: { email: string }[] = [];
    await runWithTenant({ tenantId: a.id, userId: 'u', role: 'ADMIN' }, async () => {
      const tx = forTenant(a.id);
      // RLS must block access to tenant B's user even when explicitly addressed.
      rows = await tx.user.findMany({
        where: { tenantId: b.id },
        select: { email: true },
      });
    });
    expect(rows).toEqual([]);
  });

  it('login lookup via auth-lookup connection finds cross-tenant user', async () => {
    const { a, emailA } = await seedTwoTenants();
    const lookup = createAuthLookupClient(AUTH_URL);
    try {
      // `kidscare_auth_lookup` only has column-level SELECT on
      // (id, "tenantId", email, "passwordHash"); we restrict the query to
      // those columns to avoid PG rejecting the SELECT for permission on
      // other columns.
      const user = await lookup.user.findFirst({
        where: { email: emailA },
        select: AUTH_LOOKUP_USER_COLUMNS,
      });
      expect(user?.tenantId).toBe(a.id);
    } finally {
      await lookup.$disconnect();
    }
  });

  it('auth-lookup role cannot INSERT into users', async () => {
    const lookup = createAuthLookupClient(AUTH_URL);
    try {
      await expect(
        lookup.user.create({
          data: {
            tenantId: 'integration-tenant-a',
            email: `evil-${Date.now()}-${Math.random()}@x`,
            passwordHash: 'x',
            role: 'ADMIN',
          },
        }),
      ).rejects.toThrow();
    } finally {
      await lookup.$disconnect();
    }
  });
});
