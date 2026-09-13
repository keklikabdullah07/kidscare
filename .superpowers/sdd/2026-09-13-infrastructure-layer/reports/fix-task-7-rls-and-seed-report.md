## Status

DONE

## One-line summary

Added explicit `WITH CHECK` clauses to both RLS policies in the migration, updated the seed to use a fixed demo tenant id (`demo-tenant-seed-001`) with `SET LOCAL app.tenant_id` inside a `prisma.$transaction`, verified the proof via `pnpm db:reset` (seed runs successfully), and confirmed idempotency with a second seed run.

## Test evidence

### `pnpm db:reset` (first run, proof)

```
> @kidscare/database@0.0.0 prisma C:\Users\Partridge\Desktop\KidsCare\packages\database
> prisma "migrate" "reset" "--force"

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "kidscare", schema "public" at "localhost:5433"

Applying migration `20260913152901_init`

Database reset successful

The following migration(s) have been applied:

migrations/
  └─ 20260913152901_init/
    └─ migration.sql

Running generate... (Use --skip-generate to skip the generators)
✔ Generated Prisma Client (v5.22.0) to .\src\generated\client in 97ms

Running seed command `tsx prisma/seed.ts` ...
Seeded tenant demo with id demo-tenant-seed-001

The seed command has been executed.
```

### Policy verification (after migration re-apply)

```
$ docker exec kidscare-postgres psql -U postgres -d kidscare -c "SELECT polname, polcmd, pg_get_expr(polqual, polrelid) AS using_expr, pg_get_expr(polwithcheck, polrelid) AS with_check_expr FROM pg_policy WHERE polrelid IN ('tenants'::regclass, 'users'::regclass);"
     polname      | polcmd |                         using_expr                          |                       with_check_expr
------------------+--------+-------------------------------------------------------------+-------------------------------------------------------------
 tenant_isolation | *      | (id = current_setting('app.tenant_id'::text, true))         | (id = current_setting('app.tenant_id'::text, true))
 tenant_isolation | *      | ("tenantId" = current_setting('app.tenant_id'::text, true)) | ("tenantId" = current_setting('app.tenant_id'::text, true))
(2 rows)
```

Both policies now have `polcmd = '*'` (FOR ALL), `USING` clause, AND explicit `WITH CHECK` clause.

### `SELECT` queries — rows present

```
$ docker exec kidscare-postgres psql -U postgres -d kidscare -c "SELECT id, slug, name FROM tenants;"
          id          | slug |   name
----------------------+------+-----------
 demo-tenant-seed-001 | demo | Demo Kreş
(1 row)

$ docker exec kidscare-postgres psql -U postgres -d kidscare -c "SELECT email, role FROM users;"
       email       |  role
-------------------+---------
 admin@demo.test   | ADMIN
 teacher@demo.test | TEACHER
(2 rows)
```

### Idempotency — second seed run

```
> pnpm db:seed
...
Running seed command `tsx prisma/seed.ts` ...
Seeded tenant demo with id demo-tenant-seed-001

The seed command has been executed.
```

Re-verified tenants count remained 1 after second seed (no duplicate-key errors).

## Self-review

- **Deviation from brief verbatim, justified.** The brief's Step 2 shows the seed code using `SET LOCAL app.tenant_id` followed by separate `prisma.tenant.upsert(...)` calls. PostgreSQL's `SET LOCAL` is strictly transaction-scoped — outside an explicit transaction it emits a WARNING and has no effect. `prisma db seed` does NOT wrap the seed script in a transaction; each Prisma operation runs in its own implicit transaction, so the `SET LOCAL` from `$executeRawUnsafe` was never visible to the subsequent upsert and the proof failed with `42501 new row violates row-level security policy` on the first attempt with verbatim code.

  The brief's own Constraints section states: "The seed's `SET LOCAL` is scoped to the transaction in which `prisma db seed` runs." This explicitly describes the intended (transaction-scoped) behavior. The verbatim code block was missing the transaction wrapper, which is a bug in the brief itself. To honor the stated intent and make the proof pass, I wrapped the seed work in `prisma.$transaction(async (tx) => { ... })` and used the `tx` client for all operations so `SET LOCAL` takes effect for the upserts within that single transaction. Everything else in the seed (fixed `DEMO_TENANT_ID`, `where: { id: DEMO_TENANT_ID }`, user upserts, bcrypt hash, logging, disconnect) matches the brief verbatim.

- **Migration change is correct as briefed.** `FORCE ROW LEVEL SECURITY` in Postgres 16 evaluates `USING` as `WITH CHECK` on INSERT when no explicit `WITH CHECK` is provided, but only when the policy is `FOR ALL`. Adding an explicit `WITH CHECK` clause that mirrors the `USING` expression is the documented correct fix and does not weaken the policy.

- **bcryptjs / lockfile changes from Task 7's first attempt remain uncommitted** per the brief's explicit `git add packages/database/prisma/migrations/ packages/database/prisma/seed.ts` instruction. The seed in its current committed form will fail for anyone cloning fresh because `bcryptjs` is not yet in any committed `package.json` / `pnpm-lock.yaml`. This is a separate follow-up and was deliberately scoped out by the brief. The proof still passes locally because bcryptjs is installed in the workspace from Task 7's first attempt.

- **Other workspace drift left untouched per the brief's "Do not touch any other files" constraint:** `package.json`, `pnpm-lock.yaml`, generated Prisma client files, `progress.md`, `task-1-report.md`, and all brief/report .md files remain in the same uncommitted state they were in at the start of this task.

## Commits

58d843c — fix(database): add WITH CHECK to RLS policies; seed uses fixed tenant id with SET LOCAL
