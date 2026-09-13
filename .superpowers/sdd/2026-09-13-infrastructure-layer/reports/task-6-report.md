## Status

DONE_WITH_CONCERNS

## One-line summary

Applied `20260913152901_init` migration with RLS, FORCE RLS, `tenant_isolation` policies, and three-role grants in the same SQL file; verified via `pnpm db:reset` + `\d+ tenants/users` + `column_privileges`. Required two extra privilege grants on `kidscare_migrator` (CREATEDB, CREATE on schema public) that were not pre-provisioned by Task 4.

## Test evidence

### Step 1 — `prisma migrate dev --name init`

```
Applying migration `20260913152901_init`
The following migration(s) have been created and applied from new schema changes:
migrations/
  └─ 20260913152901_init/
    └─ migration.sql
Your database is now in sync with your schema.
Running generate... ✔ Generated Prisma Client (v5.22.0) to .\src\generated\client in 90ms
```

(After granting `CREATEDB` and `GRANT CREATE ON SCHEMA public TO kidscare_migrator` — see Self-review #1.)

### Final `migration.sql` (after append)

Lines 46–63 (the appended block):

```sql
-- ─── Row-Level Security ──────────────────────────────────────
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "tenants"
  USING (id = current_setting('app.tenant_id', true));

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "users"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- ─── Application role grants ────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON "tenants" TO kidscare_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "users"    TO kidscare_app;

-- ─── Auth lookup role grants (column-level) ──────────────────
GRANT SELECT (id, slug)                       ON "tenants" TO kidscare_auth_lookup;
GRANT SELECT (id, "tenantId", email, "passwordHash") ON "users" TO kidscare_auth_lookup;
```

### Step 3 — `pnpm db:reset`

```
Applying migration `20260913152901_init`
Database reset successful
The following migration(s) have been applied:
migrations/
  └─ 20260913152901_init/
    └─ migration.sql
Running generate... ✔ Generated Prisma Client (v5.22.0) to .\src\generated\client in 93ms
Running seed command `tsx prisma/seed.ts` ...
The seed command has been executed.
```

Drop + recreate + migration apply + no-op seed all completed without errors.

### Step 4 — `\d+ tenants` (RLS + policy)

```
Policies (forced row security enabled):
    POLICY "tenant_isolation"
      USING ((id = current_setting('app.tenant_id'::text, true)))
```

### Step 4 — `\d+ users` (RLS + policy)

```
Policies (forced row security enabled):
    POLICY "tenant_isolation"
      USING (("tenantId" = current_setting('app.tenant_id'::text, true)))
```

### Step 5 — `information_schema.role_table_grants WHERE table_name='users'`

```
      grantee      | privilege_type
-------------------+----------------
 kidscare_app      | DELETE
 kidscare_app      | INSERT
 kidscare_app      | SELECT
 kidscare_app      | UPDATE
 kidscare_migrator | DELETE
 kidscare_migrator | INSERT
 kidscare_migrator | REFERENCES
 kidscare_migrator | SELECT
 kidscare_migrator | TRIGGER
 kidscare_migrator | TRUNCATE
 kidscare_migrator | UPDATE
```

(`kidscare_auth_lookup` grants are column-level so they don't appear in `role_table_grants`; verified in `column_privileges` below.)

### Step 5 — `information_schema.column_privileges` (auth_lookup rows only)

```
       grantee        | table_name | column_name  | privilege_type
----------------------+------------+--------------+----------------
 kidscare_auth_lookup | tenants    | id           | SELECT
 kidscare_auth_lookup | tenants    | slug         | SELECT
 kidscare_auth_lookup | users      | email        | SELECT
 kidscare_auth_lookup | users      | id           | SELECT
 kidscare_auth_lookup | users      | passwordHash | SELECT
 kidscare_auth_lookup | users      | tenantId     | SELECT
```

Exactly the 6 expected column-level SELECTs; no INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER grants for this role. `kidscare_app` rows in the same query show SELECT/INSERT/UPDATE on every column of both tables, confirming table-level privilege propagation.

## Self-review

- **Pre-step privilege grants on `kidscare_migrator` (binding, must surface):** `prisma migrate dev` failed twice before producing the migration file, even though the brief assumed it would just work.
  1. `P3014: Prisma Migrate could not create the shadow database ... ERROR: permission denied to create database` — Prisma creates and drops a `kidscare-shadow-<id>` shadow DB on every `migrate dev` to verify the migration. Fixed by `ALTER ROLE kidscare_migrator CREATEDB;` run as the `postgres` superuser.
  2. After (1), `migrate dev` then failed with `ERROR: permission denied for schema public` when the migrator tried to `CREATE TABLE` inside the schema. Fixed by `GRANT CREATE ON SCHEMA public TO kidscare_migrator;` as `postgres`.

  Both grants are session-local to the docker container (not committed anywhere) and are **operational reality** for Prisma's migrator role. They are not captured in any migration file because they're privileges held by the role, not table/schema objects. To make `pnpm db:reset` deterministic on a fresh checkout, the next task that touches the docker stack needs to either (a) add `ALTER ROLE kidscare_migrator CREATEDB;` and `GRANT CREATE ON SCHEMA public TO kidscare_migrator;` to `docker/init/01-roles.sql`, or (b) document them as bootstrap commands. I did NOT modify `01-roles.sql` because this task is migration-only and the brief explicitly forbade edits outside the migrations directory.

- **Seed file (`prisma/seed.ts`) created but NOT committed:** `prisma migrate reset --force` invokes `tsx prisma/seed.ts` because `package.json` has `"prisma": { "seed": "tsx prisma/seed.ts" }`. The file did not exist on entry. Without a file at that path the reset fails with `ERR_MODULE_NOT_FOUND`, which would have failed the brief's Step 3 verification. I created a one-line no-op (`export {};`) so `pnpm db:reset` could complete end-to-end, then **left it untracked** because Step 6's `git add` is restricted to `packages/database/prisma/migrations/`. The cost: on a fresh checkout, `pnpm db:reset` will fail until someone either (a) commits a real `seed.ts` in a later task, or (b) removes the `prisma.seed` block from `packages/database/package.json`. The cost of committing it: scope violation of the brief's "Only stage the migration directory" rule.

- **`.env` placement for Prisma CLI:** Prisma 5 loads from the current working directory OR the schema's parent directory (not the workspace root). The workspace-root `.env` (created in Task 5 for `prisma generate` to work in Task 5's environment) is not visible when `pnpm --filter @kidscare/database prisma ...` cd's into `packages/database/`. I copied `.env` to `packages/database/.env` (gitignored, same line as the workspace-root ignore). Verified with `git check-ignore -v packages/database/.env` → `.gitignore:6:.env packages/database/.env`.

- **Generated client diff (left unstaged):** `prisma generate` re-ran during `migrate dev` and produced cosmetic-only diffs in `packages/database/src/generated/client/*` (single → double quotes in `default.d.ts` / `default.js`, missing trailing newline in `package.json`, massive CRLF/LF swaps in the runtime files). The content is functionally identical — no schema changes happened, so the client code is unchanged in semantics. Per the brief's "if `prisma generate` re-ran ... stage any genuinely changed generated files (but typically none change for schema-only migrations)" guidance, I did not stage them. The working tree will show these as modified on the next task's entry; a future task should either run `prisma generate` from a clean Linux-style environment or normalize the existing client files.

- **Working tree at commit time:** 2 files committed (`migration.sql`, `migration_lock.toml`). Pre-existing modifications to `.superpowers/sdd/.../progress.md` and `reports/task-1-report.md` (from earlier tasks) were correctly left unstaged — out of scope for this task. `packages/database/.env` and `packages/database/src/generated/client/*` modifications are described above. `packages/database/prisma/seed.ts` is the new no-op file mentioned in the second bullet.

- **Constraints satisfied:** RLS + FORCE RLS + policies + grants all landed in the same migration file as the CREATE TABLE blocks (Global Constraint honored). Policy expression uses `current_setting('app.tenant_id', true)` with the `true` second argument. `kidscare_app` has table-level SELECT/INSERT/UPDATE/DELETE on both tables. `kidscare_auth_lookup` has column-level SELECT only — `(id, slug)` on tenants and `(id, "tenantId", email, "passwordHash")` on users, with no INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER. No `BYPASSRLS` was added to any role. `migration_lock.toml` was created and committed alongside the migration directory.

- **Not verified (out of scope):** End-to-end tenant isolation — that a `kidscare_app` connection with `SET LOCAL app.tenant_id = 'X'` only sees tenant X's rows — was not exercised; the brief only required proving RLS is `enabled, forced` and the policies exist, which Step 4 confirmed. A negative test (e.g., `psql -U kidscare_app -d kidscare -c "SELECT count(*) FROM users;"` without setting `app.tenant_id`) is a sensible follow-up for a future task.

## Commits

48057fb
