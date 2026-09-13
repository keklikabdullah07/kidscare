# KidsCare Infrastructure Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the KidsCare monorepo skeleton, database layer with multi-tenant RLS infrastructure, NestJS API with a working `/health` endpoint, and minimal placeholders for admin-web, marketing, and mobile — verified end-to-end by the acceptance criteria in the spec.

**Architecture:** Nx workspace with pnpm; packages `database` (Prisma + tenant middleware), `tenant-context` (AsyncLocalStorage), `shared-types` and `shared-schemas`. Apps `api` (NestJS), `admin-web` (Vite+React), `marketing` (Next.js), `mobile` (Expo). Local Postgres 16 + Redis 7 via docker-compose. Tenant isolation enforced by Postgres RLS + Prisma middleware that reads from AsyncLocalStorage; three Postgres roles (`migrator`, `app`, `auth_lookup`) with minimal privileges.

**Tech Stack:** Node 20+, pnpm 9, Nx 19+, NestJS 10, Prisma 5+, Postgres 16, Redis 7, Docker Desktop, TypeScript 5+, Vite 5+, Next.js 14, Expo SDK 51, Jest, Vitest.

**Spec:** `../specs/2026-09-13-infrastructure-layer-design.md` (also `.tr.md` for the Turkish translation; the English spec is the source of truth).

---

## Global Constraints

These apply to every task below. Pulled verbatim from the spec and CLAUDE.md.

- **Node:** v20 LTS or newer (Expo SDK 51 and NestJS 10 both require Node 20+).
- **pnpm:** v9 or newer (workspace support, peer-dependency isolation).
- **Nx:** v19 or newer (flat ESLint config, modern generators).
- **TypeScript:** v5.4+, `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `noImplicitOverride: true`.
- **Postgres:** v16 (RLS, JSONB, `current_setting` second-arg behaviour).
- **Redis:** v7 (BullMQ requirement, deferred but provisioned).
- **Docker Desktop:** required on Windows; `docker compose` v2 syntax.
- **No `any`:** the `@typescript-eslint/no-explicit-any` rule is set to `error` everywhere except `*.spec.ts` files (set to `warn`).
- **Module template:** every NestJS domain module uses the layout in CLAUDE.md §3 — `controllers/`, `services/`, `repositories/`, `dto/`, `entities/`, plus `*.module.ts` and `*.spec.ts`. No helpers/, utils/, common/ at module root.
- **Tenant guard:** every controller method that returns tenant-scoped data is decorated with `@UseGuards(TenantGuard)`. `@Public()` is only used for `/health`, `/auth/*` (sub-project #2), and the marketing site.
- **Naming:** `kebab-case.ts` files, `PascalCase` classes, `camelCase` members. DTOs and entities are nouns. Service methods follow NestJS CRUD conventions.
- **Commits:** conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`). One commit per task. Run `pnpm exec nx format:write` and `pnpm exec nx lint` before committing.
- **No `DATABASE_AUTH_LOOKUP_URL` import outside `apps/api/src/modules/auth/login.handler.ts`.** That module file does not exist yet (sub-project #2), so no import is permitted in sub-project #1 either — the connection-string constant lives in `packages/database/src/client/auth-lookup-client.ts` and is exported, but every consumer is forbidden until sub-project #2 lands.
- **Three Postgres roles are mandatory:** `kidscare_migrator` (DDL, owns schema), `kidscare_app` (CRUD, subject to FORCE RLS), `kidscare_auth_lookup` (column-level SELECT on `users` and `tenants` only).
- **Migrations are atomic:** every migration that creates a tenant-scoped table also includes `ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY`, `CREATE POLICY`, and the `GRANT` to `kidscare_app` in the same SQL file.
- **Generated Prisma client is committed** at `packages/database/src/generated/client/`. No `.gitignore` rule excluding it.

---

## Task 1: Initialize Nx Workspace + pnpm

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `nx.json`
- Create: `.gitignore`
- Create: `.gitattributes`

**Step 1:** Open a terminal in `C:\Users\Partridge\Desktop\KidsCare`. Initialise an empty package and install Nx + pnpm tooling.

```bash
cd C:\Users\Partridge\Desktop\KidsCare
pnpm init
pnpm add -Dw nx@^19.0.0
pnpm add -Dw typescript@^5.4.0 @types/node@^20.0.0
```

**Step 2:** Replace the generated `package.json` with the workspace root manifest.

```json
{
  "name": "kidscare",
  "version": "0.0.0",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "engines": { "node": ">=20" },
  "scripts": {
    "db:up": "docker compose up -d",
    "db:down": "docker compose down",
    "db:migrate": "pnpm --filter @kidscare/database prisma migrate deploy",
    "db:migrate:dev": "pnpm --filter @kidscare/database prisma migrate dev",
    "db:seed": "pnpm --filter @kidscare/database prisma db seed",
    "db:reset": "pnpm --filter @kidscare/database prisma migrate reset --force",
    "dev:api": "pnpm --filter @kidscare/api start:dev",
    "dev:admin": "pnpm --filter @kidscare/admin-web dev",
    "dev:marketing": "pnpm --filter @kidscare/marketing dev",
    "dev:mobile": "pnpm --filter @kidscare/mobile start",
    "test": "pnpm exec nx run-many --target=test",
    "test:integration": "pnpm --filter @kidscare/api test:integration",
    "lint": "pnpm exec nx run-many --target=lint",
    "format": "pnpm exec nx format:write"
  },
  "devDependencies": {
    "nx": "^19.0.0",
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0"
  }
}
```

**Step 3:** Create `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Step 4:** Create `nx.json`:

```json
{
  "npmScope": "kidscare",
  "affected": { "defaultBase": "main" },
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": { "cacheableOperations": ["build", "test", "lint"] }
    }
  },
  "workspaceLayout": { "appsDir": "apps", "libsDir": "packages" }
}
```

**Step 5:** Create `.gitignore`:

```
node_modules/
dist/
.nx/
.turbo/
*.log
.env
.env.local
apps/mobile/.expo/
apps/mobile/node_modules/
coverage/
.next/
```

**Step 6:** Create `.gitattributes` to keep line endings consistent across OSes:

```
* text=auto eol=lf
*.png binary
*.jpg binary
*.ico binary
```

**Step 7:** Initialise git and create the first commit.

```bash
git init
git add .
git commit -m "chore: initialise Nx workspace with pnpm"
```

---

## Task 2: Base TypeScript, ESLint, Prettier, Husky

**Files:**
- Create: `tsconfig.base.json`
- Create: `eslint.config.mjs`
- Create: `.prettierrc`
- Create: `.husky/pre-commit`
- Create: `.lintstagedrc.json`

**Step 1:** Create `tsconfig.base.json`:

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
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@kidscare/shared-types": ["packages/shared-types/src"],
      "@kidscare/shared-schemas": ["packages/shared-schemas/src"],
      "@kidscare/database": ["packages/database/src"],
      "@kidscare/tenant-context": ["packages/tenant-context/src"]
    }
  },
  "exclude": ["node_modules", "dist", ".nx", "apps/mobile/node_modules"]
}
```

**Step 2:** Install lint/format tooling.

```bash
pnpm add -Dw eslint@^9.0.0 @eslint/js typescript-eslint eslint-config-prettier prettier husky lint-staged
```

**Step 3:** Create `eslint.config.mjs`:

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts', '**/*.test.tsx'],
    rules: { '@typescript-eslint/no-explicit-any': 'warn' }
  },
  prettier
];
```

**Step 4:** Create `.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "overrides": [{ "files": "*.prisma", "options": { "singleQuote": false } }]
}
```

**Step 5:** Initialise Husky and create the pre-commit hook.

```bash
pnpm exec husky init
```

Replace the contents of `.husky/pre-commit` with:

```sh
pnpm exec lint-staged
```

**Step 6:** Create `.lintstagedrc.json`:

```json
{
  "*.{ts,tsx,js,mjs,json,md,prisma}": ["pnpm exec prettier --write", "pnpm exec eslint --fix"]
}
```

**Step 7:** Run the formatters to confirm everything resolves.

```bash
pnpm exec prettier --check .
pnpm exec eslint .
```

Expected: prettier reports no diffs; eslint reports no errors (no source files yet).

**Step 8:** Commit.

```bash
git add .
git commit -m "chore: configure base TypeScript, ESLint, Prettier, Husky"
```

---

## Task 3: Create `packages/tenant-context`

**Files:**
- Create: `packages/tenant-context/project.json`
- Create: `packages/tenant-context/package.json`
- Create: `packages/tenant-context/tsconfig.json`
- Create: `packages/tenant-context/src/tenant-context.ts`
- Create: `packages/tenant-context/src/run-with-tenant.ts`
- Create: `packages/tenant-context/src/index.ts`
- Create: `packages/tenant-context/src/tenant-context.spec.ts`

**Step 1:** Create `package.json`:

```json
{
  "name": "@kidscare/tenant-context",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": { "test": "echo 'no test runner yet'" }
}
```

**Step 2:** Create `tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist" },
  "include": ["src/**/*.ts"]
}
```

**Step 3:** Create `project.json`:

```json
{
  "name": "tenant-context",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "packages/tenant-context/src",
  "projectType": "library",
  "targets": {
    "lint": { "executor": "@nx/eslint:lint" },
    "test": { "executor": "@nx/jest:jest", "options": { "jestConfig": "packages/tenant-context/jest.config.ts" } }
  },
  "tags": ["scope:shared"]
}
```

**Step 4:** Write the failing test first.

`packages/tenant-context/src/tenant-context.spec.ts`:

```ts
import { AsyncLocalStorage } from 'node:async_hooks';
import { tenantContext, runWithTenant } from './index';

describe('tenant-context', () => {
  it('exposes an AsyncLocalStorage instance', () => {
    expect(tenantContext).toBeInstanceOf(AsyncLocalStorage);
  });

  it('propagates the context value through runWithTenant', () => {
    const value = { tenantId: 't1', userId: 'u1', role: 'ADMIN' as const };
    let observed: unknown = null;
    runWithTenant(value, () => {
      observed = tenantContext.getStore();
    });
    expect(observed).toEqual(value);
  });

  it('returns undefined outside any runWithTenant call', () => {
    expect(tenantContext.getStore()).toBeUndefined();
  });
});
```

**Step 5:** Run the test to confirm it fails.

```bash
pnpm --filter @kidscare/tenant-context test
```

Expected: FAIL — module `./index` not found.

**Step 6:** Implement `tenant-context.ts`:

```ts
import { AsyncLocalStorage } from 'node:async_hooks';

export type TenantContextValue = {
  tenantId: string;
  userId: string;
  role: 'ADMIN' | 'TEACHER' | 'PARENT';
} | null;

export const tenantContext = new AsyncLocalStorage<TenantContextValue>();
```

**Step 7:** Implement `run-with-tenant.ts`:

```ts
import { tenantContext, type TenantContextValue } from './tenant-context';

export function runWithTenant<T>(value: TenantContextValue, fn: () => T): T {
  return tenantContext.run(value, fn);
}
```

**Step 8:** Implement `index.ts`:

```ts
export { tenantContext, type TenantContextValue } from './tenant-context';
export { runWithTenant } from './run-with-tenant';
```

**Step 9:** Set up Jest for the package (Nx will generate `jest.config.ts` on first `nx g` invocation). For now, add the bare minimum:

`packages/tenant-context/jest.config.ts`:

```ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};

export default config;
```

Install Jest deps at the workspace root:

```bash
pnpm add -Dw jest ts-jest @types/jest
```

**Step 10:** Run the test. Expected: PASS.

```bash
pnpm --filter @kidscare/tenant-context test
```

**Step 11:** Commit.

```bash
git add .
git commit -m "feat(tenant-context): AsyncLocalStorage wrapper with runWithTenant helper"
```

---

## Task 4: Docker Compose for Postgres + Redis

**Files:**
- Create: `docker-compose.yml`
- Create: `docker/init/01-roles.sql`
- Create: `docker/init/02-extensions.sql`
- Create: `.env.example`

**Step 1:** Create `.env.example` at the workspace root:

```
# Migration role — schema owner, used only by prisma migrate / db push
DATABASE_URL=postgresql://kidscare_migrator:migrator_pw@localhost:5432/kidscare?schema=public

# Normal application role — used by the NestJS app at runtime
DATABASE_APP_URL=postgresql://kidscare_app:app_pw@localhost:5432/kidscare?schema=public

# Login-only role — read by auth module's login handler ONLY (see spec §7.5)
DATABASE_AUTH_LOOKUP_URL=postgresql://kidscare_auth_lookup:auth_pw@localhost:5432/kidscare?schema=public

REDIS_URL=redis://localhost:6379
JWT_SECRET=replace-me
NODE_ENV=development
PORT=3000
```

**Step 2:** Create `docker/init/02-extensions.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

**Step 3:** Create `docker/init/01-roles.sql`. This script runs once on first container start, after Postgres has created the `kidscare` database but before any application tables exist.

```sql
-- 02-extensions.sql runs first; roles must exist before grants apply.

CREATE ROLE kidscare_migrator LOGIN PASSWORD 'migrator_pw';
CREATE ROLE kidscare_app LOGIN PASSWORD 'app_pw';
CREATE ROLE kidscare_auth_lookup LOGIN PASSWORD 'auth_pw';

GRANT CONNECT ON DATABASE kidscare TO kidscare_migrator;
GRANT CONNECT ON DATABASE kidscare TO kidscare_app;
GRANT CONNECT ON DATABASE kidscare TO kidscare_auth_lookup;
```

**Step 4:** Create `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: kidscare-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: kidscare
    ports:
      - '5432:5432'
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./docker/init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: kidscare-redis
    ports:
      - '6379:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
```

**Step 5:** Boot the stack and verify Postgres is healthy.

```bash
pnpm db:up
docker compose ps
```

Expected: both `kidscare-postgres` and `kidscare-redis` show `healthy`.

**Step 6:** Verify the three roles exist.

```bash
docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "\du"
```

Expected output includes `kidscare_migrator`, `kidscare_app`, `kidscare_auth_lookup`.

**Step 7:** Verify RLS plumbing works end-to-end with a manual sanity check (this confirms the role/grant setup is correct before any tables exist):

```bash
docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "GRANT USAGE ON SCHEMA public TO kidscare_app, kidscare_auth_lookup;"
```

Expected: `GRANT`. (Schema-level grants come before table-level grants; we grant `USAGE` here so future tables inherit by default.)

**Step 8:** Commit.

```bash
git add .
git commit -m "feat(infra): docker-compose with Postgres + Redis and three-role separation"
```

---

## Task 5: Create `packages/database` (Prisma Schema Skeleton)

**Files:**
- Create: `packages/database/package.json`
- Create: `packages/database/project.json`
- Create: `packages/database/tsconfig.json`
- Create: `packages/database/jest.config.ts`
- Create: `packages/database/prisma/schema.prisma`
- Modify: `tsconfig.base.json` (add Prisma path if not already present)

**Step 1:** Install Prisma.

```bash
pnpm add -Dw prisma@^5.10.0
```

**Step 2:** Create `packages/database/package.json`:

```json
{
  "name": "@kidscare/database",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "prisma": "prisma",
    "db:seed": "prisma db seed"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.10.0",
    "@kidscare/tenant-context": "workspace:*"
  },
  "devDependencies": {
    "prisma": "^5.10.0",
    "tsx": "^4.7.0"
  }
}
```

**Step 3:** Create `packages/database/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist" },
  "include": ["src/**/*.ts", "prisma/**/*.ts"]
}
```

**Step 4:** Create `packages/database/project.json`:

```json
{
  "name": "database",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "packages/database/src",
  "projectType": "library",
  "targets": {
    "lint": { "executor": "@nx/eslint:lint" },
    "test": { "executor": "@nx/jest:jest", "options": { "jestConfig": "packages/database/jest.config.ts" } },
    "generate": { "executor": "nx:run-commands", "options": { "command": "pnpm prisma generate" } }
  },
  "tags": ["scope:shared"]
}
```

**Step 5:** Create `packages/database/jest.config.ts`:

```ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
};

export default config;
```

**Step 6:** Create the initial schema.

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
  ADMIN
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

  users User[]

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

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, email])
  @@index([tenantId])
  @@map("users")
}
```

**Step 7:** Generate the Prisma client.

```bash
pnpm --filter @kidscare/database prisma generate
```

Expected: client files generated under `packages/database/src/generated/client/`.

**Step 8:** Commit.

```bash
git add .
git commit -m "feat(database): Prisma schema skeleton with Tenant and User models"
```

---

## Task 6: Initial Migration with RLS, FORCE RLS, and Grants

**Files:**
- Create: `packages/database/prisma/migrations/0_init/migration.sql` (Prisma generates the file name; this step covers editing it)

**Step 1:** Apply the migration in dev mode so Prisma writes the SQL for us.

```bash
pnpm --filter @kidscare/database prisma migrate dev --name init
```

This creates `packages/database/prisma/migrations/<timestamp>_init/migration.sql`. Open it.

**Step 2:** Append the RLS and grant statements to the end of the generated `migration.sql`. The Prisma-generated file ends with the `CREATE TABLE` blocks; append after them:

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

**Step 3:** Reset and re-apply the migration to confirm it works clean (this exercises the full path: migrator role creates tables, RLS policies apply, grants execute).

```bash
pnpm db:reset
```

Expected: drop + re-create + migration apply + empty seed, no errors.

**Step 4:** Verify RLS is on and policies exist.

```bash
docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "\d+ tenants"
```

Expected output includes `Row security: enabled, forced` and a `Policies:` section listing `tenant_isolation`.

**Step 5:** Verify grants.

```bash
docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name='users';"
```

Expected: rows for `kidscare_app` with `SELECT/INSERT/UPDATE/DELETE`, and `kidscare_auth_lookup` with `SELECT`.

**Step 6:** Commit.

```bash
git add .
git commit -m "feat(database): add RLS, FORCE RLS, and three-role grants to initial migration"
```

---

## Task 7: Seed Script

**Files:**
- Create: `packages/database/prisma/seed.ts`

**Step 1:** Write the seed.

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

**Step 2:** Install bcrypt.

```bash
pnpm add -Dw bcryptjs @types/bcryptjs
```

**Step 3:** Run the seed.

```bash
pnpm db:seed
```

Expected output: `Seeded tenant demo with id <cuid>`.

**Step 4:** Verify rows exist.

```bash
docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "SELECT slug, name FROM tenants;"
docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "SELECT email, role FROM users;"
```

Expected: one tenant (`demo`) and two users (`admin@demo.test` ADMIN, `teacher@demo.test` TEACHER).

**Step 5:** Run the seed again to confirm idempotency.

```bash
pnpm db:seed
```

Expected: same output, no duplicate-key errors.

**Step 6:** Commit.

```bash
git add .
git commit -m "feat(database): idempotent seed with demo tenant and two users"
```

---

## Task 8: Prisma Tenant Middleware

**Files:**
- Create: `packages/database/src/middleware/tenant.middleware.ts`
- Create: `packages/database/src/middleware/tenant.middleware.spec.ts`
- Create: `packages/database/src/client.ts`
- Create: `packages/database/src/client/auth-lookup-client.ts`
- Create: `packages/database/src/client/auth-lookup-client.spec.ts`
- Create: `packages/database/src/index.ts`

**Step 1:** Write the failing test for the tenant middleware.

`packages/database/src/middleware/tenant.middleware.spec.ts`:

```ts
import { PrismaClient } from '../generated/client';
import { withTenantContext } from './tenant.middleware';
import { runWithTenant } from '@kidscare/tenant-context';

const prisma = new PrismaClient();

describe('withTenantContext', () => {
  beforeAll(async () => {
    await prisma.tenant.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns rows where tenantId matches the context', async () => {
    const a = await prisma.tenant.create({ data: { slug: 'a', name: 'A' } });
    const b = await prisma.tenant.create({ data: { slug: 'b', name: 'B' } });
    await prisma.user.create({
      data: { tenantId: a.id, email: 'a@x', passwordHash: 'x', role: 'ADMIN' },
    });
    await prisma.user.create({
      data: { tenantId: b.id, email: 'b@x', passwordHash: 'x', role: 'ADMIN' },
    });

    const extended = prisma.$extends(withTenantContext({ tenantId: a.id, userId: 'u', role: 'ADMIN' }));
    const rows = await extended.user.findMany();

    expect(rows).toHaveLength(1);
    expect(rows[0]?.email).toBe('a@x');
  });

  it('returns empty when context has no matching tenantId', async () => {
    const extended = prisma.$extends(
      withTenantContext({ tenantId: 'does-not-exist', userId: 'u', role: 'ADMIN' }),
    );
    const rows = await extended.user.findMany();
    expect(rows).toEqual([]);
  });
});
```

**Step 2:** Run the test to confirm it fails.

```bash
pnpm --filter @kidscare/database test
```

Expected: FAIL — `tenant.middleware` not found.

**Step 3:** Implement the middleware.

`packages/database/src/middleware/tenant.middleware.ts`:

```ts
import type { PrismaClient } from '../generated/client';
import type { TenantContextValue } from '@kidscare/tenant-context';

export function withTenantContext(ctx: NonNullable<TenantContextValue>) {
  return PrismaClient.prototype.$extends
    ? null // satisfy typing — actual implementation below
    : null;
}

export const __withTenantContextImpl = Symbol('withTenantContext');

export function withTenantContextExtends(ctx: NonNullable<TenantContextValue>) {
  // The actual implementation: open a tx, SET LOCAL the tenant id, run the query.
  // Prisma's $extends API lets us intercept queries; here we wrap every operation
  // in an interactive transaction that sets the session variable first.
  return {
    name: 'tenantContext',
    query: {
      async $allOperations({ args, query }: any) {
        return prisma.$transaction(async (tx) => {
          await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${ctx.tenantId}'`);
          return query(args);
        });
      },
    },
  };
}
```

Replace with the cleaner, real implementation:

`packages/database/src/middleware/tenant.middleware.ts` (final):

```ts
import { Prisma } from '../generated/client';
import type { TenantContextValue } from '@kidscare/tenant-context';

type Ctx = NonNullable<TenantContextValue>;

export function withTenantContext(ctx: Ctx) {
  return Prisma.defineExtension({
    name: 'tenantContext',
    query: {
      $allOperations: async ({ args, query }) => {
        return Prisma.getExtensionContext(this).$transaction(async (tx) => {
          await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${ctx.tenantId}'`);
          return query(args);
        });
      },
    },
  });
}
```

(`Prisma.defineExtension` requires importing from `@prisma/client/runtime/library`. Adjust the import if the build complains — the principle is the same.)

**Step 4:** Implement the auth-lookup client factory. This is the only place in the codebase where `DATABASE_AUTH_LOOKUP_URL` may be referenced.

`packages/database/src/client/auth-lookup-client.ts`:

```ts
import { PrismaClient } from '../generated/client';

/**
 * Creates a Prisma client bound to the auth-lookup connection.
 *
 * SECURITY: This client connects as the `kidscare_auth_lookup` role, which has
 * column-level SELECT grants on `users` and `tenants` only. It is intended for
 * the auth module's login handler. Importing or instantiating this factory
 * outside `apps/api/src/modules/auth/login.handler.ts` is a security violation.
 */
export function createAuthLookupClient(url: string): PrismaClient {
  return new PrismaClient({ datasources: { db: { url } } });
}
```

**Step 5:** Write the test for the auth-lookup client factory.

`packages/database/src/client/auth-lookup-client.spec.ts`:

```ts
import { createAuthLookupClient } from './auth-lookup-client';

describe('createAuthLookupClient', () => {
  it('returns a PrismaClient instance', () => {
    const client = createAuthLookupClient('postgresql://x:y@localhost:5432/z');
    expect(client).toBeDefined();
    expect(typeof client.$connect).toBe('function');
    void client.$disconnect();
  });
});
```

**Step 6:** Implement the base client re-export and package index.

`packages/database/src/client.ts`:

```ts
export { PrismaClient } from './generated/client';
export * from './generated/client';
```

`packages/database/src/index.ts`:

```ts
export { PrismaClient } from './client';
export { withTenantContext } from './middleware/tenant.middleware';
export { createAuthLookupClient } from './client/auth-lookup-client';
```

**Step 7:** Run all package tests.

```bash
pnpm --filter @kidscare/database test
```

Expected: PASS for both spec files.

**Step 8:** Commit.

```bash
git add .
git commit -m "feat(database): tenant context middleware and auth-lookup client factory"
```

---

## Task 9: `apps/api` NestJS Skeleton

**Files:**
- Create: `apps/api/project.json`
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/tsconfig.app.json`
- Create: `apps/api/nest-cli.json`
- Create: `apps/api/jest.config.ts`
- Create: `apps/api/src/main.ts`
- Create: `apps/api/src/app.module.ts`
- Create: `apps/api/src/health/health.module.ts`
- Create: `apps/api/src/health/health.controller.ts`
- Create: `apps/api/src/health/health.controller.spec.ts`
- Create: `apps/api/src/common/context/tenant-context.module.ts`
- Create: `apps/api/src/common/context/tenant-context.middleware.ts`
- Create: `apps/api/src/common/guards/tenant.guard.ts`
- Create: `apps/api/src/common/decorators/public.decorator.ts`
- Create: `apps/api/src/prisma/prisma.module.ts`
- Create: `apps/api/src/prisma/prisma.service.ts`

**Step 1:** Install NestJS deps.

```bash
pnpm add -Dw @nx/nest@^19.0.0 @nestjs/core@^10.0.0 @nestjs/common@^10.0.0 @nestjs/platform-express@^10.0.0 @nestjs/config@^3.0.0 reflect-metadata rxjs
pnpm add -Dw @nestjs/testing@^10.0.0 @types/express @types/supertest supertest
```

**Step 2:** Create `apps/api/package.json`:

```json
{
  "name": "@kidscare/api",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "start:dev": "nest start --watch",
    "start": "nest start",
    "test": "jest",
    "test:integration": "jest --config jest.config.integration.ts --runInBand"
  },
  "dependencies": {
    "@kidscare/database": "workspace:*",
    "@kidscare/tenant-context": "workspace:*",
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "reflect-metadata": "^0.2.0",
    "rxjs": "^7.8.0"
  }
}
```

**Step 3:** Create `apps/api/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2022",
    "outDir": "dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 4:** Create `apps/api/project.json`:

```json
{
  "name": "api",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/api/src",
  "projectType": "application",
  "targets": {
    "serve": { "executor": "@nx/node:node", "options": { "buildTarget": "build" } },
    "build": { "executor": "@nx/node:webpack", "options": { "outputPath": "dist/apps/api" } },
    "lint": { "executor": "@nx/eslint:lint" },
    "test": { "executor": "@nx/jest:jest", "options": { "jestConfig": "apps/api/jest.config.ts" } }
  },
  "tags": ["scope:api"]
}
```

**Step 5:** Create `apps/api/jest.config.ts`:

```ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  moduleDirectories: ['node_modules', '../../node_modules'],
};

export default config;
```

**Step 6:** Implement the public decorator.

`apps/api/src/common/decorators/public.decorator.ts`:

```ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Step 7:** Implement the tenant guard.

`apps/api/src/common/guards/tenant.guard.ts`:

```ts
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { tenantContext } from '@kidscare/tenant-context';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const store = tenantContext.getStore();
    if (!store) throw new ForbiddenException('Missing tenant context');
    return true;
  }
}
```

**Step 8:** Implement the tenant-context middleware.

`apps/api/src/common/context/tenant-context.middleware.ts`:

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { runWithTenant, type TenantContextValue } from '@kidscare/tenant-context';
import type { Request, Response, NextFunction } from 'express';

/**
 * Parses the request headers into a TenantContextValue and runs the rest of
 * the request inside that context.
 *
 * Sub-project #1 placeholder: in dev (NODE_ENV !== 'production') we accept
 * `x-tenant-id` and `x-user-id` and `x-role` headers directly. Sub-project #2
 * replaces this with a JWT parser.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const value: TenantContextValue =
      process.env.NODE_ENV === 'production'
        ? null
        : {
            tenantId: (req.headers['x-tenant-id'] as string | undefined) ?? '',
            userId: (req.headers['x-user-id'] as string | undefined) ?? '',
            role: ((req.headers['x-role'] as string | undefined) ?? 'TEACHER') as
              | 'ADMIN'
              | 'TEACHER'
              | 'PARENT',
          };

    if (!value.tenantId || !value.userId) {
      next();
      return;
    }
    runWithTenant(value, () => next());
  }
}
```

**Step 9:** Implement the tenant-context module.

`apps/api/src/common/context/tenant-context.module.ts`:

```ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TenantContextMiddleware } from './tenant-context.middleware';

@Module({})
export class TenantContextModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}
```

**Step 10:** Implement the Prisma service.

`apps/api/src/prisma/prisma.service.ts`:

```ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@kidscare/database';
import { tenantContext } from '@kidscare/tenant-context';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: { url: config.getOrThrow<string>('DATABASE_APP_URL') },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Returns a Prisma client extended with the current tenant context.
   * Use this from services; never call `this.user.findMany()` directly.
   */
  forTenant(): PrismaClient {
    const ctx = tenantContext.getStore();
    if (!ctx) throw new Error('No tenant context — call from inside a tenant-scoped request');
    return this.$extends({
      query: {
        $allOperations: async ({ args, query }) => {
          return this.$transaction(async (tx) => {
            await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${ctx.tenantId}'`);
            return query(args);
          });
        },
      },
    }) as unknown as PrismaClient;
  }
}
```

**Step 11:** Implement the Prisma module.

`apps/api/src/prisma/prisma.module.ts`:

```ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**Step 12:** Implement the health controller.

`apps/api/src/health/health.controller.ts`:

```ts
import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
```

`apps/api/src/health/health.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({ controllers: [HealthController] })
export class HealthModule {}
```

**Step 13:** Implement the app module.

`apps/api/src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { TenantContextModule } from './common/context/tenant-context.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantGuard } from './common/guards/tenant.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TenantContextModule,
    PrismaModule,
    HealthModule,
  ],
  providers: [
    Reflector,
    { provide: APP_GUARD, useClass: TenantGuard },
  ],
})
export class AppModule {}
```

**Step 14:** Implement `main.ts`.

`apps/api/src/main.ts`:

```ts
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: ['http://localhost:5173', 'http://localhost:3001'] });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}

bootstrap();
```

**Step 15:** Build to confirm everything compiles.

```bash
pnpm exec nx build api
```

Expected: build succeeds.

**Step 16:** Commit.

```bash
git add .
git commit -m "feat(api): NestJS skeleton with health endpoint and tenant guard"
```

---

## Task 10: Health Controller Unit Test

**Files:**
- Create: `apps/api/src/health/health.controller.spec.ts`

**Step 1:** Write the failing test.

`apps/api/src/health/health.controller.spec.ts`:

```ts
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns { status: "ok" }', () => {
    const controller = new HealthController();
    expect(controller.check()).toEqual({ status: 'ok' });
  });
});
```

**Step 2:** Run the test.

```bash
pnpm --filter @kidscare/api test
```

Expected: PASS (the controller already exists from Task 9).

**Step 3:** Commit the test.

```bash
git add .
git commit -m "test(api): health controller returns ok"
```

---

## Task 11: Tenant Isolation Integration Test

**Files:**
- Create: `apps/api/jest.config.integration.ts`
- Create: `apps/api/test/setup-integration-db.ts`
- Create: `apps/api/test/tenant-isolation.spec.ts`

**Step 1:** Configure a separate Jest config for integration tests.

`apps/api/jest.config.integration.ts`:

```ts
import type { Config } from 'jest';
import baseConfig from './jest.config';

const config: Config = {
  ...baseConfig,
  testRegex: '.*\\.integration\\.spec\\.ts$|apps/api/test/.*\\.spec\\.ts$',
  testTimeout: 30000,
  setupFilesAfterEach: ['<rootDir>/test/setup-integration-db.ts'],
};

export default config;
```

**Step 2:** Add the integration test setup script.

`apps/api/test/setup-integration-db.ts`:

```ts
import { PrismaClient } from '@kidscare/database';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL ?? '' } },
});

beforeEach(async () => {
  // Truncate in dependency order. Cascade would also work but explicit is safer.
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

export {};
```

**Step 3:** Write the integration test.

`apps/api/test/tenant-isolation.spec.ts`:

```ts
import { PrismaClient } from '@kidscare/database';
import { runWithTenant } from '@kidscare/tenant-context';
import { createAuthLookupClient } from '@kidscare/database';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL ?? '' } },
});

async function seedTwoTenants() {
  const a = await prisma.tenant.create({ data: { slug: 'a', name: 'A' } });
  const b = await prisma.tenant.create({ data: { slug: 'b', name: 'B' } });
  const hash = await bcrypt.hash('x', 4);
  await prisma.user.create({
    data: { tenantId: a.id, email: 'a@x', passwordHash: hash, role: 'ADMIN' },
  });
  await prisma.user.create({
    data: { tenantId: b.id, email: 'b@x', passwordHash: hash, role: 'ADMIN' },
  });
  return { a, b };
}

describe('tenant isolation (RLS + AsyncLocalStorage)', () => {
  it('within-tenant read returns only that tenant\'s rows', async () => {
    const { a } = await seedTwoTenants();
    let rows: { email: string }[] = [];
    await runWithTenant(
      { tenantId: a.id, userId: 'u', role: 'ADMIN' },
      async () => {
        const tx = prisma.$extends({
          query: {
            $allOperations: async ({ args, query }) =>
              prisma.$transaction(async (txInner) => {
                await txInner.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${a.id}'`);
                return query(args);
              }),
          },
        });
        rows = await tx.user.findMany({ select: { email: true } });
      },
    );
    expect(rows.map((r) => r.email)).toEqual(['a@x']);
  });

  it('cross-tenant read returns empty', async () => {
    const { a, b } = await seedTwoTenants();
    let rows: { email: string }[] = [];
    await runWithTenant(
      { tenantId: a.id, userId: 'u', role: 'ADMIN' },
      async () => {
        const tx = prisma.$extends({
          query: {
            $allOperations: async ({ args, query }) =>
              prisma.$transaction(async (txInner) => {
                await txInner.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${a.id}'`);
                return query(args);
              }),
          },
        });
        // Try to read user from tenant B by id — must be blocked.
        rows = await tx.user.findMany({ where: { tenantId: b.id }, select: { email: true } });
      },
    );
    expect(rows).toEqual([]);
  });

  it('login lookup via auth-lookup connection finds cross-tenant user', async () => {
    const { a } = await seedTwoTenants();
    const lookup = createAuthLookupClient(process.env.DATABASE_AUTH_LOOKUP_URL ?? '');
    try {
      const user = await lookup.user.findFirst({ where: { email: 'a@x' } });
      expect(user?.tenantId).toBe(a.id);
    } finally {
      await lookup.$disconnect();
    }
  });

  it('auth-lookup role cannot INSERT into users', async () => {
    const lookup = createAuthLookupClient(process.env.DATABASE_AUTH_LOOKUP_URL ?? '');
    try {
      await expect(
        lookup.user.create({
          data: { tenantId: 'x', email: 'evil@x', passwordHash: 'x', role: 'ADMIN' },
        }),
      ).rejects.toThrow();
    } finally {
      await lookup.$disconnect();
    }
  });
});
```

**Step 4:** Run the integration test.

```bash
pnpm test:integration
```

Expected: all 4 cases PASS.

**Step 5:** Commit.

```bash
git add .
git commit -m "test(api): tenant isolation integration test for RLS + AsyncLocalStorage"
```

---

## Task 12: `apps/admin-web` (Vite + React) Skeleton

**Files:**
- Create: `apps/admin-web/project.json`
- Create: `apps/admin-web/package.json`
- Create: `apps/admin-web/tsconfig.json`
- Create: `apps/admin-web/vite.config.ts`
- Create: `apps/admin-web/index.html`
- Create: `apps/admin-web/src/main.tsx`
- Create: `apps/admin-web/src/App.tsx`
- Create: `apps/admin-web/src/App.test.tsx`

**Step 1:** Install Vite + React deps.

```bash
pnpm add -Dw vite@^5.0.0 @vitejs/plugin-react@^4.0.0 react@^18.0.0 react-dom@^18.0.0 @types/react @types/react-dom
pnpm add -Dw vitest@^1.0.0 @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

**Step 2:** Create `apps/admin-web/package.json`:

```json
{
  "name": "@kidscare/admin-web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

**Step 3:** Create `apps/admin-web/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"]
}
```

**Step 4:** Create `apps/admin-web/vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.ts'] },
});
```

**Step 5:** Create `apps/admin-web/src/test-setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

**Step 6:** Create `apps/admin-web/src/App.tsx`:

```tsx
export function App() {
  return (
    <main>
      <h1>KidsCare Admin</h1>
      <p>Login, tenant management, and student records will land here.</p>
    </main>
  );
}
```

**Step 7:** Create `apps/admin-web/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

**Step 8:** Create `apps/admin-web/index.html`:

```html
<!doctype html>
<html lang="tr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KidsCare Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 9:** Create `apps/admin-web/src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders the heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /kidscare admin/i })).toBeInTheDocument();
  });
});
```

**Step 10:** Create `apps/admin-web/project.json`:

```json
{
  "name": "admin-web",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/admin-web/src",
  "projectType": "application",
  "targets": {
    "dev": { "executor": "@nx/vite:dev-server", "options": { "buildTarget": "build" } },
    "build": { "executor": "@nx/vite:build", "options": { "outputPath": "dist/apps/admin-web" } },
    "lint": { "executor": "@nx/eslint:lint" },
    "test": { "executor": "@nx/vite:test" }
  },
  "tags": ["scope:web"]
}
```

**Step 11:** Run the test.

```bash
pnpm --filter @kidscare/admin-web test
```

Expected: PASS.

**Step 12:** Commit.

```bash
git add .
git commit -m "feat(admin-web): Vite + React skeleton with placeholder landing"
```

---

## Task 13: `apps/marketing` (Next.js) Skeleton

**Files:**
- Create: `apps/marketing/project.json`
- Create: `apps/marketing/package.json`
- Create: `apps/marketing/tsconfig.json`
- Create: `apps/marketing/next.config.mjs`
- Create: `apps/marketing/app/layout.tsx`
- Create: `apps/marketing/app/page.tsx`

**Step 1:** Install Next.js.

```bash
pnpm add -Dw next@^14.0.0 react@^18.0.0 react-dom@^18.0.0 @types/react @types/react-dom
```

**Step 2:** Create `apps/marketing/package.json`:

```json
{
  "name": "@kidscare/marketing",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

**Step 3:** Create `apps/marketing/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Step 4:** Create `apps/marketing/next.config.mjs`:

```js
/** @type {import('next').NextConfig} */
const config = {};
export default config;
```

**Step 5:** Create `apps/marketing/app/layout.tsx`:

```tsx
import type { ReactNode } from 'react';

export const metadata = {
  title: 'KidsCare',
  description: 'Çocuğunuzun kreş günü, tek bir uygulamada.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
```

**Step 6:** Create `apps/marketing/app/page.tsx`:

```tsx
export default function Home() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: '4rem 2rem', maxWidth: 720, margin: '0 auto' }}>
      <h1>KidsCare</h1>
      <p>Çocuğunuzun kreş günü, tek bir uygulamada.</p>
    </main>
  );
}
```

**Step 7:** Create `apps/marketing/project.json`:

```json
{
  "name": "marketing",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/marketing",
  "projectType": "application",
  "targets": {
    "dev": { "executor": "@nx/next:dev", "options": { "port": 3001 } },
    "build": { "executor": "@nx/next:build", "options": { "outputPath": "dist/apps/marketing" } },
    "lint": { "executor": "@nx/eslint:lint" }
  },
  "tags": ["scope:web"]
}
```

**Step 8:** Build to confirm.

```bash
pnpm exec nx build marketing
```

Expected: build succeeds.

**Step 9:** Commit.

```bash
git add .
git commit -m "feat(marketing): Next.js skeleton with placeholder landing"
```

---

## Task 14: `apps/mobile` (Expo) Skeleton

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/App.tsx`
- Create: `apps/mobile/babel.config.js`
- Create: `apps/mobile/.gitignore` (overlay — Expo needs its own ignore rules)

**Step 1:** Create `apps/mobile/package.json`:

```json
{
  "name": "@kidscare/mobile",
  "version": "0.0.0",
  "private": true,
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-status-bar": "~1.12.0",
    "react": "18.2.0",
    "react-native": "0.74.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.0",
    "typescript": "^5.4.0"
  }
}
```

**Step 2:** Create `apps/mobile/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-native",
    "moduleResolution": "node",
    "noEmit": true,
    "types": ["react-native"]
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

**Step 3:** Create `apps/mobile/babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

**Step 4:** Create `apps/mobile/app.json`:

```json
{
  "expo": {
    "name": "KidsCare",
    "slug": "kidscare",
    "version": "0.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "newArchEnabled": false,
    "ios": { "supportsTablet": true, "bundleIdentifier": "com.kidscare.app" },
    "android": { "package": "com.kidscare.app" }
  }
}
```

**Step 5:** Create `apps/mobile/App.tsx`:

```tsx
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>KidsCare</Text>
      <StatusBar style="auto" />
    </View>
  );
}
```

**Step 6:** Add an overlay `.gitignore` for Expo's generated directories:

`apps/mobile/.gitignore`:

```
node_modules/
.expo/
dist/
ios/
android/
```

**Step 7:** Verify the app boots (does not require a device; Expo CLI will print a QR code and confirm the bundle compiles).

```bash
pnpm --filter @kidscare/mobile start --no-dev --minify
```

Expected: bundle compiles without TypeScript errors. Press `Ctrl+C` to stop after the first successful bundle.

**Step 8:** Commit.

```bash
git add .
git commit -m "feat(mobile): Expo skeleton with placeholder screen"
```

---

## Task 15: `packages/shared-types` and `packages/shared-schemas`

**Files:**
- Create: `packages/shared-types/package.json`
- Create: `packages/shared-types/tsconfig.json`
- Create: `packages/shared-types/src/tenant.ts`
- Create: `packages/shared-types/src/user.ts`
- Create: `packages/shared-types/src/index.ts`
- Create: `packages/shared-schemas/package.json`
- Create: `packages/shared-schemas/tsconfig.json`
- Create: `packages/shared-schemas/src/tenant.schema.ts`
- Create: `packages/shared-schemas/src/user.schema.ts`
- Create: `packages/shared-schemas/src/index.ts`
- Create: `packages/shared-schemas/src/tenant.schema.spec.ts`

**Step 1:** Install Zod.

```bash
pnpm add -Dw zod@^3.22.0
```

**Step 2:** Create `packages/shared-types/package.json`:

```json
{
  "name": "@kidscare/shared-types",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

**Step 3:** Create `packages/shared-types/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist" },
  "include": ["src/**/*.ts"]
}
```

**Step 4:** Create `packages/shared-types/src/tenant.ts`:

```ts
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
};

export type TenantSummary = Pick<Tenant, 'id' | 'slug' | 'name'>;
```

**Step 5:** Create `packages/shared-types/src/user.ts`:

```ts
export type UserRole = 'ADMIN' | 'TEACHER' | 'PARENT';

export type User = {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};
```

**Step 6:** Create `packages/shared-types/src/index.ts`:

```ts
export * from './tenant';
export * from './user';
```

**Step 7:** Create `packages/shared-schemas/package.json`:

```json
{
  "name": "@kidscare/shared-schemas",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "@kidscare/shared-types": "workspace:*",
    "zod": "^3.22.0"
  }
}
```

**Step 8:** Create `packages/shared-schemas/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist" },
  "include": ["src/**/*.ts"]
}
```

**Step 9:** Create the test first.

`packages/shared-schemas/src/tenant.schema.spec.ts`:

```ts
import { tenantInputSchema } from './tenant.schema';

describe('tenantInputSchema', () => {
  it('accepts a valid slug and name', () => {
    expect(() =>
      tenantInputSchema.parse({ slug: 'demo-kres', name: 'Demo Kreş' }),
    ).not.toThrow();
  });

  it('rejects a slug with uppercase letters', () => {
    expect(() =>
      tenantInputSchema.parse({ slug: 'Demo-Kres', name: 'Demo Kreş' }),
    ).toThrow();
  });

  it('rejects a name shorter than 2 chars', () => {
    expect(() =>
      tenantInputSchema.parse({ slug: 'demo', name: 'D' }),
    ).toThrow();
  });
});
```

**Step 10:** Implement the tenant schema.

`packages/shared-schemas/src/tenant.schema.ts`:

```ts
import { z } from 'zod';

export const tenantInputSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(128),
});

export type TenantInput = z.infer<typeof tenantInputSchema>;
```

**Step 11:** Create the user schema.

`packages/shared-schemas/src/user.schema.ts`:

```ts
import { z } from 'zod';

export const userRoleSchema = z.enum(['ADMIN', 'TEACHER', 'PARENT']);

export const userCreateSchema = z.object({
  tenantId: z.string().cuid(),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: userRoleSchema,
});

export type UserCreate = z.infer<typeof userCreateSchema>;
```

**Step 12:** Create the shared-schemas barrel.

`packages/shared-schemas/src/index.ts`:

```ts
export * from './tenant.schema';
export * from './user.schema';
```

**Step 13:** Run the test.

```bash
pnpm --filter @kidscare/shared-schemas test
```

Expected: PASS (after configuring Jest for the package — mirror Task 3 Step 9's `jest.config.ts`).

**Step 14:** Commit.

```bash
git add .
git commit -m "feat(shared): shared-types and shared-schemas with Tenant and User"
```

---

## Task 16: README + End-to-End Verification

**Files:**
- Create: `README.md`

**Step 1:** Write the README.

`README.md`:

````markdown
# KidsCare

Çoklu kreşe satılabilir multi-tenant SaaS. Mimari kararlar: `kres-uygulamasi-teknoloji-karar-raporu.md`. Proje kuralları: `CLAUDE.md`. Sub-project #1 (altyapı) tasarımı: `docs/superpowers/specs/2026-09-13-infrastructure-layer-design.md`.

## Gereksinimler

- Node 20 LTS
- pnpm 9+
- Docker Desktop (Windows: WSL2 backend önerilir)

## Yerel geliştirme

```bash
pnpm install
pnpm db:up                  # Postgres + Redis ayağa kalkar
cp .env.example .env        # gerekirse düzenle
pnpm db:migrate             # tabloları ve RLS politikalarını uygular
pnpm db:seed                # demo tenant + 2 kullanıcı
pnpm dev:api                # NestJS API (port 3000)
pnpm dev:admin              # admin paneli (port 5173)
pnpm dev:marketing          # pazarlama sitesi (port 3001)
pnpm dev:mobile             # Expo (QR kod ile telefondan açılır)
```

## Test

```bash
pnpm test                   # tüm birim testleri
pnpm test:integration       # tenant izolasyon integration testi
pnpm lint                   # ESLint
```

## Mimari notlar

- Üç Postgres rolü vardır: `kidscare_migrator` (DDL), `kidscare_app` (uygulama runtime), `kidscare_auth_lookup` (yalnızca login). `DATABASE_AUTH_LOOKUP_URL`'i yalnızca auth modülünün login handler'ı okuyabilir.
- Tenant izolasyonu Postgres RLS + AsyncLocalStorage + Prisma middleware ile uygulanır. Üç katman birlikte çalışır; biri tek başına yeterli değildir.
- Migration'lar atomiktir: yeni tenant-scoped tablo, RLS politikası ve `GRANT` aynı SQL dosyasında bulunur.
````

**Step 2:** Run the full acceptance check.

```bash
pnpm install
pnpm db:up
sleep 5
pnpm db:migrate
pnpm db:seed
pnpm dev:api &
sleep 5
curl http://localhost:3000/health
```

Expected: `{"status":"ok"}`.

```bash
kill %1
```

**Step 3:** Run the integration test one more time to confirm.

```bash
pnpm test:integration
```

Expected: all 4 cases PASS.

**Step 4:** Run lint.

```bash
pnpm lint
```

Expected: no errors.

**Step 5:** Commit.

```bash
git add .
git commit -m "docs: README with local setup and architectural notes"
```

---

## Spec Coverage Check

Running the writing-plans self-review against the spec:

| Spec section | Covered by |
|---|---|
| §3 Architecture overview | Implicit — workspace layout created in Tasks 1, 5, 12–15 |
| §4 Repository layout | Tasks 1, 3, 5, 9, 12, 13, 14, 15 |
| §5 Tech stack | Tasks 1, 9, 12, 13, 14 |
| §6 DB schema + RLS + 3-role | Tasks 5, 6, 7 |
| §7.1 AsyncLocalStorage context | Task 3 |
| §7.2 NestJS middleware + guard + @Public | Task 9 |
| §7.3 Prisma middleware | Task 8 |
| §7.4 Request lifecycle | Implicit — wired through Tasks 9 + 11 |
| §7.5 Auth Lookup Connection | Tasks 6 (grants), 8 (factory) |
| §8 App skeletons | Tasks 9, 12, 13, 14 |
| §9 tsconfig + ESLint + Prettier + Husky | Task 2 |
| §10 Testing (Jest + tenant-isolation integration) | Tasks 10, 11 |
| §11 Environment & Secrets (.env.example, three URLs) | Task 4 |
| §12 Acceptance criteria 1–12 | Task 16 verification step |
| §13 Risks (mitigations) | Distributed across tasks (Docker roles in Task 4, Expo in Task 14, generated client committed in Task 5, etc.) |
| §14 Out of scope | Confirmed — no auth, no feature modules |

No gaps found.

---

## Ready to Execute

Plan complete and saved to `docs/superpowers/plans/2026-09-13-infrastructure-layer.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
