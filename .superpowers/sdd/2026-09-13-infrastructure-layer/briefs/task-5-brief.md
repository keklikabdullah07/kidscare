# Task 5 Brief — Create `packages/database` (Prisma Schema Skeleton)

## Context (1 line)

Task 5 of 16 — after Tasks 1-4 set up the workspace, lint/format tooling, `tenant-context` package, and the Postgres+Redis docker stack; this task creates the `packages/database` workspace, defines the Prisma schema with `Tenant` and `User` models (no tables created yet — Task 6 runs the migration), and generates the Prisma client.

## Files to create

- `packages/database/eslint.config.mjs` (fixes M3.5 lint gap)
- `packages/database/package.json`
- `packages/database/tsconfig.json`
- `packages/database/project.json`
- `packages/database/jest.config.ts`
- `packages/database/prisma/schema.prisma`

## Steps (verbatim from the plan, follow exactly)

**Step 1:** Install Prisma at the workspace root (dev deps). Use `-Dw`:

```bash
cd C:\Users\Partridge\Desktop\KidsCare
pnpm add -Dw prisma@^5.10.0
```

If pnpm complains about peer-dep mismatch with `nx@19`, that's pre-existing — proceed.

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
    "test": {
      "executor": "@nx/jest:jest",
      "options": { "jestConfig": "packages/database/jest.config.ts" }
    },
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

**Step 6:** Create `packages/database/eslint.config.mjs` (M3.5 fix — required so `nx lint database` resolves). This file re-exports the root config so package-level lint inherits workspace rules:

```js
import rootConfig from '../../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    ignores: ['src/generated/**', 'prisma/migrations/**'],
  },
];
```

**Step 7:** Create the initial schema.

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

**Step 8:** Generate the Prisma client. The `DATABASE_URL` env var must be set; create a temporary `.env` for this step by copying `.env.example` to `.env` (gitignored).

```bash
cp .env.example .env
pnpm --filter @kidscare/database prisma generate
```

Expected: client files generated under `packages/database/src/generated/client/`. List the directory to confirm.

If `prisma generate` errors with "Environment variable not found: DATABASE_URL", the `.env` file wasn't picked up — verify it exists at the workspace root and contains `DATABASE_URL=...`.

**Step 9:** Commit.

```bash
git add packages/database package.json pnpm-lock.yaml
git commit -m "feat(database): Prisma schema skeleton with Tenant and User models"
```

Do NOT stage `.env` (gitignored).

## Constraints (binding)

- Generator `output` must be `../src/generated/client` — this is the deterministic path. Do not use the default `node_modules/.prisma/client` output.
- Per Global Constraints, generated client is committed. Verify `packages/database/src/generated/client/` files appear in `git status` before committing. If `.gitignore` excludes them, override — we commit them by policy.
- The two `enum` declarations (`UserRole`, `TenantStatus`) must be PascalCase; values must be SCREAMING_SNAKE_CASE.
- `Tenant.status` is `TenantStatus @default(ACTIVE)` — NOT a plain String.
- `User.tenantId` is non-nullable `String` (no comment about "null only for global/system users" — that comment was removed per spec review).
- `User.@@unique([tenantId, email])` enforces email uniqueness per tenant.
- `User.@@index([tenantId])` speeds up the RLS hot path.
- ESLint config in `packages/database/eslint.config.mjs` ignores the generated client and migrations directory (those are machine-generated, not human source).
- The `.env` file created in Step 8 is gitignored and local-only. Do NOT commit it. If it accidentally gets staged, `git reset HEAD .env` and continue.

## Report contract

Append to `.superpowers/sdd/2026-09-13-infrastructure-layer/reports/task-5-report.md`:

```
## Status
DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## One-line summary
<what you actually did>

## Test evidence
<output of `pnpm --filter @kidscare/database prisma generate` and `ls packages/database/src/generated/client/`>

## Self-review
- <anything you noticed>

## Commits
<commit hash>
```

Return ONLY: status, one-line summary, commit hash.
