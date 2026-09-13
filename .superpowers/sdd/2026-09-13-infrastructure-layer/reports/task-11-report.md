## Status

DONE

## One-line summary

Tenant-isolation integration test exercising RLS + AsyncLocalStorage across 4 scenarios (within-tenant read, cross-tenant block, auth-lookup SELECT, auth-lookup INSERT denial) — committed as `e165767`. Adds a follow-up migration granting `BYPASSRLS` to `kidscare_auth_lookup` (approved by user; was missing from the initial migration).

## Test evidence

```
pnpm exec jest --config apps/api/jest.config.integration.ts --rootDir apps/api
Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

## Self-review

- **RLS policy shape forced fixture redesign.** The migration's policy is `tenants.id = current_setting('app.tenant_id')` and `users.tenantId = current_setting('app.tenant_id')`. To INSERT a row, the new row's tenant column MUST match the session variable. The plan's brief used random slugs/cuids which silently violated the policy (Prisma wrapped the error in a generic PrismaClientUnknownRequestError). Pinned `TENANT_A_ID`/`TENANT_B_ID` to match the session variable on every insert. Same lesson surfaced earlier as R8 in the seed fix.
- **`SET LOCAL` inside Prisma's interactive transaction requires `tx.$executeRawUnsafe`.** Verified by adding `SELECT current_setting('app.tenant_id')` after the SET — returned the expected value. The earlier confusion with the array-form batch `$transaction` was caused by Prisma 5 not preserving session state across separate queries in batch mode (each query runs in its own sub-transaction for postgres). Interactive transactions guarantee the same connection, so `SET LOCAL` is visible to subsequent `tx.*` calls.
- **Middleware pattern must use `tx[model][operation](args)`, not `query(args)`.** The first cut of `forTenant()` in the spec used `query(args)` inside `prisma.$transaction(async (txInner) => { SET LOCAL; query(args) })` — failed because `query` is bound to the outer extended client (different connection). Switched to the same shape the Task 8 middleware settled on (`txInner[model][operation](args)`). Same lesson in three places now (seed, Task 8, Task 11) — strong signal the plan's brief was missing the gotcha and we should encode it as a per-package `README` note.
- **BYPASSRLS for auth_lookup required.** The initial migration grants `kidscare_auth_lookup` column-level SELECT on users, but FORCE RLS still applies. The login flow needs to find a user by email before any tenant context exists, so the role must bypass RLS. Without this grant, the test "login lookup via auth-lookup connection finds cross-tenant user" returns 0 rows due to `tenantId = NULL` failing the policy. **Added migration `20260913154500_auth_lookup_bypassrls/migration.sql`** granting BYPASSRLS to `kidscare_auth_lookup` only; the `kidscare_app` role remains subject to FORCE RLS (tenant isolation enforced at the application runtime via `withTenantContext`, Task 8). Per CLAUDE.md §5 this is the documented escape hatch.
- **Column-level SELECT + Prisma `findFirst` = permission error.** Initial test queried without `select`, which causes Prisma to SELECT all columns — auth_lookup has no grant on `createdAt`, `isActive`, `lastLoginAt`. PG rejected with `42501 permission denied for table users`. Fixed by restricting the query to the 4 accessible columns.
- **`jest.config.integration.ts` cannot import `./jest.config` directly** when ts-jest is configured for CJS — Node resolves the import as ESM and fails with `ERR_MODULE_NOT_FOUND`. Inlined the base config instead.
- **`setupFilesAfterEach` is not a real Jest option** (the plan's brief had this typo). Used `globalSetup` for the env loader and inlined `beforeEach`/`afterAll` cleanup in the spec file (the spec seeds its own fixture rows, so it owns the cleanup lifecycle).
- **Cleanup uses RLS-aware deletes** — `cleanupFixtures()` runs `SET LOCAL app.tenant_id = '<known-id>'` before each `DELETE` because even DELETE is subject to FORCE RLS. Iterates fixture tenant ids (`demo-tenant-seed-001`, `integration-tenant-a`, `integration-tenant-b`) so subsequent runs aren't polluted by previous runs or the seed script.
- **File-level `/* eslint-disable */` at top of spec** because Prisma's `$transaction(async (tx: any) => …)` callback signature forces `any` everywhere downstream. Per CLAUDE.md §7 this is the justified exception (Prisma doesn't expose the interactive-tx client as a generic). Lint exits 0; pre-commit hook passes.
- **`setup-integration-db.ts`** from the plan's brief is unused and was deleted (cleanup moved into the spec file via `cleanupFixtures()`).

## Commits

`e165767` — test(api): tenant isolation integration test for RLS + AsyncLocalStorage

## Follow-ups (park for final review)

- **M11.1** — `kidscare_auth_lookup` now has `BYPASSRLS`. The CLAUDE.md §5 invariant says "every repository method automatically gets the tenant_id filter from a base layer". The auth module is the documented exception (login must work without context); call this out explicitly in `apps/api/src/modules/auth/login.handler.ts` docs when sub-project #2 lands, so future maintainers don't try to wrap auth queries in `withTenantContext`.
- **M11.2** — The "SET LOCAL must be inside an interactive transaction" + "middleware must call `tx[model][op](args)` not `query(args)`" lessons have now been rediscovered in three places (Task 7 seed, Task 8 middleware, Task 11 spec). Worth a `packages/database/README.md` section or a comment block at the top of `tenant.middleware.ts` documenting the gotcha for future readers.
- **M11.3** — Initial migration should have included the `ALTER ROLE kidscare_auth_lookup BYPASSRLS` grant. The follow-up migration captures the intended design, but anyone running the migration chain from scratch on a fresh DB will get a different end-state than the current dev DB unless they apply the follow-up. Either fold the grant into the initial migration (requires DB reset) or document the migration order in `packages/database/README.md`.
- **M11.4** — `prisma.user.findFirst({ select: { … } })` restriction in the test is auth-lookup-specific. When sub-project #2 implements the login handler, that handler must include the same `select` shape — easy to forget. Worth extracting a `AUTH_LOOKUP_USER_COLUMNS` constant in `@kidscare/database` so both the test and the login handler share the same allow-list.
