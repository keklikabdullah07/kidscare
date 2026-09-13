# Task 7 Brief — Seed Script

## Context (1 line)

Task 7 of 16 — after Tasks 1-6 created the workspace, docker stack, and applied the initial migration with RLS; this task creates the seed script that populates one demo tenant and two demo users (admin + teacher), wired through `pnpm db:seed`, and verifies the rows are present.

## Files to create

- `packages/database/prisma/seed.ts`

## Steps (verbatim from the plan, follow exactly)

**Step 1:** Write the seed.

`packages/database/prisma/seed.ts`:

```ts
import { PrismaClient } from '../src/generated/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: { slug: 'demo', name: 'Demo Kreş' },
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

**Step 2:** Install bcrypt (dev deps, at workspace root, with `-Dw`):

```bash
cd C:\Users\Partridge\Desktop\KidsCare
pnpm add -Dw bcryptjs @types/bcryptjs
```

**Step 3:** Run the seed.

```bash
pnpm db:seed
```

Expected output: `Seeded tenant demo with id <cuid>`.

If the seed errors with "Environment variable not found: DATABASE_URL", the seed runs in a child process that doesn't inherit `.env`. The seed uses the raw `prisma` export (Task 8 hasn't run yet), so it needs `DATABASE_URL` set in the parent shell. Run with:

```bash
set -a && source .env && pnpm db:seed
```

(PowerShell equivalent: `Get-Content .env | ForEach-Object { if ($_ -match '^([^#].+)=(.*)$') { Set-Item -Path "Env:$($matches[1])" -Value $matches[2] } }; pnpm db:seed`)

Or simpler: prefix with `dotenv`:

```bash
pnpm dlx dotenv-cli -- pnpm db:seed
```

If `dotenv-cli` is not yet installed, add it: `pnpm add -Dw dotenv-cli`.

**Step 4:** Verify rows exist via raw SQL:

```bash
docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "SELECT slug, name FROM tenants;"
docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "SELECT email, role FROM users;"
```

Expected: one tenant (`demo / Demo Kreş`) and two users (`admin@demo.test / ADMIN`, `teacher@demo.test / TEACHER`).

**Step 5:** Run the seed again to confirm idempotency.

```bash
pnpm db:seed
```

Expected: same output, no duplicate-key errors.

**Step 6:** Commit.

```bash
git add packages/database/prisma/seed.ts package.json pnpm-lock.yaml
git commit -m "feat(database): idempotent seed with demo tenant and two users"
```

If you installed `dotenv-cli`, include it in the commit too.

## Constraints (binding)

- Seed uses the raw `prisma` export from `../src/generated/client`, NOT the extended middleware client (Task 8 hasn't run yet; the extension requires a context that doesn't exist at seed time).
- Seed is idempotent — re-running it does not duplicate rows. `upsert` is the correct primitive.
- Password hash uses bcrypt with cost factor 10 (matches the plan; sub-project #2 may revisit).
- The seed file lives at `packages/database/prisma/seed.ts` and is referenced from `packages/database/package.json`'s `prisma.seed` field set to `tsx prisma/seed.ts`. Both `tsx` and `bcryptjs` are dev deps.
- The seed runs as `kidscare_migrator` (because `pnpm db:seed` uses `DATABASE_URL` from `.env`), which bypasses RLS for inserts — this is correct; seed needs to create rows.
- Do NOT touch the migration SQL or any other file.

## Report contract

Append to `.superpowers/sdd/2026-09-13-infrastructure-layer/reports/task-7-report.md`:

```
## Status
DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## One-line summary
<what you actually did>

## Test evidence
<output of seed (Step 3) and SELECT queries (Step 4); paste the relevant lines>

## Self-review
- <anything you noticed>

## Commits
<commit hash>
```

Return ONLY: status, one-line summary, commit hash.
