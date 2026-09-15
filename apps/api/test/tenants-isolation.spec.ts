/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient, withTenantContext } from '@kidscare/database';
import { runWithTenant } from '@kidscare/tenant-context';

const APP_URL = process.env.DATABASE_APP_URL ?? '';

const prisma = new PrismaClient({
  datasources: { db: { url: APP_URL } },
});

const TENANT_A_ID = 'tenants-isolation-a';
const TENANT_B_ID = 'tenants-isolation-b';

async function cleanup(nonce: string): Promise<void> {
  // Iterate both possible ids; RLS forces us to set the GUC to the
  // row's id to delete.
  for (const id of [`${TENANT_A_ID}-${nonce}`, `${TENANT_B_ID}-${nonce}`]) {
    await prisma.$transaction(async (tx: any) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${id}'`);
      await tx.tenant.deleteMany({ where: { id } });
    });
  }
}

async function seedTwo(
  nonce: string,
  prefix: string,
): Promise<{
  idA: string;
  idB: string;
}> {
  const idA = `${TENANT_A_ID}-${nonce}`;
  const idB = `${TENANT_B_ID}-${nonce}`;
  const slugA = `${prefix}-a-${nonce}`;
  const slugB = `${prefix}-b-${nonce}`;
  // Pinned ids so SET LOCAL matches the row's id on every insert.
  await prisma.$transaction(async (tx: any) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${idA}'`);
    await tx.tenant.create({ data: { id: idA, slug: slugA, name: 'A' } });
  });
  await prisma.$transaction(async (tx: any) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${idB}'`);
    await tx.tenant.create({ data: { id: idB, slug: slugB, name: 'B' } });
  });
  return { idA, idB };
}

describe('tenants module — RLS isolation via withTenantContext', () => {
  const seededNonces: string[] = [];

  afterAll(async () => {
    for (const nonce of seededNonces) {
      await cleanup(nonce);
    }
    await prisma.$disconnect();
  });

  it('ctx=A can read tenant A but not tenant B', async () => {
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    seededNonces.push(nonce);
    const { idA, idB } = await seedTwo(nonce, 'iso');

    // Run the two findUnique calls in the same context and return the
    // results, so TypeScript can see the values are assigned (avoiding
    // closure-mutation "used before assigned" narrowing issues).
    const { rowA, rowB } = await runWithTenant(
      { tenantId: idA, userId: 'u', role: 'ADMIN' },
      async () => {
        const scoped: any = prisma.$extends(
          withTenantContext({ tenantId: idA, userId: 'u', role: 'ADMIN' }),
        );
        return {
          rowA: await scoped.tenant.findUnique({
            where: { id: idA },
            select: { name: true },
          }),
          rowB: await scoped.tenant.findUnique({
            where: { id: idB },
            select: { name: true },
          }),
        };
      },
    );

    expect(rowA?.name).toBe('A');
    expect(rowB).toBeNull();
  });

  it('ctx=A cannot update tenant B (RLS hides row, Prisma throws P2025)', async () => {
    const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    seededNonces.push(nonce);
    const { idA, idB } = await seedTwo(nonce, 'upd');

    const { updateError, bName } = await runWithTenant(
      { tenantId: idA, userId: 'u', role: 'ADMIN' },
      async () => {
        const scoped: any = prisma.$extends(
          withTenantContext({ tenantId: idA, userId: 'u', role: 'ADMIN' }),
        );
        let updateError: unknown = null;
        try {
          await scoped.tenant.update({
            where: { id: idB },
            data: { name: 'pwned' },
          });
        } catch (err) {
          updateError = err;
        }
        return { updateError, bName: undefined as string | null | undefined };
      },
    );

    expect(updateError).not.toBeNull();
    expect(String(updateError)).toMatch(/not found/i);

    // Verify tenant B's name did not change by reading it under ctx=B.
    const verifiedB = await runWithTenant(
      { tenantId: idB, userId: 'u', role: 'ADMIN' },
      async () => {
        const scoped: any = prisma.$extends(
          withTenantContext({ tenantId: idB, userId: 'u', role: 'ADMIN' }),
        );
        const row = await scoped.tenant.findUnique({
          where: { id: idB },
          select: { name: true },
        });
        return row?.name ?? null;
      },
    );
    expect(verifiedB).toBe('B');
    expect(bName).toBeUndefined();
  });
});
