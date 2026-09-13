---
name: kidscare-architecture
description: Use when working on the KidsCare codebase to understand the monorepo layout, where each concern lives, and the dependency graph between apps and packages. Load before any task that touches more than one workspace project.
---

# KidsCare — Architecture Reference

## Monorepo Layout

Nx workspace, pnpm. Every workspace project is a Node package; `apps/*` are deployable, `packages/*` are consumed by apps and by each other.

```
kidscare/
├── apps/
│   ├── api/          NestJS 10 backend, multi-tenant
│   ├── admin-web/    React + Vite SPA (teacher + tenant admin)
│   ├── marketing/    Next.js 14 public site
│   └── mobile/       Expo SDK 51, React Native
├── packages/
│   ├── database/           Prisma schema + generated client + tenant middleware
│   ├── tenant-context/     AsyncLocalStorage wrapper, framework-agnostic
│   ├── shared-types/       DTO/interface contracts
│   └── shared-schemas/     Zod validation schemas
├── docker-compose.yml      Postgres + Redis
└── nx.json
```

`apps/mobile` keeps Expo's standalone `package.json` (not Nx `project.json`) because Expo's CLI owns the build pipeline. Nx is responsible only for the dependency graph, not for building the mobile bundle.

## Dependency Direction

Strict acyclic graph. Edges go from app to package, never app-to-app, and packages depend on each other in this order only:

```
apps/*  →  shared-schemas, shared-types, database, tenant-context
database  →  tenant-context
shared-schemas  →  shared-types
```

Reverse edges are not allowed. If you find yourself wanting `apps/api` to import from `apps/admin-web`, the shared concern belongs in a package.

## Where Each Concern Lives

| Concern | Lives in |
|---|---|
| HTTP endpoints, request/response shape | `apps/api/src/modules/<domain>/controllers/` |
| Domain logic | `apps/api/src/modules/<domain>/services/` |
| Persistence (SQL/Prisma) | `apps/api/src/modules/<domain>/repositories/` |
| Validation rules shared with frontend | `packages/shared-schemas/` |
| TypeScript types shared across stack | `packages/shared-types/` |
| Database schema, migrations, seed | `packages/database/prisma/` |
| Tenant context propagation | `packages/tenant-context/` |
| React Native screens | `apps/mobile/app/` |
| Admin SPA screens | `apps/admin-web/src/routes/` |
| Marketing pages | `apps/marketing/app/` |

If a concern does not have a clear home in this table, stop and ask the user before creating a new location.

## Module Boundary Within `apps/api`

A domain module (`students`, `payments`, `tenants`, etc.) owns its own controllers, services, repositories, DTOs, entities, and tests. It may not reach into another module's repository. Cross-module coordination goes through the other module's service, with an explicit interface dependency if the consumer needs testability.

A module's `*.module.ts` registers its controllers and providers with NestJS DI. Providers that need configuration use `ConfigService` — never `process.env` directly.

## What This Skill Does Not Cover

- Module template (controller/service/repo file structure) → `kidscare-solid-modules`
- Database schema, migrations, RLS SQL → `kidscare-prisma-database`
- Tenant isolation rules → `kidscare-multi-tenancy`
- Naming conventions → `kidscare-naming-rules`
- Test structure → `kidscare-testing`
- Shared package usage → `kidscare-shared-packages`

If a question falls into one of those areas, load the relevant skill instead of guessing.
