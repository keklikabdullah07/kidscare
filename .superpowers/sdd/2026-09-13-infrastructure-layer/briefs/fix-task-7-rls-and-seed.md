# Fix Brief — Task 6 Migration (Add WITH CHECK) + Task 7 Seed (Fixed ID + SET LOCAL)

## Context (1 line)

Task 7 surfaced a real Postgres 16 + FORCE RLS interaction: a policy defined with `USING` only (no `WITH CHECK`) and `polcmd = '*'` (FOR ALL) does NOT permit INSERT — verified by raw INSERT against `tenants` as `kidscare_migrator` returning `42501 new row violates row-level security policy`. Two fixes land together because they are coupled: the migration must add explicit `WITH CHECK` clauses, and the seed must use a fixed demo tenant id with `SET LOCAL app.tenant_id` before inserts.

## Files to modify

- `packages/database/prisma/migrations/<timestamp>_init/migration.sql` (add `WITH CHECK` to both policies)
- `packages/database/prisma/seed.ts` (use fixed demo tenant id, SET LOCAL before upserts)

## Steps

**Step 1:** Edit `packages/database/prisma/migrations/<timestamp>_init/migration.sql`. Find the `CREATE POLICY` blocks (under the `── Row-Level Security ──` heading) and add `WITH CHECK` to each:

Replace:

```sql
CREATE POLICY tenant_isolation ON "tenants"
  USING (id = current_setting('app.tenant_id', true));
```

With:

```sql
CREATE POLICY tenant_isolation ON "tenants"
  FOR ALL
  USING (id = current_setting('app.tenant_id', true))
  WITH CHECK (id = current_setting('app.tenant_id', true));
```

Replace:

```sql
CREATE POLICY tenant_isolation ON "users"
  USING ("tenantId" = current_setting('app.tenant_id', true));
```

With:

```sql
CREATE POLICY tenant_isolation ON "users"
  FOR ALL
  USING ("tenantId" = current_setting('app.tenant_id', true))
  WITH CHECK ("tenantId" = current_setting('app.tenant_id', true));
```

**Step 2:** Edit `packages/database/prisma/seed.ts` to:

- Use a fixed demo tenant id (`demo-tenant-seed-001`)
- `SET LOCAL app.tenant_id` to that id before any upsert/insert
- Use the fixed id in the `where` clause of tenant upsert

Replace the entire file contents with:

```ts
import { PrismaClient } from '../src/generated/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEMO_TENANT_ID = 'demo-tenant-seed-001';

async function main() {
  await prisma.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${DEMO_TENANT_ID}'`);

  const tenant = await prisma.tenant.upsert({
    where: { id: DEMO_TENANT_ID },
    update: {},
    create: { id: DEMO_TENANT_ID, slug: 'demo', name: 'Demo Kreş' },
  });

  const passwordHash = await bcrypt.hash('demo1234', 10);

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demo.test' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@demo.test',
      passwordHash,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'teacher@demo.test' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'teacher@demo.test',
      passwordHash,
      role: 'TEACHER',
    },
  });

  console.log(`Seeded tenant ${tenant.slug} with id ${tenant.id}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

**Step 3:** Reset and re-apply the migration to pick up the new policy:

```bash
pnpm db:reset
```

Expected: drop + re-create + migration apply + seed runs successfully this time.

If the seed still fails with RLS error, check the migration file was actually re-applied (the `pnpm db:reset` drops + re-runs all migrations from scratch, so changes to the existing migration file DO take effect — Prisma does not re-generate migration files automatically).

**Step 4:** Verify rows exist via raw SQL:

```bash
docker exec kidscare-postgres psql -U postgres -d kidscare -c "SELECT id, slug, name FROM tenants;"
docker exec kidscare-postgres psql -U postgres -d kidscare -c "SELECT email, role FROM users;"
```

Expected: one tenant (`demo-tenant-seed-001 / demo / Demo Kreş`) and two users.

**Step 5:** Run the seed again to confirm idempotency:

```bash
pnpm dlx dotenv-cli -- pnpm db:seed
```

Expected: same output, no duplicate-key errors.

**Step 6:** Commit BOTH changes (migration + seed) in a single commit — they are coupled:

```bash
git add packages/database/prisma/migrations/ packages/database/prisma/seed.ts
git commit -m "fix(database): add WITH CHECK to RLS policies; seed uses fixed tenant id with SET LOCAL"
```

## Constraints (binding)

- Migration is the source of truth for policy semantics. Do not edit the seed to bypass the migration; do not edit the migration to weaken the policy. The fix is a precise addition to the policy (WITH CHECK clause) and a precise adjustment to the seed (fixed id + session var).
- The seed's `SET LOCAL` is scoped to the transaction in which `prisma db seed` runs. It does not persist beyond the seed process — this is correct; the seed is the only place that needs this session variable.
- The demo tenant id `demo-tenant-seed-001` is intentionally a human-readable string rather than a cuid, so it's obvious in queries and logs that this row came from the seed.
- Do not change `id` from `cuid()` default for production tenants (which don't exist yet) — only the seed uses a fixed id.
- Do not touch any other files (Docker, init scripts, etc.). Task 6's R1 fix (`6b2a2b3`) is unrelated and already merged.

## Report contract

Append to `.superpowers/sdd/2026-09-13-infrastructure-layer/reports/fix-task-7-rls-and-seed-report.md`:

```
## Status
DONE | BLOCKED

## One-line summary
<what you actually did>

## Test evidence
<output of `pnpm db:reset` (should show successful seed); output of SELECT queries; output of second seed run (idempotent)>

## Self-review
- <anything you noticed>

## Commits
<commit hash>
```

Return ONLY: status, one-line summary, commit hash.
