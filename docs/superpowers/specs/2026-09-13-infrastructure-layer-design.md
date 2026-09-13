# KidsCare — Infrastructure Layer Design

**Date:** 2026-09-13
**Status:** Approved (brainstorming complete)
**Scope:** Sub-project #1 of 7 in the KidsCare bootstrap plan
**Related:** `../kres-uygulamasi-teknoloji-karar-raporu.md`, `../../CLAUDE.md`

---

## 1. Purpose

Establish the monorepo skeleton, database layer, tenant-isolation infrastructure, and minimal app skeletons needed before any feature module can be built. After this sub-project, the following will work end-to-end:

- `pnpm install` resolves all workspace dependencies
- `docker compose up -d` starts Postgres + Redis locally
- `pnpm db:migrate` applies the schema to Postgres
- `pnpm dev:api` starts the NestJS API; `GET /health` returns 200
- `pnpm dev:admin`, `pnpm dev:marketing`, `pnpm dev:mobile` start the corresponding apps
- A tenant-isolation test proves the guard and RLS pipeline work

Feature modules (auth, tenants, students, payments, etc.) are out of scope and will be planned separately.

---

## 2. Non-Goals

- No authentication flow yet (sub-project #2)
- No business modules (students, payments, messages, attendance — later)
- No CI/CD pipelines (added when first PR lands)
- No production deployment configuration
- No Cloudflare R2, iyzico, or FCM integration (later)
- No UI design work on admin/marketing/mobile (placeholders only)

---

## 3. Architecture Overview

```
                ┌──────────────────────────────────────────┐
                │              Nx Workspace               │
                │  pnpm + TypeScript strict + ESLint flat │
                └──────────────────────────────────────────┘
                                    │
        ┌───────────────────┬───────┴────────┬─────────────────────┐
        ▼                   ▼                ▼                     ▼
  apps/api (NestJS)   apps/admin-web   apps/marketing        apps/mobile
                                         (Next.js)            (Expo)
        │                   │                │                     │
        └───────────────────┴────────────────┴─────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
        packages/database    packages/shared-     packages/shared-
        (Prisma schema +    types (DTOs)         schemas (Zod)
         generated client)
                │
                ▼
        docker-compose: postgres:16 + redis:7
                │
                ▼
        Postgres RLS policies on every tenant-scoped table
```

**Request flow (sub-project #1 demonstration):**

1. `GET /health` arrives at NestJS
2. `TenantContextMiddleware` reads JWT (placeholder — empty for /health) and sets AsyncLocalStorage context
3. `TenantGuard` checks the context; on `/health` it short-circuits
4. Controller returns `{ status: 'ok' }`
5. (When feature modules land) Repository calls Prisma, which uses the middleware to `SET LOCAL app.tenant_id = '<ctx>'`, which RLS policies enforce

---

## 4. Repository Layout

```
kidscare/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── health/
│   │   │   │   ├── health.module.ts
│   │   │   │   ├── health.controller.ts
│   │   │   │   └── health.controller.spec.ts
│   │   │   └── common/
│   │   │       ├── context/
│   │   │       │   ├── tenant-context.service.ts
│   │   │       │   ├── tenant-context.middleware.ts
│   │   │       │   └── tenant-context.module.ts
│   │   │       └── guards/
│   │   │           └── tenant.guard.ts
│   │   ├── project.json (Nx)
│   │   └── tsconfig.json
│   ├── admin-web/
│   │   ├── src/main.tsx
│   │   ├── src/App.tsx
│   │   ├── project.json
│   │   └── tsconfig.json
│   ├── marketing/
│   │   ├── app/page.tsx
│   │   ├── project.json
│   │   └── tsconfig.json
│   └── mobile/
│       ├── app.json (Expo)
│       ├── App.tsx
│       ├── package.json (Expo)
│       └── tsconfig.json
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── seed.ts
│   │   │   └── migrations/      (generated)
│   │   ├── src/
│   │   │   ├── client.ts         (re-exports generated client)
│   │   │   ├── middleware/
│   │   │   │   └── tenant.middleware.ts
│   │   │   └── index.ts
│   │   ├── project.json
│   │   └── package.json
│   ├── tenant-context/           (new in this sub-project — see §7.1)
│   │   ├── src/
│   │   │   ├── tenant-context.ts
│   │   │   ├── run-with-tenant.ts
│   │   │   └── index.ts
│   │   ├── project.json
│   │   └── package.json
│   ├── shared-types/
│   │   ├── src/
│   │   │   ├── tenant.ts
│   │   │   ├── user.ts
│   │   │   └── index.ts
│   │   ├── project.json
│   │   └── package.json
│   └── shared-schemas/
│       ├── src/
│       │   ├── tenant.schema.ts
│       │   ├── user.schema.ts
│       │   └── index.ts
│       ├── project.json
│       └── package.json
├── docker-compose.yml
├── nx.json
├── package.json (workspace root)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .editorconfig
├── .eslintrc.cjs (or eslint.config.mjs for flat)
├── .prettierrc
├── .husky/
│   └── pre-commit
└── .lintstagedrc.json
```

---

## 5. Technology Choices (Decided)

| Concern | Choice | Reason |
|---|---|---|
| Monorepo tool | **Nx** | Per user decision; stronger dependency graph than Turborepo |
| Package manager | **pnpm** | Disk-efficient, native workspace support |
| Backend framework | NestJS 10 | Already in CLAUDE.md; modularity enforced |
| Admin panel | React 18 + Vite | Already in CLAUDE.md |
| Marketing | Next.js 14 (app router) | Already in decision report |
| Mobile | Expo SDK 51 | Already in decision report |
| ORM | Prisma | Already in decision report |
| Database | Postgres 16 | RLS support, JSONB for student passport later |
| Tenant isolation | **Postgres RLS + AsyncLocalStorage** | Defense in depth |
| Backend tests | Jest | NestJS default |
| Frontend tests | Vitest | Native Vite integration |
| Lint | ESLint flat config | Nx default + custom rules |
| Format | Prettier | Nx default |
| Git hooks | Husky + lint-staged | Pre-commit lint+format |

---

## 6. Database Schema (Sub-project #1)

`packages/database/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN          // tenant admin
  TEACHER
  PARENT
}

enum TenantStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

model Tenant {
  id        String       @id @default(cuid())
  slug      String       @unique
  name      String
  status    TenantStatus @default(ACTIVE)
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  users     User[]

  @@map("tenants")
}

model User {
  id           String    @id @default(cuid())
  tenantId     String
  email        String
  passwordHash String
  role         UserRole
  isActive     Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  tenant       Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, email])   // email unique per tenant
  @@index([tenantId])
  @@map("users")
}
```

**RLS policies** (applied via migration SQL):

```sql
-- tenants: only the row matching the session tenant_id is visible
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON tenants
  USING (id = current_setting('app.tenant_id', true));

-- users: scoped to tenant_id in session
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON users
  USING ("tenantId" = current_setting('app.tenant_id', true));
```

`FORCE ROW LEVEL SECURITY` is required so that RLS applies even to the table owner. Without it, the migrator role would bypass all policies and a misconfigured connection could leak data.

**Postgres role separation** (applied by `docker-compose.yml` init script `init/01-roles.sql`):

Three roles, each with minimal privileges:

- `kidscare_migrator` — owner of the schema; used **only** by `prisma migrate` and `prisma db push`. Can DDL, can CRUD all rows. Connects with `DATABASE_URL`.
- `kidscare_app` — normal application role. Granted `SELECT/INSERT/UPDATE/DELETE` on all tenant-scoped tables. Subject to `FORCE RLS`. Connects with `DATABASE_APP_URL`.
- `kidscare_auth_lookup` — login-only role. Granted `SELECT` on **specific columns only** of `users` and `tenants` (see §7.5). Subject to `FORCE RLS`. Connects with `DATABASE_AUTH_LOOKUP_URL`.

The runtime app connects with `DATABASE_APP_URL`. Migration tooling connects with `DATABASE_URL`. Login only uses `DATABASE_AUTH_LOOKUP_URL`. No role is granted `BYPASSRLS`.

Note: The `tenants` table itself being tenant-scoped is unusual but appropriate here — a tenant's own row is visible to its admins; other tenants are invisible. Global lookup of tenants by slug (for login) happens via the dedicated `kidscare_auth_lookup` role (§7.5).

**Seed data** (`packages/database/prisma/seed.ts`):

- 1 demo tenant: `slug=demo`, `name=Demo Kreş`
- 1 admin user: `email=admin@demo.test`, `passwordHash=<bcrypt 'demo1234'>`, `role=ADMIN`
- 1 teacher user: `email=teacher@demo.test`, `passwordHash=<bcrypt 'demo1234'>`, `role=TEACHER`

---

## 7. Tenant Guard Infrastructure

### 7.1 AsyncLocalStorage context

`packages/database` cannot depend on NestJS, so the AsyncLocalStorage primitive lives in `apps/api/src/common/context/tenant-context.service.ts` and is consumed by both the middleware and the Prisma middleware (via a shared package or DI token).

Two options considered:

- **Option A (chosen):** Define a `@kidscare/tenant-context` package that exports `TenantContext` (AsyncLocalStorage wrapper). `apps/api` and `packages/database` both depend on it. Lightweight, framework-agnostic.
- **Option B:** Define the AsyncLocalStorage inside `packages/database` and have `apps/api` import from there. Couples DB package to API patterns.

We choose **Option A** for clean layering.

```
packages/tenant-context/        (new package, minimal)
├── src/
│   ├── tenant-context.ts        (AsyncLocalStorage<TenantContextValue>)
│   ├── run-with-tenant.ts       (helper to wrap a callback)
│   └── index.ts
├── project.json
├── package.json
└── tsconfig.json
```

`TenantContextValue`:
```ts
export type TenantContextValue = {
  tenantId: string;
  userId: string;
  role: 'ADMIN' | 'TEACHER' | 'PARENT';
} | null;
```

### 7.2 NestJS middleware

`apps/api/src/common/context/tenant-context.middleware.ts`:

- Reads `Authorization: Bearer <jwt>` (placeholder for sub-project #1: header `x-tenant-id` + `x-user-id` allowed in dev only, gated by `NODE_ENV !== 'production'`)
- Parses `{ tenantId, userId, role }`
- Calls `tenantContext.run(value, next)` to wrap the request lifecycle

`apps/api/src/common/guards/tenant.guard.ts`:

- Used via `@UseGuards(TenantGuard)` on tenant-scoped controllers (mandatory per CLAUDE.md §5)
- Throws `ForbiddenException` if no context
- Skips when `@Public()` decorator is present (used for `/health`)

### 7.3 Prisma middleware

`packages/database/src/middleware/tenant.middleware.ts`:

- Exports `withTenantContext(prisma, ctx)` — wraps a Prisma client so every query runs inside a transaction that first `SET LOCAL app.tenant_id = '<ctx.tenantId>'`
- Uses Prisma's `$extends` API (Prisma 4.16+) for type safety
- The base `prisma` export is a raw client intended for migration tooling and seed scripts only. Application runtime uses the extended client. Login does not go through this client — it constructs its own dedicated `PrismaClient` bound to `DATABASE_AUTH_LOOKUP_URL` (§7.5).

### 7.4 Request lifecycle

```
HTTP request
   │
   ▼
TenantContextMiddleware
   │  parses headers → ctx
   │  tenantContext.run(ctx, () => next())
   ▼
TenantGuard (on tenant-scoped routes)
   │  ctx present? proceed : 403
   ▼
Controller
   │  injects PrismaService
   │  prisma.$extends(withTenantContext(ctx))
   ▼
Prisma query
   │  middleware opens tx, SET LOCAL app.tenant_id, runs query
   ▼
Postgres
   │  RLS policy evaluates using current_setting('app.tenant_id')
   │  returns rows where policy matches
   ▼
Response
```

### 7.5 Auth Lookup Connection

Login requires looking up a user by email across tenants (the request does not yet carry a tenant id). This lookup must not happen through `kidscare_app`, because `kidscare_app` is scoped to a single tenant via `SET LOCAL app.tenant_id` and could never find cross-tenant rows even if it tried. It also must not happen through `kidscare_migrator`, which has full DDL access and is only meant for migrations.

Instead, login uses a third role: `kidscare_auth_lookup`.

**Role definition** (in `init/01-roles.sql`):

```sql
CREATE ROLE kidscare_auth_lookup LOGIN PASSWORD :'AUTH_LOOKUP_PASSWORD';
GRANT CONNECT ON DATABASE kidscare TO kidscare_auth_lookup;
GRANT USAGE ON SCHEMA public TO kidscare_auth_lookup;

-- column-level SELECT only on the minimum needed for login
GRANT SELECT (id, "tenantId", email, "passwordHash") ON TABLE users TO kidscare_auth_lookup;
GRANT SELECT (id, slug) ON TABLE tenants TO kidscare_auth_lookup;

-- explicitly no INSERT/UPDATE/DELETE/REFERENCES/TRUNCATE
-- explicitly no TRIGGER, no RULE, no ownership of anything
```

**Connection string** (`DATABASE_AUTH_LOOKUP_URL`) is exposed only via `process.env` and read **exclusively** in `apps/api/src/modules/auth/login.handler.ts` (sub-project #2 will create this file). It is never imported by any other module.

**CLAUDE.md rule** (to be added in sub-project #2's spec, enforced from day one):

> `DATABASE_AUTH_LOOKUP_URL` may only be read from `process.env` inside the auth module's login handler. Any other import, reference, or usage — including tests outside the auth module — is a security violation and must be rejected at code review.

**Login flow** (preview — full design in sub-project #2):

```
POST /auth/login { email, password }
   │
   ▼
login.handler reads DATABASE_AUTH_LOOKUP_URL
   │  opens a dedicated PrismaClient bound to that URL
   │  SELECT id, "tenantId", email, "passwordHash" FROM users WHERE email = $1
   │  verify password hash (bcrypt) — fail-fast constant-time comparison
   │  on success: issue JWT signed with JWT_SECRET, scoped to tenantId
   │  on failure: generic 401 (no user enumeration)
   ▼
Response: { token, tenantId, role }
```

The dedicated `PrismaClient` is constructed inside the handler, used for the single query, and immediately closed. It does not share the connection pool with the main app client.

**Why not `BYPASSRLS`?** A `BYPASSRLS` role can read everything. `kidscare_auth_lookup` is locked down to specific columns on specific tables — even if compromised, it cannot enumerate all users or pivot to other tables.

---

## 8. App Skeletons

### apps/api (NestJS)

- `AppModule` imports: `ConfigModule`, `HealthModule`, `TenantContextModule`, `PrismaModule`
- `PrismaModule` (global) provides `PrismaService` extending `PrismaClient`. Configured to read `DATABASE_APP_URL` (not `DATABASE_URL`) so the runtime never connects as the migrator role.
- `HealthModule` exports `HealthController` with `@Public()` decorator
- `main.ts`: `app.use(...)` to register the middleware globally, listen on `process.env.PORT ?? 3000`
- Bootstrap CORS for `http://localhost:5173` (admin-web) and `http://localhost:3000` (marketing) — different ports, configured explicitly

### apps/admin-web (Vite + React)

- Vite scaffold (no template — bare React + TS)
- Routes: `/` → landing placeholder, future routes will live here
- TanStack Query provider wired
- Theme: light only for sub-project #1; design tokens added later

### apps/marketing (Next.js)

- App Router scaffold
- `/` → placeholder landing with `<h1>KidsCare</h1>` and a paragraph

### apps/mobile (Expo)

- `expo-template-blank-typescript` baseline
- Single screen with `<Text>KidsCare</Text>`
- TypeScript configured

---

## 9. Tooling Configuration

### `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": {
      "@kidscare/shared-types": ["packages/shared-types/src"],
      "@kidscare/shared-schemas": ["packages/shared-schemas/src"],
      "@kidscare/database": ["packages/database/src"],
      "@kidscare/tenant-context": ["packages/tenant-context/src"]
    }
  }
}
```

### ESLint

- `@nx/eslint-plugin`
- `@typescript-eslint/recommended-type-checked`
- Custom rule: `no-explicit-any: error`
- Test files: relaxed `no-explicit-any` to `warn`

### Prettier

- Nx defaults; overrides for `.prisma` files (no quotes on string defaults)

### Husky + lint-staged

- Pre-commit: `pnpm exec nx format:write --files=<staged>` + `pnpm exec nx lint --files=<staged>`

---

## 10. Testing Strategy

### Backend (Jest)

- **Unit:** Each service, repository, middleware, guard gets a `.spec.ts` colocated
- **Integration:** `tenant-isolation.spec.ts` in `apps/api/test/` boots a test Postgres, seeds two tenants, and proves:
  - Tenant A user querying `users` sees only Tenant A's users
  - Tenant B user querying `users` sees only Tenant B's users
  - Cross-tenant query returns empty
- Tests run against a separate `DATABASE_URL` pointing at a dedicated schema; per-test setup truncates tables

### Frontend (Vitest)

- Vitest scaffolded in `apps/admin-web`
- Initial test: `App.test.tsx` — renders without crashing

### E2E (deferred)

- Not in this sub-project; first E2E will land with auth

### Coverage

- No minimum threshold in sub-project #1; baseline coverage report enabled in CI later

---

## 11. Environment & Secrets

`.env.example` (committed):

```
# Migration role — owner of schema, used only by prisma migrate / db push
DATABASE_URL=postgresql://kidscare_migrator:migrator_pw@localhost:5432/kidscare?schema=public

# Normal application role — used by the NestJS app at runtime
DATABASE_APP_URL=postgresql://kidscare_app:app_pw@localhost:5432/kidscare?schema=public

# Login-only role — read by auth module's login handler ONLY (see §7.5)
DATABASE_AUTH_LOOKUP_URL=postgresql://kidscare_auth_lookup:auth_pw@localhost:5432/kidscare?schema=public

REDIS_URL=redis://localhost:6379
JWT_SECRET=replace-me
NODE_ENV=development
PORT=3000
```

Role passwords above are placeholders for local dev. The actual passwords come from `docker-compose.yml`'s init script (`init/01-roles.sql` reads them from a Compose-only `secrets` file, not from `.env`).

**Prisma uses `DATABASE_URL`** (the migrator role) for `prisma migrate` and `prisma generate`. The NestJS runtime reads `DATABASE_APP_URL` (see `PrismaModule` configuration in §8).

`.env` (gitignored, dev only) — copy of `.env.example` with real local values matching the init script.

No production secrets in this sub-project.

---

## 12. Acceptance Criteria

A sub-project is considered done when **all** of the following are true:

1. `pnpm install` succeeds with no errors
2. `docker compose up -d` starts Postgres + Redis; `docker compose ps` shows both healthy
3. `pnpm db:migrate` applies the initial migration including RLS policies
4. `pnpm db:seed` creates the demo tenant and two users
5. `pnpm dev:api` boots NestJS; `curl http://localhost:3000/health` returns `{"status":"ok"}`
6. `pnpm dev:admin` renders `http://localhost:5173` with the admin landing placeholder
7. `pnpm dev:marketing` renders `http://localhost:3000` (or chosen port) with the marketing landing
8. `pnpm dev:mobile` boots Expo and displays the placeholder screen in Expo Go
9. `pnpm test` runs all backend + frontend tests green
10. `pnpm test:integration` runs the tenant-isolation integration test green
11. `pnpm lint` passes with no errors
12. The CLAUDE.md module template is respected in any module-shaped code added (no premature modules)

---

## 13. Risks & Open Questions

| # | Risk / Question | Mitigation |
|---|---|---|
| 1 | Docker Desktop not running on Windows | Document fallback in README; user can use `pg_ctl` natively if Docker is unavailable |
| 2 | Nx + Expo interop quirks | Use Expo's standalone `package.json` (not Nx project.json) for `apps/mobile`; Nx only owns the dependency graph, not the build |
| 3 | Prisma client generation across packages | Pin `output` to a deterministic path; commit a `.gitignore` rule for generated files is **not** used — generated client is committed for build reproducibility |
| 4 | Login flow needs cross-tenant lookup | Login constructs its own dedicated `PrismaClient` bound to `DATABASE_AUTH_LOOKUP_URL` (see §7.5); the `kidscare_auth_lookup` role is restricted to column-level `SELECT` on `users` and `tenants` — no `BYPASSRLS`, no other table access |
| 5 | Husky on Windows | Use Husky 9 which supports Windows; document `corepack enable` requirement |

---

## 14. Out of Scope (Confirmed)

- Auth flow (login, register, JWT issuance, refresh) — sub-project #2
- Tenant CRUD endpoints — sub-project #3
- Students / Student Passport — sub-project #4
- Admin panel real screens — sub-project #5
- Mobile real screens — sub-project #6
- Marketing site real content — sub-project #7
- CI/CD, observability, deployment — future

---

## 15. References

- `CLAUDE.md` — module template, naming, SOLID, tenant rules
- `kres-uygulamasi-teknoloji-karar-raporu.md` — stack decisions
- Prisma `$extends` docs (RLS pattern)
- NestJS `AsyncLocalStorage` integration via middleware
- Postgres RLS docs
