# Task 8 Brief — Prisma Tenant Middleware + Auth Lookup Client Factory

## Context (1 line)

Task 8 of 16 — after Tasks 1-7 set up the workspace, docker stack, Prisma schema, migration (with RLS+FORCE+WITH CHECK), and seed; this task creates the Prisma `$extends` middleware that wraps every tenant-scoped query in a transaction that runs `SET LOCAL app.tenant_id` first, plus the dedicated `kidscare_auth_lookup` Prisma client factory, plus the package barrel exports.

## Files to create

- `packages/database/src/middleware/tenant.middleware.ts`
- `packages/database/src/middleware/tenant.middleware.spec.ts`
- `packages/database/src/client.ts`
- `packages/database/src/client/auth-lookup-client.ts`
- `packages/database/src/client/auth-lookup-client.spec.ts`
- `packages/database/src/index.ts`

## Steps (verbatim from the plan, follow exactly)

**Step 1:** Write the failing test first.

`packages/database/src/middleware/tenant.middleware.spec.ts`:

```ts
import { PrismaClient } from '../generated/client';
import { withTenantContext } from './tenant.middleware';

const prisma = new PrismaClient();

describe('withTenantContext', () => {
  beforeAll(async () => {
    await prisma.$executeRawUnsafe("SET LOCAL app.tenant_id = 'demo-tenant-seed-001'");
    await prisma.user.deleteMany({});
    await prisma.tenant.deleteMany({});
    await prisma.$executeRawUnsafe("SET LOCAL app.tenant_id = 'demo-tenant-seed-001'");
    await prisma.tenant.create({
      data: { id: 'demo-tenant-seed-001', slug: 'demo', name: 'Demo Kreş' },
    });
  });

  afterAll(async () => {
    await prisma.$executeRawUnsafe("SET LOCAL app.tenant_id = 'demo-tenant-seed-001'");
    await prisma.user.deleteMany({});
    await prisma.tenant.deleteMany({});
    await prisma.$disconnect();
  });

  it('returns rows where tenantId matches the context', async () => {
    await prisma.$executeRawUnsafe("SET LOCAL app.tenant_id = 'demo-tenant-seed-001'");
    const a = await prisma.tenant.create({ data: { id: 'a', slug: 'a', name: 'A' } });
    const b = await prisma.tenant.create({ data: { id: 'b', slug: 'b', name: 'B' } });
    await prisma.$executeRawUnsafe("SET LOCAL app.tenant_id = 'demo-tenant-seed-001'");
    await prisma.user.create({
      data: { tenantId: a.id, email: 'a@x', passwordHash: 'x', role: 'ADMIN' },
    });
    await prisma.$executeRawUnsafe("SET LOCAL app.tenant_id = 'demo-tenant-seed-001'");
    await prisma.user.create({
      data: { tenantId: b.id, email: 'b@x', passwordHash: 'x', role: 'ADMIN' },
    });

    const extended = prisma.$extends(
      withTenantContext({ tenantId: a.id, userId: 'u', role: 'ADMIN' }),
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
```

NOTE: the brief's verbatim test code does NOT include `SET LOCAL app.tenant_id` between CRUD calls — under FORCE RLS + WITH CHECK, raw `prisma.user.create` etc. on the base client (without the extension) will fail because no session variable is set. The corrected test above sets the session var explicitly within each test step. If you'd rather use the raw `prisma` connection with `DATABASE_URL` (which connects as `kidscare_migrator` and... wait, still subject to FORCE RLS, still needs the session var). Use the pattern above.

**Step 2:** Run the test to confirm it fails.

```bash
pnpm --filter @kidscare/database test
```

Expected: FAIL — `tenant.middleware` module not found.

**Step 3:** Implement the middleware (final implementation only — no stub-and-replace; per pre-flight ruling R1).

`packages/database/src/middleware/tenant.middleware.ts`:

```ts
import type { TenantContextValue } from '@kidscare/tenant-context';

type Ctx = NonNullable<TenantContextValue>;

export function withTenantContext(ctx: Ctx) {
  return {
    name: 'tenantContext',
    query: {
      $allOperations: async ({ args, query }: any) => {
        return Prisma.getExtensionContext(this).$transaction(async (tx: any) => {
          await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${ctx.tenantId}'`);
          return query(args);
        });
      },
    },
  };
}
```

NOTE: The plan's verbatim code used `Prisma.defineExtension(...)`. The simplified version above works with the `prisma.$extends({ ... })` API directly (which is what the test uses). If your Prisma version complains about the shape, add the import:

```ts
import { Prisma } from '../generated/client';
```

and wrap with `Prisma.defineExtension({ ... })` instead of returning the raw object. The runtime semantics are the same — Prisma's `$extends` accepts both shapes.

**Step 4:** Implement the auth-lookup client factory.

`packages/database/src/client/auth-lookup-client.ts`:

```ts
import { PrismaClient } from '../generated/client';

/**
 * Creates a Prisma client bound to the auth-lookup connection.
 *
 * SECURITY: This client connects as the `kidscare_auth_lookup` role, which has
 * column-level SELECT grants on `users` and `tenants` only. It is intended for
 * the auth module's login handler. Importing or instantiating this factory
 * outside `apps/api/src/modules/auth/login.handler.ts` is a security violation.
 */
export function createAuthLookupClient(url: string): PrismaClient {
  return new PrismaClient({ datasources: { db: { url } } });
}
```

**Step 5:** Write the test for the auth-lookup client factory.

`packages/database/src/client/auth-lookup-client.spec.ts`:

```ts
import { createAuthLookupClient } from './auth-lookup-client';

describe('createAuthLookupClient', () => {
  it('returns a PrismaClient instance', () => {
    const client = createAuthLookupClient('postgresql://x:y@localhost:5433/z');
    expect(client).toBeDefined();
    expect(typeof client.$connect).toBe('function');
    void client.$disconnect();
  });
});
```

**Step 6:** Implement the base client re-export and package index.

`packages/database/src/client.ts`:

```ts
export { PrismaClient } from './generated/client';
export * from './generated/client';
```

`packages/database/src/index.ts`:

```ts
export { PrismaClient } from './client';
export { withTenantContext } from './middleware/tenant.middleware';
export { createAuthLookupClient } from './client/auth-lookup-client';
```

**Step 7:** Run all package tests.

```bash
pnpm --filter @kidscare/database test
```

Expected: PASS for both spec files (3+1 = 4 tests total). If tests fail because the database connection doesn't have `app.tenant_id` set, the `beforeAll` and per-test `SET LOCAL` calls should handle it. If they fail with RLS, re-check the migration (the Task 6/7 fix added WITH CHECK).

**Step 8:** Commit.

```bash
git add packages/database/src/
git commit -m "feat(database): tenant context middleware and auth-lookup client factory"
```

## Constraints (binding)

- Per R1 (pre-flight): the middleware ships ONLY the final implementation. No stub-and-replace.
- Per Global Constraints: `withTenantContext` is the only way the application runtime touches the database for tenant-scoped reads/writes; raw `prisma.X.findMany()` on tenant-scoped tables is forbidden outside login/migration contexts.
- Per Global Constraints: `createAuthLookupClient` is the ONLY export that takes a database URL parameter. Importing or instantiating it outside the auth module's login handler is a security violation (this code lives in sub-project #2).
- The test must clean up its data in `afterAll` so subsequent runs aren't polluted. The `beforeAll` re-creates the seed tenant so the tests are self-contained.
- The middleware must wrap each query in a transaction so `SET LOCAL` actually persists for the query's duration (this is the same lesson from the Task 7 seed fix). Do NOT call `SET LOCAL` outside a transaction — it has no effect.
- Do not add `runWithTenant` wrapping or any other cross-cutting concern in this task. The NestJS middleware (Task 9) is the right place for that.

## Report contract

Append to `.superpowers/sdd/2026-09-13-infrastructure-layer/reports/task-8-report.md`:

```
## Status
DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## One-line summary
<what you actually did>

## Test evidence
<output of `pnpm --filter @kidscare/database test` — paste the relevant lines>

## Self-review
- <anything you noticed>

## Commits
<commit hash>
```

Return ONLY: status, one-line summary, commit hash.
