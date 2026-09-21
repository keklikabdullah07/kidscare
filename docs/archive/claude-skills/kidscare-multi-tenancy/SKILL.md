---
name: kidscare-multi-tenancy
description: Use whenever a request touches tenant-scoped data — adding a new module, writing a repository, designing an endpoint, or reviewing auth. Covers Postgres RLS, AsyncLocalStorage context, the three-role separation, and the guard usage. Load before any code change in apps/api that reads or writes a table.
---

# KidsCare — Multi-Tenancy Rules

## Why This Is the Hardest Rule in the Project

The product handles children's personal data (Öğrenci Pasaportu: kan grubu, alerjiler, sağlık notları). A single missing tenant filter leaks one tenant's children to another tenant's staff. The defence is layered: Postgres Row-Level Security at the database, AsyncLocalStorage at the application boundary, a NestJS guard at the controller boundary. Each layer alone is insufficient; all three together are the contract.

## Layer 1 — Database (Postgres RLS)

Every tenant-scoped table has `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` set in the migration. `FORCE` is mandatory — without it, the table owner role bypasses policies and a misconfigured connection becomes a data breach.

The policy uses `current_setting('app.tenant_id', true)` and matches on the table's `tenantId` column. The `true` second argument returns `NULL` instead of erroring when the setting is absent, which is how login-time lookups (with no tenant yet) work.

RLS does not protect columns. A `SELECT *` from a tenant-scoped table still returns every column of the visible rows. Column-level protection is a separate concern, applied only to the `kidscare_auth_lookup` role for the login flow.

Tables that are not tenant-scoped (none in MVP, but reserved for future global config tables) must not have RLS enabled and must be the only tables the `kidscare_app` role can read without a tenant context set.

## Layer 2 — Three Postgres Roles

Each role has the minimum privilege required for its purpose. No role is granted `BYPASSRLS`.

| Role                   | Purpose                                                  | Connects via               | Privileges                                                                       |
| ---------------------- | -------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------- |
| `kidscare_migrator`    | Schema owner, runs `prisma migrate` and `prisma db push` | `DATABASE_URL`             | DDL, full CRUD on all tables                                                     |
| `kidscare_app`         | Normal application runtime                               | `DATABASE_APP_URL`         | `SELECT/INSERT/UPDATE/DELETE` on all tenant-scoped tables; subject to FORCE RLS  |
| `kidscare_auth_lookup` | Login lookup only                                        | `DATABASE_AUTH_LOOKUP_URL` | `SELECT` on specific columns of `users` and `tenants` only; subject to FORCE RLS |

Roles are created in `docker-compose.yml`'s init script (`init/01-roles.sql`) on first container start. Passwords come from a Compose-managed secret file, not from `.env`.

The Prisma CLI connects as `kidscare_migrator` via `DATABASE_URL`. The NestJS `PrismaModule` connects as `kidscare_app` via `DATABASE_APP_URL`. The login handler in `apps/api/src/modules/auth/login.handler.ts` connects as `kidscare_auth_lookup` via `DATABASE_AUTH_LOOKUP_URL` — and only there.

## Layer 3 — Application Context

`packages/tenant-context/` exports an `AsyncLocalStorage<TenantContextValue | null>` instance plus a `runWithTenant(value, fn)` helper. `TenantContextValue` is:

```ts
type TenantContextValue = {
  tenantId: string;
  userId: string;
  role: 'ADMIN' | 'TEACHER' | 'PARENT';
};
```

`apps/api/src/common/context/tenant-context.middleware.ts` reads the JWT (sub-project #2 will replace the dev header path), parses `tenantId/userId/role`, and wraps the request handler with `runWithTenant`. The context exists for the lifetime of one HTTP request.

`apps/api/src/common/guards/tenant.guard.ts` is applied via `@UseGuards(TenantGuard)` on every controller method that touches tenant-scoped data. It throws `ForbiddenException` if no context is present. Endpoints marked with `@Public()` skip the guard — used only for `/health`, `/auth/login`, and the marketing public site.

## Layer 4 — Prisma Middleware

`packages/database/src/middleware/tenant.middleware.ts` exports `withTenantContext(prisma, ctx)`. It uses Prisma's `$extends` API to wrap every query in a transaction that runs `SET LOCAL app.tenant_id = '<ctx.tenantId>'` first. The base `prisma` export is a raw client used only for login-time lookups and for `prisma migrate`.

The `PrismaService` registered in `apps/api` extends the base client and applies `withTenantContext` per request by reading from the AsyncLocalStorage. Controllers never instantiate a Prisma client themselves; they always inject `PrismaService`.

## What You Must Never Do

1. Skip `@UseGuards(TenantGuard)` on a controller that returns tenant data. Code review rejects the PR.
2. Import `DATABASE_AUTH_LOOKUP_URL` or its value from anywhere other than the auth module's login handler file. A test in any other module reading this variable is a security violation.
3. Add `BYPASSRLS` to any role. If a query cannot succeed under RLS, fix the policy or the role grants — do not bypass.
4. Disable RLS on a tenant-scoped table for "convenience" in a test. Tests that need cross-tenant data use the `kidscare_app` role with two distinct contexts and assert isolation.
5. Use a `WHERE tenantId = ...` clause in application code as the only tenant filter. RLS enforces tenant isolation; a missing `WHERE` would still leak under RLS only if the policy is misconfigured, so application-level filtering is defence-in-depth but never the primary control.
6. Grant the `kidscare_app` role access to a new tenant-scoped table without also writing the matching RLS policy in the same migration. The two changes ship together or neither ships.

## Adding a New Tenant-Scoped Table — Checklist

When a module needs a new table:

- [ ] Add the model to `packages/database/prisma/schema.prisma` with a non-nullable `tenantId` column referencing `tenants(id)` and `onDelete: Cascade`
- [ ] Run `pnpm db:migrate` and edit the generated SQL to add `ENABLE`, `FORCE`, and `CREATE POLICY`
- [ ] Grant the appropriate privileges on the new table to `kidscare_app`
- [ ] If any column is sensitive enough to warrant column-level protection, document the role grants explicitly
- [ ] Add the table name to the integration test `apps/api/test/tenant-isolation.spec.ts` and assert cross-tenant queries return empty
- [ ] The Prisma client regenerated from the new schema will pick up the new model — no middleware changes needed
