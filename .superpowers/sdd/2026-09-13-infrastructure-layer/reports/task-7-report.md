## Status

BLOCKED

## One-line summary

Seed file created per brief and `bcryptjs` installed, but `pnpm db:seed` fails with `new row violates row-level security policy for table "tenants"` because Task 6's migration enabled `FORCE ROW LEVEL SECURITY`, which makes the brief's stated invariant ("kidscare_migrator bypasses RLS for inserts") false; the brief's binding constraints forbid the only available fixes (migration edit, role-attribute change in `docker/init/01-roles.sql`, or seed-code modification beyond what was specified verbatim), so the seed cannot be made to run as written — needs re-briefing.

## Test evidence

### Step 1 — `packages/database/prisma/seed.ts` written verbatim from brief

File matches the brief code block exactly: imports `PrismaClient` from `../src/generated/client` and `bcryptjs`; creates `PrismaClient`; upserts tenant `demo / Demo Kreş`; upserts `admin@demo.test` (ADMIN) and `teacher@demo.test` (TEACHER) with `bcrypt.hash('demo1234', 10)`; logs `Seeded tenant demo with id <cuid>`; disconnect in `finally`.

### Step 2 — `pnpm add -Dw bcryptjs @types/bcryptjs`

```
devDependencies:
+ @types/bcryptjs ^3.0.0
+ bcryptjs ^3.0.3
```

Both installed at workspace root as required. `@types/bcryptjs` emits a deprecation warning ("bcryptjs provides its own type definitions, so you do not need this installed") but installs and resolves fine.

### Step 3 — `pnpm db:seed` — FAILS with RLS violation (not the anticipated DATABASE_URL error)

```
> prisma "db" "seed"

Environment variables loaded from .env
Running seed command `tsx prisma/seed.ts` ...
PrismaClientUnknownRequestError:
Invalid `prisma.tenant.upsert()` invocation in
C:\Users\Partridge\Desktop\KidsCare\packages\database\prisma\seed.ts:7:38

  4 const prisma = new PrismaClient();
  5
  6 async function main() {
→ 7   const tenant = await prisma.tenant.upsert(
Error occurred during query execution:
ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(PostgresError { code: "42501", message: "new row violates row-level security policy for table \"tenants\"", severity: "ERROR", detail: None, column: None, hint: None }), transient: false })

ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @kidscare/database@0.0.0 prisma: `prisma "db" "seed"`
Exit status 1
ELIFECYCLE  Command failed with exit code 1
```

.env is being loaded (Prisma says so), the connection authenticates as `kidscare_migrator` (verified via separate `psql -U kidscare_migrator` test — same RLS error), so this is NOT the DATABASE_URL-not-found case the brief anticipated. The actual error is the FORCE RLS policy rejecting the INSERT.

### Step 3b — Direct verification of migrator role + FORCE RLS interaction

```
$ docker exec kidscare-postgres psql -U postgres -d kidscare -c "SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname IN ('kidscare_migrator', 'kidscare_app', 'kidscare_auth_lookup');"
       rolname        | rolsuper | rolbypassrls
----------------------+----------+--------------
 kidscare_app         | f        | f
 kidscare_auth_lookup | f        | f
 kidscare_migrator    | f        | f
(3 rows)
```

None of the three roles has `BYPASSRLS`. None is a superuser. Therefore the `FORCE ROW LEVEL SECURITY` set in migration line 48 (`ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;`) and line 53 (`ALTER TABLE "users" FORCE ROW LEVEL SECURITY;`) applies to **all** sessions including the table owner `kidscare_migrator`.

### Step 3c — Proof that RLS, not credentials, is the blocker

```
$ docker exec kidscare-postgres psql -U kidscare_migrator -d kidscare -c "INSERT INTO tenants (id, slug, name, \"updatedAt\") VALUES ('test_direct', 'direct_test', 'direct', NOW()) RETURNING id;"
ERROR:  new row violates row-level security policy for table "tenants"
$ docker exec kidscare-postgres psql -U kidscare_migrator -d kidscare -c "SET app.tenant_id = 'test_id'; INSERT INTO tenants (id, slug, name, \"updatedAt\") VALUES ('test_id', 'temp_test', 'temp', NOW());"
INSERT 0 1
$ docker exec kidscare-postgres psql -U postgres -d kidscare -c "DELETE FROM tenants WHERE slug IN ('direct_test', 'temp_test');"
DELETE 1
```

Confirmed: (a) migrator CANNOT insert into `tenants` without setting `app.tenant_id`; (b) migrator CAN insert when `app.tenant_id` matches the row's `id`. The policy expression `USING (id = current_setting('app.tenant_id', true))` doubles as the implicit `WITH CHECK` on INSERT, so any new row whose `id` ≠ `current_setting('app.tenant_id')` is rejected. Since the seed auto-generates the cuid, it cannot set `app.tenant_id` to the new id ahead of the upsert.

### Step 4 — SELECT verification SKIPPED (no rows to verify; seed never ran)

### Step 5 — Idempotency re-run SKIPPED (seed cannot complete the first run)

### Step 6 — Commit SKIPPED (no working state to commit; seed is broken)

## Self-review

- **Root cause is the brief's assumption, not a misread of the brief.** The brief's Constraints section states verbatim: "The seed runs as `kidscare_migrator` (because `pnpm db:seed` uses `DATABASE_URL` from `.env`), which bypasses RLS for inserts — this is correct; seed needs to create rows." This is true only when FORCE RLS is NOT set. Task 6's `20260913152901_init/migration.sql` lines 48 and 53 set `FORCE ROW LEVEL SECURITY`, which extends RLS to the table owner. The two are incompatible.

- **Every available fix is forbidden by the brief's constraints.** To make the seed run without modifying the seed file's logic, exactly one of these is needed:
  1. **Grant `BYPASSRLS` to `kidscare_migrator`** in `docker/init/01-roles.sql` (so the volume persists it across `pnpm db:reset`). Forbidden by "Do NOT touch ... any other file."
  2. **Drop `FORCE ROW LEVEL SECURITY`** from the migration. Forbidden by "Do NOT touch the migration SQL."
  3. **Add a permissive INSERT/UPDATE policy** (e.g., `CREATE POLICY seed_insert ON "tenants" FOR INSERT WITH CHECK (true);` and same on `users`). Forbidden by "Do NOT touch the migration SQL."
  4. **Set `app.tenant_id` from inside the seed** by generating the cuid manually before each upsert and `SELECT set_config('app.tenant_id', $1, false)`. Requires modifying the seed file beyond the verbatim code block; the brief says "Steps (verbatim from the plan, follow exactly)" and the constraint says the seed must use the raw `prisma` export (the `set_config` raw call is still via the same client, but the upsert `where`/`create` payloads would have to specify `id` explicitly to avoid the auto-cuid timing issue, which is a substantive change to the code).

  I did NOT take any of these paths because all four are outside the brief's allowed scope.

- **No "DATABASE_URL not found" workaround was needed.** The seed's PrismaClient successfully resolved `DATABASE_URL` from `.env` (Prisma prints "Environment variables loaded from .env" before the error). The error was a Postgres policy violation, not a Node env resolution failure. The brief's `dotenv-cli` fallback applies to the latter, not the former.

- **Working-tree state at BLOCKED time.** `packages/database/prisma/seed.ts` is the new file written from the brief. `package.json` and `pnpm-lock.yaml` are modified by `pnpm add -Dw bcryptjs @types/bcryptjs` (these would normally be committed in Step 6 but I have NOT staged or committed anything because the seed doesn't work). Pre-existing modifications to `packages/database/src/generated/client/*` and `.superpowers/sdd/.../progress.md` / `reports/task-1-report.md` from earlier tasks remain unstaged (out of scope). The untracked `packages/database/prisma/seed.ts` left by Task 6 (a no-op `export {};` placeholder) has been overwritten in place with the brief's real seed code; no backup was kept because the brief specified the verbatim replacement.

- **No commit hash to report** because no commit was made. Committing the broken seed and the bcryptjs dev-deps would leave the repo in a state where `pnpm db:seed` is documented to work but actually fails — that's worse than the current BLOCKED report.

- **Suggested paths forward for whoever picks this up next:**
  - **Option A (preferred, smallest blast radius):** Append `ALTER ROLE kidscare_migrator BYPASSRLS;` to `docker/init/01-roles.sql` (one line, alongside the existing `CREATEDB` + `CREATE ON SCHEMA public` grants added in fix-task-6-r1). Then re-run `docker compose down -v && docker compose up -d` (or just `ALTER ROLE` against the running container if a fresh volume is acceptable), then `pnpm db:seed`. This matches the brief's stated invariant (migrator bypasses RLS) without modifying the migration. Trade-off: migrator now bypasses RLS for all operations, not just seed; this is acceptable because the migrator role is only used by `prisma migrate` and `prisma db seed` (per the brief's "schema owner, used only by prisma migrate / db push" comment on `.env` line 1), never by runtime application code.
  - **Option B:** Modify the seed to generate the cuid explicitly, `SELECT set_config('app.tenant_id', $1, false)` before each upsert, and pass the explicit `id` in both `where` and `create` payloads. Larger seed diff; preserves FORCE RLS for migrator but is more code to maintain.
  - **Option C:** Modify the migration to add a permissive `FOR INSERT WITH CHECK (true)` policy alongside the existing `tenant_isolation` policy (or replace `tenant_isolation` with separate SELECT/INSERT/UPDATE/DELETE policies where only SELECT uses the `app.tenant_id` check). Cleanest separation of concerns, but is a migration change and needs its own brief + reseed.

## Commits

(none — seed is broken, no commit made)
