---
name: kidscare-prisma-database
description: Use when modifying the Prisma schema, writing or reviewing migrations, adding seed data, or touching the database package. Covers schema conventions, migration workflow, RLS SQL patterns, generated client placement, and seed scripts.
---

# KidsCare — Prisma and Database Conventions

## Where Things Live

```
packages/database/
├── prisma/
│   ├── schema.prisma         (single source of truth for the schema)
│   ├── seed.ts               (idempotent dev seed)
│   └── migrations/           (generated, edited by hand for RLS SQL)
├── src/
│   ├── client.ts             (re-exports the generated client)
│   ├── middleware/
│   │   └── tenant.middleware.ts
│   └── index.ts              (public API: prisma, withTenantContext)
├── project.json              (Nx)
├── package.json
└── tsconfig.json
```

The generated Prisma client is committed to the repository at `packages/database/src/generated/client/`. Build reproducibility outweighs the noise in diffs. A `.gitignore` rule excluding the generated client is not used.

## Schema Conventions

### File Layout

One `schema.prisma` file. Models grouped by domain with a blank line between groups, comment headers per group:

```prisma
// ─── Identity ───────────────────────────────────────────────
model Tenant { ... }
model User   { ... }
```

### Naming

- Table names: snake_case via `@@map("table_name")`
- Column names: camelCase in Prisma (becomes snake_case in the DB if you set `@map`); for this project we keep Prisma's default and use camelCase in the DB too — consistency over convention
- Model names: PascalCase singular (`Tenant`, `User`, `Student`)
- Enum names: PascalCase (`UserRole`, `TenantStatus`)
- Enum values: SCREAMING_SNAKE_CASE (`ACTIVE`, `SUSPENDED`)

### Required Columns on Tenant-Scoped Models

Every model that holds per-tenant data has:

- `id` — `@id @default(cuid())` (cuid, not uuid — sortable and shorter)
- `tenantId` — `String`, non-nullable, FK to `tenants(id)` with `onDelete: Cascade`
- `createdAt` — `@default(now())`
- `updatedAt` — `@updatedAt`

Soft-delete via a `deletedAt: DateTime?` column is added per-model when the requirement is explicit. Hard delete + audit log is the default; soft delete is opt-in.

### Indexes

- An index on `tenantId` is added on every tenant-scoped model via `@@index([tenantId])` — the RLS policy's hot path
- Compound unique constraints include `tenantId` when the constraint is per-tenant (e.g. `@@unique([tenantId, email])`)
- JSONB columns (used for the Öğrenci Pasaportu) get a GIN index when queries filter into them: `@@index([passportData(ops: JsonbOps)], type: Gin)`

## Migrations

### Workflow

```bash
# from packages/database
pnpm prisma migrate dev --name <descriptive-name>
pnpm prisma generate
```

Migration names are descriptive kebab-case: `add-student-passport`, `create-payments-table`, `enable-rls-on-attendance`.

### RLS SQL Is Part of the Migration

When a migration creates a new tenant-scoped table, the same migration file must contain:

1. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
2. `ALTER TABLE ... FORCE ROW LEVEL SECURITY;`
3. `CREATE POLICY tenant_isolation ON ... USING (...);`
4. `GRANT SELECT, INSERT, UPDATE, DELETE ON ... TO kidscare_app;`

These statements live in the same `.sql` file as the `CREATE TABLE`. Splitting them across two migrations is a deployment hazard: a migration that ships before the RLS grant leaves the table world-readable until the next migration runs.

### Editing Generated SQL

`prisma migrate dev` generates a `CREATE TABLE` statement. Open the file and add the four RLS/grant statements manually before committing. The Prisma CLI does not know about RLS — that knowledge lives in the team, captured by code review and by the test suite.

## Seed Script

`packages/database/prisma/seed.ts` runs via `pnpm db:seed`. It is idempotent: re-running it does not duplicate rows. Pattern:

```ts
const tenant = await prisma.tenant.upsert({
  where: { slug: 'demo' },
  update: {},
  create: { slug: 'demo', name: 'Demo Kreş' },
});
```

Seed runs as `kidscare_migrator` (because `pnpm db:seed` is a migration-tier operation), which means it bypasses RLS for inserts. This is correct: seed needs to create rows across tenants.

The seed file uses the **raw** `prisma` export from `@kidscare/database`, not the extended client — the extension requires a context that does not exist at seed time.

## Client Generation

`generator client` block in `schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
}
```

The output path is relative to `schema.prisma` and is **not** the default `node_modules/.prisma/client`. This makes the client a workspace package that other packages can import without Prisma re-generating it locally.

After any schema change:

1. `pnpm prisma migrate dev --name <change>`
2. `pnpm prisma generate` (also runs as part of the above)
3. The TypeScript types in `apps/api` and other consumers pick up automatically — no separate build step

## What This Skill Does Not Cover

- Tenant context propagation through the app → `kidscare-multi-tenancy`
- Module template (controllers, services, repositories) → `kidscare-solid-modules`
- Test setup, including tenant-isolation integration tests → `kidscare-testing`
