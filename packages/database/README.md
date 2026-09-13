# `@kidscare/database`

Prisma schema, client, migrations, seed script, and the tenant context
middleware used by every backend runtime in this monorepo.

## Tenant isolation: the gotchas

Three lessons have been rediscovered at least once each in this codebase
(seed, middleware, integration test). Document them here so the next
reader doesn't pay the same debugging tax.

### 1. `SET LOCAL app.tenant_id` MUST run inside an interactive transaction

`SET LOCAL` in PostgreSQL only lives for the duration of the current
transaction. Issuing it on a bare `prisma` client outside of
`$transaction(...)` either (a) runs on a different connection than the
query that follows or (b) sets a variable that gets reset before the
query sees it. Either way, RLS evaluates `current_setting('app.tenant_id')`
to `NULL` and rejects the query with `42501 new row violates row-level
security policy`.

Correct shape (used by the seed and the tenant middleware):

```ts
await prisma.$transaction(async (tx) => {
  await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
  return tx.tenant.create({ data: { ... } });
});
```

The array-form batch `$transaction([...queries])` does NOT work for
this: in Prisma 5 each query in the array runs in its own sub-transaction
on the postgres side, so a `SET LOCAL` at index 0 has no effect on the
INSERT at index 1.

### 2. The middleware must call `tx[model][operation](args)`, not `query(args)`

The Prisma `$extends` `$allOperations` callback exposes a `query` function
that runs the operation through the OUTER extended client — a different
connection from the one your `prisma.$transaction(async (txInner) => { ... })`
just configured with `SET LOCAL`. Calling `query(args)` will silently run
on the wrong connection and RLS will see `app.tenant_id` as `NULL`.

Correct shape (used by `withTenantContext` in `src/middleware/tenant.middleware.ts`):

```ts
$allOperations: async ({ model, operation, args }) =>
  prisma.$transaction(async (txInner) => {
    await txInner.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
    return txInner[model][operation](args);
  }),
```

### 3. RLS policies on this schema require the new row's tenant column to match the session variable

- `tenants` policy: `id = current_setting('app.tenant_id', true)`
- `users` policy: `"tenantId" = current_setting('app.tenant_id', true)`

To INSERT a tenant, set `app.tenant_id` to the new tenant's `id` first
(both inside the same transaction). The same applies to `users.tenantId`.
The `withTenantContext` middleware handles this on the read path; the
seed and integration test pin their fixture ids to known constants so
`SET LOCAL` matches the row's tenant column on every insert.

## Auth lookup (`kidscare_auth_lookup` role)

The login flow uses a separate Prisma client factory
(`createAuthLookupClient`) that connects as the `kidscare_auth_lookup`
role. That role has **column-level SELECT** on `users` (id, tenantId,
email, passwordHash) and `tenants` (id, slug), and **BYPASSRLS** so it
can resolve a user by email before any tenant context exists.

**Important:** any query that goes through this factory must use the
`AUTH_LOOKUP_USER_COLUMNS` / `AUTH_LOOKUP_TENANT_COLUMNS` allow-list in
`select` — Prisma's full-row SELECT fetches all columns and PG rejects
the query with `42501 permission denied for table users` for any column
the role isn't granted.

Both constants are exported from `@kidscare/database` so the login
handler (sub-project #2) and the integration test share the same shape.

## Build / lint / test

This package ships its TypeScript source directly (`main: src/index.ts`).
Consumers must either:

- run via `tsx` (the API does this with `node -r tsx/cjs`), OR
- build the package first (`pnpm -build` → `dist/`) and update `main`/`types`

```bash
pnpm test            # jest, src/middleware + src/client
pnpm db:migrate      # prisma migrate deploy
pnpm db:seed         # demo tenant + 2 users
pnpm db:reset        # nukes + re-migrates + re-seeds
```
