=== git log (commits in task range) ===
716e83a chore: initialise Nx workspace with pnpm

=== git diff --stat ===
.claude/skills/kidscare-architecture/SKILL.md | 74 +
.claude/skills/kidscare-multi-tenancy/SKILL.md | 76 +
.claude/skills/kidscare-naming-rules/SKILL.md | 124 +
.claude/skills/kidscare-prisma-database/SKILL.md | 131 ++
.claude/skills/kidscare-shared-packages/SKILL.md | 132 ++
.claude/skills/kidscare-solid-modules/SKILL.md | 140 ++
.claude/skills/kidscare-testing/SKILL.md | 92 +
.gitattributes | 4 +
.gitignore | 11 +
.../briefs/task-1-brief.md | 142 ++
.../2026-09-13-infrastructure-layer/progress.md | 29 +
.../reports/task-1-report.md | 27 +
CLAUDE.md | 69 +
.../plans/2026-09-13-infrastructure-layer.md | 2378 ++++++++++++++++++++
.../2026-09-13-infrastructure-layer-design.md | 586 +++++
.../2026-09-13-infrastructure-layer-design.tr.md | 586 +++++
kres-uygulamasi-teknoloji-karar-raporu.md | 116 +
nx.json | 11 +
package.json | 28 +
pnpm-lock.yaml | 1133 ++++++++++
pnpm-workspace.yaml | 3 +
21 files changed, 5892 insertions(+)

=== git diff -U10 ===
diff --git a/.claude/skills/kidscare-architecture/SKILL.md b/.claude/skills/kidscare-architecture/SKILL.md
new file mode 100644
index 0000000..517f46c
--- /dev/null
+++ b/.claude/skills/kidscare-architecture/SKILL.md
@@ -0,0 +1,74 @@
+---
+name: kidscare-architecture
+description: Use when working on the KidsCare codebase to understand the monorepo layout, where each concern lives, and the dependency graph between apps and packages. Load before any task that touches more than one workspace project.
+--- +
+# KidsCare — Architecture Reference +
+## Monorepo Layout +
+Nx workspace, pnpm. Every workspace project is a Node package; `apps/*` are deployable, `packages/*` are consumed by apps and by each other. + +`
+kidscare/
+├── apps/
+│   ├── api/          NestJS 10 backend, multi-tenant
+│   ├── admin-web/    React + Vite SPA (teacher + tenant admin)
+│   ├── marketing/    Next.js 14 public site
+│   └── mobile/       Expo SDK 51, React Native
+├── packages/
+│   ├── database/           Prisma schema + generated client + tenant middleware
+│   ├── tenant-context/     AsyncLocalStorage wrapper, framework-agnostic
+│   ├── shared-types/       DTO/interface contracts
+│   └── shared-schemas/     Zod validation schemas
+├── docker-compose.yml      Postgres + Redis
+└── nx.json
+` + +`apps/mobile` keeps Expo's standalone `package.json` (not Nx `project.json`) because Expo's CLI owns the build pipeline. Nx is responsible only for the dependency graph, not for building the mobile bundle. +
+## Dependency Direction +
+Strict acyclic graph. Edges go from app to package, never app-to-app, and packages depend on each other in this order only: + +`
+apps/*  →  shared-schemas, shared-types, database, tenant-context
+database  →  tenant-context
+shared-schemas  →  shared-types
+` +
+Reverse edges are not allowed. If you find yourself wanting `apps/api` to import from `apps/admin-web`, the shared concern belongs in a package. +
+## Where Each Concern Lives +
+| Concern | Lives in |
+|---|---|
+| HTTP endpoints, request/response shape | `apps/api/src/modules/<domain>/controllers/` |
+| Domain logic | `apps/api/src/modules/<domain>/services/` |
+| Persistence (SQL/Prisma) | `apps/api/src/modules/<domain>/repositories/` |
+| Validation rules shared with frontend | `packages/shared-schemas/` |
+| TypeScript types shared across stack | `packages/shared-types/` |
+| Database schema, migrations, seed | `packages/database/prisma/` |
+| Tenant context propagation | `packages/tenant-context/` |
+| React Native screens | `apps/mobile/app/` |
+| Admin SPA screens | `apps/admin-web/src/routes/` |
+| Marketing pages | `apps/marketing/app/` | +
+If a concern does not have a clear home in this table, stop and ask the user before creating a new location. +
+## Module Boundary Within `apps/api` +
+A domain module (`students`, `payments`, `tenants`, etc.) owns its own controllers, services, repositories, DTOs, entities, and tests. It may not reach into another module's repository. Cross-module coordination goes through the other module's service, with an explicit interface dependency if the consumer needs testability. +
+A module's `*.module.ts` registers its controllers and providers with NestJS DI. Providers that need configuration use `ConfigService` — never `process.env` directly. +
+## What This Skill Does Not Cover +
+- Module template (controller/service/repo file structure) → `kidscare-solid-modules`
+- Database schema, migrations, RLS SQL → `kidscare-prisma-database`
+- Tenant isolation rules → `kidscare-multi-tenancy`
+- Naming conventions → `kidscare-naming-rules`
+- Test structure → `kidscare-testing`
+- Shared package usage → `kidscare-shared-packages` +
+If a question falls into one of those areas, load the relevant skill instead of guessing.
diff --git a/.claude/skills/kidscare-multi-tenancy/SKILL.md b/.claude/skills/kidscare-multi-tenancy/SKILL.md
new file mode 100644
index 0000000..4383e81
--- /dev/null
+++ b/.claude/skills/kidscare-multi-tenancy/SKILL.md
@@ -0,0 +1,76 @@
+---
+name: kidscare-multi-tenancy
+description: Use whenever a request touches tenant-scoped data — adding a new module, writing a repository, designing an endpoint, or reviewing auth. Covers Postgres RLS, AsyncLocalStorage context, the three-role separation, and the guard usage. Load before any code change in apps/api that reads or writes a table.
+--- +
+# KidsCare — Multi-Tenancy Rules +
+## Why This Is the Hardest Rule in the Project +
+The product handles children's personal data (Öğrenci Pasaportu: kan grubu, alerjiler, sağlık notları). A single missing tenant filter leaks one tenant's children to another tenant's staff. The defence is layered: Postgres Row-Level Security at the database, AsyncLocalStorage at the application boundary, a NestJS guard at the controller boundary. Each layer alone is insufficient; all three together are the contract. +
+## Layer 1 — Database (Postgres RLS) +
+Every tenant-scoped table has `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY` set in the migration. `FORCE` is mandatory — without it, the table owner role bypasses policies and a misconfigured connection becomes a data breach. +
+The policy uses `current_setting('app.tenant_id', true)` and matches on the table's `tenantId` column. The `true` second argument returns `NULL` instead of erroring when the setting is absent, which is how login-time lookups (with no tenant yet) work. +
+RLS does not protect columns. A `SELECT *` from a tenant-scoped table still returns every column of the visible rows. Column-level protection is a separate concern, applied only to the `kidscare_auth_lookup` role for the login flow. +
+Tables that are not tenant-scoped (none in MVP, but reserved for future global config tables) must not have RLS enabled and must be the only tables the `kidscare_app` role can read without a tenant context set. +
+## Layer 2 — Three Postgres Roles +
+Each role has the minimum privilege required for its purpose. No role is granted `BYPASSRLS`. +
+| Role | Purpose | Connects via | Privileges |
+|---|---|---|---|
+| `kidscare_migrator` | Schema owner, runs `prisma migrate` and `prisma db push` | `DATABASE_URL` | DDL, full CRUD on all tables |
+| `kidscare_app` | Normal application runtime | `DATABASE_APP_URL` | `SELECT/INSERT/UPDATE/DELETE` on all tenant-scoped tables; subject to FORCE RLS |
+| `kidscare_auth_lookup` | Login lookup only | `DATABASE_AUTH_LOOKUP_URL` | `SELECT` on specific columns of `users` and `tenants` only; subject to FORCE RLS | +
+Roles are created in `docker-compose.yml`'s init script (`init/01-roles.sql`) on first container start. Passwords come from a Compose-managed secret file, not from `.env`. +
+The Prisma CLI connects as `kidscare_migrator` via `DATABASE_URL`. The NestJS `PrismaModule` connects as `kidscare_app` via `DATABASE_APP_URL`. The login handler in `apps/api/src/modules/auth/login.handler.ts` connects as `kidscare_auth_lookup` via `DATABASE_AUTH_LOOKUP_URL` — and only there. +
+## Layer 3 — Application Context + +`packages/tenant-context/` exports an `AsyncLocalStorage<TenantContextValue | null>` instance plus a `runWithTenant(value, fn)` helper. `TenantContextValue` is: +
+```ts
+type TenantContextValue = {

- tenantId: string;
- userId: string;
- role: 'ADMIN' | 'TEACHER' | 'PARENT';
  +};
  +```
-

+`apps/api/src/common/context/tenant-context.middleware.ts` reads the JWT (sub-project #2 will replace the dev header path), parses `tenantId/userId/role`, and wraps the request handler with `runWithTenant`. The context exists for the lifetime of one HTTP request. + +`apps/api/src/common/guards/tenant.guard.ts` is applied via `@UseGuards(TenantGuard)` on every controller method that touches tenant-scoped data. It throws `ForbiddenException` if no context is present. Endpoints marked with `@Public()` skip the guard — used only for `/health`, `/auth/login`, and the marketing public site. +
+## Layer 4 — Prisma Middleware + +`packages/database/src/middleware/tenant.middleware.ts` exports `withTenantContext(prisma, ctx)`. It uses Prisma's `$extends` API to wrap every query in a transaction that runs `SET LOCAL app.tenant_id = '<ctx.tenantId>'` first. The base `prisma` export is a raw client used only for login-time lookups and for `prisma migrate`. +
+The `PrismaService` registered in `apps/api` extends the base client and applies `withTenantContext` per request by reading from the AsyncLocalStorage. Controllers never instantiate a Prisma client themselves; they always inject `PrismaService`. +
+## What You Must Never Do +
+1. Skip `@UseGuards(TenantGuard)` on a controller that returns tenant data. Code review rejects the PR.
+2. Import `DATABASE_AUTH_LOOKUP_URL` or its value from anywhere other than the auth module's login handler file. A test in any other module reading this variable is a security violation.
+3. Add `BYPASSRLS` to any role. If a query cannot succeed under RLS, fix the policy or the role grants — do not bypass.
+4. Disable RLS on a tenant-scoped table for "convenience" in a test. Tests that need cross-tenant data use the `kidscare_app` role with two distinct contexts and assert isolation.
+5. Use a `WHERE tenantId = ...` clause in application code as the only tenant filter. RLS enforces tenant isolation; a missing `WHERE` would still leak under RLS only if the policy is misconfigured, so application-level filtering is defence-in-depth but never the primary control.
+6. Grant the `kidscare_app` role access to a new tenant-scoped table without also writing the matching RLS policy in the same migration. The two changes ship together or neither ships. +
+## Adding a New Tenant-Scoped Table — Checklist +
+When a module needs a new table: +
+- [ ] Add the model to `packages/database/prisma/schema.prisma` with a non-nullable `tenantId` column referencing `tenants(id)` and `onDelete: Cascade`
+- [ ] Run `pnpm db:migrate` and edit the generated SQL to add `ENABLE`, `FORCE`, and `CREATE POLICY`
+- [ ] Grant the appropriate privileges on the new table to `kidscare_app`
+- [ ] If any column is sensitive enough to warrant column-level protection, document the role grants explicitly
+- [ ] Add the table name to the integration test `apps/api/test/tenant-isolation.spec.ts` and assert cross-tenant queries return empty
+- [ ] The Prisma client regenerated from the new schema will pick up the new model — no middleware changes needed
diff --git a/.claude/skills/kidscare-naming-rules/SKILL.md b/.claude/skills/kidscare-naming-rules/SKILL.md
new file mode 100644
index 0000000..57aa9a7
--- /dev/null
+++ b/.claude/skills/kidscare-naming-rules/SKILL.md
@@ -0,0 +1,124 @@
+---
+name: kidscare-naming-rules
+description: Use when naming a new file, class, variable, DTO, interface, or enum in the KidsCare codebase. Covers kebab-case files, PascalCase classes, camelCase members, naming for DTO/entity/repository/service, and the explicit list of patterns the agent must never produce.
+--- +
+# KidsCare — Naming and Forbidden Patterns +
+## File Names +
+All TypeScript files: `kebab-case.ts`. The segment before `.ts` carries enough context that the directory is optional to read. +
+| Construct | Pattern | Example |
+|---|---|---|
+| Module file | `<domain>.module.ts` | `students.module.ts` |
+| Controller | `<domain>.controller.ts` | `students.controller.ts` |
+| Service | `<domain>.service.ts` | `students.service.ts` |
+| Repository | `<domain>.repository.ts` | `students.repository.ts` |
+| DTO | `<verb>-<entity>.dto.ts` or `<entity>-response.dto.ts` | `create-student.dto.ts`, `student-response.dto.ts` |
+| Entity | `<entity>.entity.ts` | `student.entity.ts` |
+| Spec | colocated with subject + `.spec.ts` | `students.service.spec.ts`, `students.controller.spec.ts` | +
+React Native screens: `<ScreenName>Screen.tsx` (PascalCase file, PascalCase component) — Expo convention overrides the kebab-case rule for screens only. +
+## Class Names +
+PascalCase. The name says what the thing is, not what it does. +
+| Construct | Pattern | Example |
+|---|---|---|
+| Service | `<Domain>Service` | `StudentsService` |
+| Controller | `<Domain>Controller` | `StudentsController` |
+| Repository | `<Domain>Repository` | `StudentsRepository` |
+| Interface for repository | `I<Domain>Repository` | `IStudentsRepository` |
+| Interface for service (when cross-module) | `I<Domain>Service` | `IStudentsService` |
+| DTO | `<Verb><Entity>Dto` or `<Entity>ResponseDto` | `CreateStudentDto`, `StudentResponseDto` |
+| Entity | `<Entity>` | `Student` |
+| Enum | `<PascalCase>` | `UserRole`, `TenantStatus` |
+| Guard | `<Purpose>Guard` | `TenantGuard`, `RoleGuard` |
+| Middleware | `<Purpose>Middleware` | `TenantContextMiddleware` |
+| Interceptor | `<Purpose>Interceptor` | `LoggingInterceptor` |
+| Decorator | `<Purpose>` (no suffix) | `Public`, `CurrentUser` | +
+DTO and entity names are nouns, not verbs. `CreateStudentDto`, not `MakeStudentDto` or `StudentCreationDto`. A name with a verb suggests the action belongs on a service method, not in a class name. +
+## Variables, Functions, Methods + +`camelCase`. Service methods follow NestJS CRUD convention and do not deviate: +
+- `create`
+- `findAll` (returns paginated list)
+- `findOne` (returns single, throws if missing)
+- `update`
+- `remove` (soft delete by default, hard delete when the model has no `deletedAt`) +
+Custom operations are named after the domain verb, not the SQL: `enrollStudent`, `markAttendance`, `issueInvoice`. Avoid `get`, `set`, `do`, `process`, `handle` as standalone — they describe nothing. +
+Boolean variables and methods read as predicates: `isActive`, `canEnroll`, `hasPassed`. Never `activeFlag`, `enrollmentStatusBool`. +
+Constants in `SCREAMING_SNAKE_CASE`: `MAX_STUDENTS_PER_CLASS`, `DEFAULT_PAGE_SIZE`. They live at the top of the file that uses them or in a colocated `constants.ts` if shared. +
+## Enum Values + +`SCREAMING_SNAKE_CASE`. The enum name is the noun, the values are the states: +
+```ts
+enum TenantStatus {

- ACTIVE
- SUSPENDED
- DELETED
  +}
  +```
-

+A value named `tenantStatus.ACTIVE` reads as a sentence. A value named `tenantStatus.active` reads as a typo. +
+## What the Agent Must Never Produce +
+These are not preferences — they are review-rejection criteria. The list is explicit because guessing is expensive when the rejection happens after a 200-line diff. +
+### Forbidden File-Level Patterns +
+- `any` type. If the type is genuinely unknown, use `unknown` and narrow it at the boundary with a type guard. If `any` is unavoidable in a third-party adapter, add a `// eslint-disable-next-line` comment with a one-line reason — and the surrounding code must still be type-safe.
+- `// @ts-ignore` or `// @ts-expect-error` without a comment explaining why and when it can be removed.
+- A `helpers.ts`, `utils.ts`, or `common.ts` file at module root. The function belongs in the service that uses it, or in a shared package if genuinely cross-cutting.
+- Re-export of a type that exists in another file. Consolidate at the source. +
+### Forbidden Class-Level Patterns +
+- A service that imports Prisma directly. Service depends on repository interface.
+- A controller that imports Prisma, a repository, or another module's service-internals.
+- A repository that accepts `Request` or knows about HTTP.
+- A DTO class with business logic — methods that compute, validate beyond shape, or call services. DTOs are wire format.
+- An entity that depends on a framework (NestJS decorators, Prisma client, class-validator).
+- A "Manager", "Handler", "Processor", "Helper", "Utility" suffix on a class. The name should describe the domain concept. +
+### Forbidden Method-Level Patterns +
+- A method named `getData`, `processData`, `doStuff`, `handleRequest`. The name must say what happens.
+- A method longer than 30 lines. Refactor before merging.
+- A method with more than 4 parameters. Wrap related parameters in an object.
+- A boolean parameter. Replace with two methods named after the behaviour (`findActive` vs `findAll`, `softDelete` vs `hardDelete`).
+- Returning `any` from a public method. Use the entity type or `void`. +
+### Forbidden Cross-Module Patterns +
+- Module A's service reaching into module B's repository. Goes through B's service.
+- Module A's controller importing module B's DTOs. Each module owns its wire format; cross-module data flows through services.
+- A shared type defined in two files. One definition, multiple imports. +
+### Forbidden Tenant Patterns +
+- A repository method without an explicit `tenantId` parameter. (RLS enforces the actual isolation; the parameter documents the dependency.)
+- A `findMany` / `findFirst` call against a tenant-scoped table without the middleware-extended client. Bare Prisma bypasses RLS in code paths where it shouldn't.
+- Importing `DATABASE_AUTH_LOOKUP_URL` from anywhere outside `apps/api/src/modules/auth/login.handler.ts`. +
+## What To Do When a Rule Conflicts With Reality +
+Sometimes a rule does not fit. When that happens: +
+1. Stop before writing the code
+2. Tell the user which rule conflicts and why
+3. Propose the deviation in one or two sentences
+4. Wait for explicit approval +
+Silent deviations are forbidden. Stated, approved deviations become part of the next spec revision.
diff --git a/.claude/skills/kidscare-prisma-database/SKILL.md b/.claude/skills/kidscare-prisma-database/SKILL.md
new file mode 100644
index 0000000..1f079eb
--- /dev/null
+++ b/.claude/skills/kidscare-prisma-database/SKILL.md
@@ -0,0 +1,131 @@
+---
+name: kidscare-prisma-database
+description: Use when modifying the Prisma schema, writing or reviewing migrations, adding seed data, or touching the database package. Covers schema conventions, migration workflow, RLS SQL patterns, generated client placement, and seed scripts.
+--- +
+# KidsCare — Prisma and Database Conventions +
+## Where Things Live + +`
+packages/database/
+├── prisma/
+│   ├── schema.prisma         (single source of truth for the schema)
+│   ├── seed.ts               (idempotent dev seed)
+│   └── migrations/           (generated, edited by hand for RLS SQL)
+├── src/
+│   ├── client.ts             (re-exports the generated client)
+│   ├── middleware/
+│   │   └── tenant.middleware.ts
+│   └── index.ts              (public API: prisma, withTenantContext)
+├── project.json              (Nx)
+├── package.json
+└── tsconfig.json
+` +
+The generated Prisma client is committed to the repository at `packages/database/src/generated/client/`. Build reproducibility outweighs the noise in diffs. A `.gitignore` rule excluding the generated client is not used. +
+## Schema Conventions +
+### File Layout +
+One `schema.prisma` file. Models grouped by domain with a blank line between groups, comment headers per group: + +`prisma
+// ─── Identity ───────────────────────────────────────────────
+model Tenant { ... }
+model User   { ... }
+` +
+### Naming +
+- Table names: snake_case via `@@map("table_name")`
+- Column names: camelCase in Prisma (becomes snake_case in the DB if you set `@map`); for this project we keep Prisma's default and use camelCase in the DB too — consistency over convention
+- Model names: PascalCase singular (`Tenant`, `User`, `Student`)
+- Enum names: PascalCase (`UserRole`, `TenantStatus`)
+- Enum values: SCREAMING_SNAKE_CASE (`ACTIVE`, `SUSPENDED`) +
+### Required Columns on Tenant-Scoped Models +
+Every model that holds per-tenant data has: +
+- `id` — `@id @default(cuid())` (cuid, not uuid — sortable and shorter)
+- `tenantId` — `String`, non-nullable, FK to `tenants(id)` with `onDelete: Cascade`
+- `createdAt` — `@default(now())`
+- `updatedAt` — `@updatedAt` +
+Soft-delete via a `deletedAt: DateTime?` column is added per-model when the requirement is explicit. Hard delete + audit log is the default; soft delete is opt-in. +
+### Indexes +
+- An index on `tenantId` is added on every tenant-scoped model via `@@index([tenantId])` — the RLS policy's hot path
+- Compound unique constraints include `tenantId` when the constraint is per-tenant (e.g. `@@unique([tenantId, email])`)
+- JSONB columns (used for the Öğrenci Pasaportu) get a GIN index when queries filter into them: `@@index([passportData(ops: JsonbOps)], type: Gin)` +
+## Migrations +
+### Workflow + +`bash
+# from packages/database
+pnpm prisma migrate dev --name <descriptive-name>
+pnpm prisma generate
+` +
+Migration names are descriptive kebab-case: `add-student-passport`, `create-payments-table`, `enable-rls-on-attendance`. +
+### RLS SQL Is Part of the Migration +
+When a migration creates a new tenant-scoped table, the same migration file must contain: +
+1. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
+2. `ALTER TABLE ... FORCE ROW LEVEL SECURITY;`
+3. `CREATE POLICY tenant_isolation ON ... USING (...);`
+4. `GRANT SELECT, INSERT, UPDATE, DELETE ON ... TO kidscare_app;` +
+These statements live in the same `.sql` file as the `CREATE TABLE`. Splitting them across two migrations is a deployment hazard: a migration that ships before the RLS grant leaves the table world-readable until the next migration runs. +
+### Editing Generated SQL + +`prisma migrate dev` generates a `CREATE TABLE` statement. Open the file and add the four RLS/grant statements manually before committing. The Prisma CLI does not know about RLS — that knowledge lives in the team, captured by code review and by the test suite. +
+## Seed Script + +`packages/database/prisma/seed.ts` runs via `pnpm db:seed`. It is idempotent: re-running it does not duplicate rows. Pattern: +
+```ts
+const tenant = await prisma.tenant.upsert({

- where: { slug: 'demo' },
- update: {},
- create: { slug: 'demo', name: 'Demo Kreş' },
  +});
  +```
-

+Seed runs as `kidscare_migrator` (because `pnpm db:seed` is a migration-tier operation), which means it bypasses RLS for inserts. This is correct: seed needs to create rows across tenants. +
+The seed file uses the **raw** `prisma` export from `@kidscare/database`, not the extended client — the extension requires a context that does not exist at seed time. +
+## Client Generation + +`generator client` block in `schema.prisma`: +
+```prisma
+generator client {

- provider = "prisma-client-js"
- output = "../src/generated/client"
  +}
  +```
-

+The output path is relative to `schema.prisma` and is **not** the default `node_modules/.prisma/client`. This makes the client a workspace package that other packages can import without Prisma re-generating it locally. +
+After any schema change: +
+1. `pnpm prisma migrate dev --name <change>`
+2. `pnpm prisma generate` (also runs as part of the above)
+3. The TypeScript types in `apps/api` and other consumers pick up automatically — no separate build step +
+## What This Skill Does Not Cover +
+- Tenant context propagation through the app → `kidscare-multi-tenancy`
+- Module template (controllers, services, repositories) → `kidscare-solid-modules`
+- Test setup, including tenant-isolation integration tests → `kidscare-testing`
diff --git a/.claude/skills/kidscare-shared-packages/SKILL.md b/.claude/skills/kidscare-shared-packages/SKILL.md
new file mode 100644
index 0000000..90f2956
--- /dev/null
+++ b/.claude/skills/kidscare-shared-packages/SKILL.md
@@ -0,0 +1,132 @@
+---
+name: kidscare-shared-packages
+description: Use when defining a new DTO, interface, Zod schema, or any type that needs to be shared between backend and frontend/mobile. Covers packages/shared-types, packages/shared-schemas, the dependency direction, and the rule against re-defining the same type in two places.
+--- +
+# KidsCare — Shared Packages Discipline +
+## Why This Exists +
+The same `Student` flows through the API response, the admin-web form, and the mobile offline cache. Defining it three times means three places to change when a field is renamed, three places where a field can drift, and three places where validation can disagree with the server. The discipline is: one definition, many consumers. +
+## The Two Packages +
+### `packages/shared-types/` +
+TypeScript types and interfaces. Pure types — no runtime code, no decorators, no class definitions. The package compiles to `dist/` for external consumption but is also importable from source via the workspace path alias. + +`
+packages/shared-types/src/
+├── tenant.ts
+├── user.ts
+├── student.ts
+├── payment.ts
+├── index.ts          (barrel — re-exports everything)
+└── ...
+` +
+Exports are pure types: +
+```ts
+// tenant.ts
+export type Tenant = {

- id: string;
- slug: string;
- name: string;
- status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
- createdAt: string; // ISO 8601, always
- updatedAt: string;
  +};
-

+export type TenantSummary = Pick<Tenant, 'id' | 'slug' | 'name'>; +``
+
+No `class`, no `enum`, no decorators. Types cross the wire as JSON; classes don't survive the boundary.
+
+### `packages/shared-schemas/`
+
+Zod schemas for runtime validation. The schema is the source of truth for shape; the TypeScript type is inferred from it.
+
+``ts
+// tenant.schema.ts
+import { z } from 'zod'; +
+export const tenantSchema = z.object({

- id: z.string().cuid(),
- slug: z.string().min(2).max(64).regex(/^[a-z0-9-]+$/),
- name: z.string().min(2).max(128),
- status: z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']),
  +});
-

+export type Tenant = z.infer<typeof tenantSchema>; +``
+
+The backend uses these schemas to validate inbound requests (via `nestjs-zod` or a custom pipe). The frontend uses them to validate form input and to typecheck API responses. Mobile uses them to validate cached data on rehydration.
+
+When a type and its schema diverge, the schema wins — schemas validate at runtime, types are erased.
+
+## Dependency Direction
+
+``
+apps/api ─┐
+apps/admin-web ─┼──► shared-schemas ──► shared-types
+apps/mobile ─┤
+apps/marketing ─┘ +``
+
+`shared-schemas` depends on `shared-types`. The reverse is forbidden. Apps depend on both packages; they do not depend on each other.
+
+When `apps/api` needs a type, it imports from `shared-types`. When it needs to validate input shape, it imports the Zod schema from `shared-schemas`. When the API response shape is defined in the controller's response DTO, the DTO type comes from `shared-types` (or is inferred from the schema) — never redefined.
+
+## Forbidden Re-Definition
+
+The same type, defined twice, is a defect. Specifically forbidden:
+
+``ts
+// ❌ Defined in apps/api/src/modules/students/dto/student.dto.ts
+export class StudentDto {

- id: string;
- firstName: string;
- ...
  +}
-

+// ❌ Also defined in apps/admin-web/src/types/student.ts
+export type Student = {

- id: string;
- firstName: string;
- ...
  +};
  +```
-

+The fix is: define `Student` in `packages/shared-types/src/student.ts`, import in both places. The controller's response DTO either re-exports the shared type or extends it with HTTP-specific fields (pagination wrapper, hypermedia links, etc.). +
+The check `grep -r "export type Student" packages/ apps/` should return exactly one match. CI runs this grep; a second match is a build failure. +
+## Zod Schemas vs class-validator DTOs +
+NestJS's default DTO system uses `class-validator`. Two options: +
+- **Option A (default):** Backend uses Zod via `nestjs-zod` or a custom validation pipe. The `dto/` directory in each module contains Zod schemas re-exported from `shared-schemas` plus module-specific extensions. A single source of truth, frontend and backend share.
+- **Option B:** Backend uses `class-validator` DTOs in `dto/` for HTTP validation; `shared-schemas` exists only for frontend/mobile. Two parallel definitions, drift risk. +
+The project uses **Option A**. When sub-project #2 (auth) lands, the `dto/` directory contains Zod schema re-exports, not `class-validator` classes. +
+## When a Type Is Module-Internal +
+Not every type belongs in `shared-types`. A type that exists only inside one service, only inside one repository, or only inside one component stays local. Promote to `shared-types` when: +
+- The type crosses the HTTP boundary (request body, response body, query params)
+- The type is consumed by frontend or mobile
+- The type encodes a contract that more than one module depends on +
+A type that exists only inside one service and is never returned to a controller is module-internal. Do not promote prematurely. +
+## Versioning +
+Shared packages have no published versions in MVP — they live in the workspace and are consumed via path aliases. When the project eventually publishes packages (if it ever does), the rules become conventional semver. For now: changes to a shared package can break consumers in the same workspace. Run all consumers' tests after changing a shared type. +
+## What This Skill Does Not Cover +
+- Module template, controller/service shape → `kidscare-solid-modules`
+- Tenant isolation rules → `kidscare-multi-tenancy`
+- File naming → `kidscare-naming-rules`
diff --git a/.claude/skills/kidscare-solid-modules/SKILL.md b/.claude/skills/kidscare-solid-modules/SKILL.md
new file mode 100644
index 0000000..0c5fa68
--- /dev/null
+++ b/.claude/skills/kidscare-solid-modules/SKILL.md
@@ -0,0 +1,140 @@
+---
+name: kidscare-solid-modules
+description: Use when creating a new domain module in apps/api, when a service file is approaching 200 lines, when adding a controller, or when the agent is about to write a Prisma query outside a repository. Enforces the project module template and SOLID principles concretely.
+--- +
+# KidsCare — Module Template and SOLID Application +
+## The Module Template +
+Every domain module in `apps/api/src/modules/<domain>/` has this exact layout. No exceptions, no omissions, no extra files at the module root. + +`
+modules/<domain>/
+├── <domain>.module.ts              (NestJS wiring)
+├── controllers/
+│   └── <domain>.controller.ts
+├── services/
+│   └── <domain>.service.ts
+├── repositories/
+│   └── <domain>.repository.ts
+├── dto/
+│   ├── create-<entity>.dto.ts
+│   ├── update-<entity>.dto.ts
+│   └── <entity>-response.dto.ts
+├── entities/
+│   └── <entity>.entity.ts
+└── <domain>.spec.ts                (top-level integration / smoke test)
+` +
+If you find yourself adding `helpers/`, `utils/`, `validators/`, or any other top-level directory inside a module, the responsibility belongs in another module or in a service method. Discuss with the user before creating new module subdirectories. +
+## The Four Layers and What Each Owns +
+### Controller +
+- Parses HTTP, validates input shape via DTOs (NestJS `ValidationPipe` with class-validator)
+- Calls exactly one service method per endpoint
+- Maps service result to response DTO
+- Throws or lets service exceptions bubble — no catch-and-rewrite that loses information
+- **Never** imports Prisma, a repository directly, or any class from another module's `repositories/` +
+A controller method longer than ~25 lines is a signal that business logic leaked in. Refactor before merging. +
+### Service +
+- Owns domain logic: orchestration, state transitions, cross-entity rules
+- Calls repositories (own module's) and other modules' services via injected interfaces
+- Does not know HTTP exists — no `Response`, no `Request`, no `@Req()`, no `@Res()`
+- Does not know Prisma exists — works against `I<Domain>Repository` interfaces
+- If the file is approaching 200 lines, the service is doing too much. Split by responsibility (e.g. `StudentsService` becomes `StudentEnrollmentService` + `StudentProfileService`). The user wants to be told when this happens; do not silently grow the file. +
+### Repository +
+- The only place that imports `PrismaClient` or constructs queries against the database
+- Exposes methods named after the operations, not the SQL: `findById`, `findManyByTenant`, `insert`, `update`, `softDelete`
+- Returns plain Prisma model objects (or entities — see below); the service decides whether to map to a DTO
+- Accepts `tenantId` explicitly as the first argument of every method that touches a tenant-scoped table. RLS is the source of truth, but explicit parameter makes the dependency visible in the signature +
+### DTO / Entity +
+- **DTO** (`dto/`): wire format — what crosses the HTTP boundary. Uses class-validator decorators. Lives behind the controller.
+- **Entity** (`entities/`): domain object — what the service works with. Plain TypeScript class, no decorators, no Prisma annotations. May include computed fields, invariants, factory methods. +
+A DTO can extend or compose an entity but never the other way around. The dependency direction is HTTP → DTO → Entity → Repository. +
+## SOLID — Applied Concrete +
+### Single Responsibility +
+A service file over 200 lines means two responsibilities. Split by what changes for different reasons: a method that creates a student is not the same responsibility as a method that calculates attendance statistics, even if both read student data. +
+If you grow a service beyond 200 lines, **stop, tell the user, propose a split**. Do not silently exceed the limit. +
+### Open/Closed +
+Adding a new notification channel (email, SMS, push) does not modify `NotificationService`. Add a new handler implementing `INotificationHandler`, register it in the module, and the existing service dispatches polymorphically. The same pattern applies to payment gateways, file storage backends, and any other strategy-shaped concern. +
+### Liskov Substitution +
+Anywhere a service receives a repository, it receives the interface, not the implementation. Test doubles implement the same interface. A test that needs to bypass RLS uses a `RawPrismaRepository` that connects with the `kidscare_migrator` role; it satisfies the same interface and is substitutable where RLS is irrelevant (e.g. setup code). +
+### Interface Segregation +
+Repositories expose narrow interfaces per use case when the surface area is large. A `StudentsRepository` with 30 methods is a sign to split: `StudentProfileRepository`, `StudentEnrollmentRepository`, `StudentPassportRepository`. Each service depends only on the interface it needs. +
+### Dependency Inversion +
+Services depend on `IStudentsRepository`, not on `StudentsRepository`. The concrete class is wired in the module file via NestJS DI tokens. This makes the service unit-testable with an in-memory double and makes it possible to swap the implementation (e.g. for a read replica, a cache layer, or a different storage backend) without touching the service. +
+For external integrations (payment gateway, file storage, push notifications), the inversion is mandatory — the service depends on the interface, the infrastructure adapter implements it. Mocking an external SDK at the service boundary is not acceptable. +
+## Module Wiring Example +
+```ts
+// students.module.ts
+@Module({

- controllers: [StudentsController],
- providers: [
- StudentsService,
- { provide: 'IStudentsRepository', useClass: StudentsRepository },
- ],
  +})
  +export class StudentsModule {}
  +```
-

+```ts
+// students.service.ts
+@Injectable()
+export class StudentsService {

- constructor(
- @Inject('IStudentsRepository') private readonly repo: IStudentsRepository,
- ) {}
-
- async findOne(tenantId: string, id: string): Promise<Student> {
- const student = await this.repo.findById(tenantId, id);
- if (!student) throw new NotFoundException(`Student ${id} not found`);
- return student;
- }
  +}
  +```
-

+The service never imports `StudentsRepository` directly. Tests inject a fake `IStudentsRepository` and assert behaviour without touching the database. +
+## Cross-Module Communication + +`StudentsService` may need data from `EnrollmentsService`. The dependency: +
+- Is injected via NestJS DI in `StudentsModule`'s `imports`
+- Flows through the other module's service, never its repository
+- Is declared against an interface (`IEnrollmentsService`) when the consumer needs testability +
+A module that imports another module's repository has a layering bug. The repositories are not part of any module's public surface. +
+## What This Skill Does Not Cover +
+- Tenant guard, RLS, role separation → `kidscare-multi-tenancy`
+- Database schema and migrations → `kidscare-prisma-database`
+- File naming conventions → `kidscare-naming-rules`
+- Test structure → `kidscare-testing`
+- Shared types and Zod schemas → `kidscare-shared-packages`
diff --git a/.claude/skills/kidscare-testing/SKILL.md b/.claude/skills/kidscare-testing/SKILL.md
new file mode 100644
index 0000000..763a7ed
--- /dev/null
+++ b/.claude/skills/kidscare-testing/SKILL.md
@@ -0,0 +1,92 @@
+---
+name: kidscare-testing
+description: Use when writing tests, reviewing test coverage, adding a new endpoint, or checking whether a feature is testable. Covers Jest setup for backend, Vitest for web, the tenant-isolation integration test, and the per-method test minimum.
+--- +
+# KidsCare — Testing Conventions +
+## Test Layout +
+### Backend (Jest, NestJS default) +
+- `*.spec.ts` files colocated with the file they test
+- Unit tests: `students.service.spec.ts`, `students.repository.spec.ts`, `tenant.guard.spec.ts`
+- Integration tests: `apps/api/test/<feature>.spec.ts` (one level up from `src/`)
+- E2E tests: `apps/api/test/e2e/<flow>.e2e-spec.ts` +
+A test file at the same path as the code it covers is the convention. Reading the directory should reveal the test surface without a separate `__tests__` walk. +
+### Frontend (Vitest, Vite-native) +
+- `*.test.ts` or `*.test.tsx` colocated with the component
+- One test file per component or hook, named after it
+- Test setup at `apps/admin-web/src/test-setup.ts` +
+### Mobile (Jest, Expo preset) +
+- `*.test.tsx` colocated
+- Expo's Jest preset handles the React Native environment +
+## Per-Method Test Minimum +
+For every public service method: +
+- **One happy path** — typical inputs, expected output, no error
+- **One failure path** — invalid input, missing data, or downstream error. Assert both the thrown error type and the message when the message is part of the contract +
+For every repository method: +
+- **One happy path** — round-trip insert + read returns the row
+- **One not-found path** — `findById` on a missing id returns `null` (not throws) +
+For every controller method: +
+- **One happy path** through the HTTP boundary: 200 with response DTO
+- **One validation failure** — missing required field, wrong type: 400
+- **One auth/tenant failure** — missing context, wrong tenant: 403 +
+If a method's contract is "this never throws," the test asserts the return value and nothing else — do not invent artificial failure paths. +
+## The Tenant-Isolation Integration Test + +`apps/api/test/tenant-isolation.spec.ts` is mandatory. It boots a test Postgres, applies the migrations, runs the seed with two tenants, and proves that RLS + AsyncLocalStorage + Prisma middleware work together. The test runs on every CI build. +
+The test covers, at minimum: +
+1. **Setup** — create tenants A and B, each with one admin user
+2. **Within-tenant read** — tenant A user reads its own users → sees only tenant A's rows
+3. **Cross-tenant read** — tenant A user reads users → tenant B's rows are absent (empty list, not an error)
+4. **Cross-tenant write** — tenant A user attempts to insert a row with `tenantId = B` → rejected (RLS policy violation)
+5. **Login bypass** — using `kidscare_auth_lookup` connection, look up a user by email across tenants → succeeds (the login flow's only legitimate cross-tenant query)
+6. **Login bypass negative** — `kidscare_auth_lookup` attempting `INSERT INTO users` → rejected by GRANT +
+The test connects as `kidscare_app` for the application-flow assertions and as `kidscare_auth_lookup` only for assertion #5. It never connects as `kidscare_migrator` except for setup/teardown. +
+## Test Database Lifecycle +
+- A dedicated test database (`kidscare_test`) lives in the same Postgres instance
+- Migrations apply at suite startup; data truncates between tests (not between transactions — between tests, with the order randomised)
+- The test suite does not run against the dev database. Cross-contamination is the most expensive class of test bug. +
+## Mocks +
+- **Repositories** in service tests: implement the interface with an in-memory store or a hand-rolled spy. No `jest.mock('prisma')` calls in service tests — the repository abstraction is what we are testing through.
+- **External SDKs** (iyzico, Cloudflare R2, FCM): wrap behind the project's own interface (`IPaymentGateway`, `IFileStorage`) and mock the interface in service tests. Adapter tests verify the SDK integration separately.
+- **Time**: use `@sinonjs/fake-timers` or Jest's `useFakeTimers()`. Tests that depend on "now" must not depend on wall-clock time. +
+## Coverage +
+Sub-project #1 ships without a coverage threshold (baseline report enabled). The threshold is set after the first feature module lands. Tentative targets once enforced: +
+- Lines: 80%
+- Branches: 75%
+- Critical modules (auth, payments, tenant guard): 90% +
+Coverage is a tripwire, not a goal. A test that raises coverage without asserting behaviour is a useless test. +
+## What This Skill Does Not Cover +
+- Module template, service layer shape → `kidscare-solid-modules`
+- Database setup, migrations → `kidscare-prisma-database`
+- Tenant guard, RLS, role separation → `kidscare-multi-tenancy`
+- File naming → `kidscare-naming-rules`
diff --git a/.gitattributes b/.gitattributes
new file mode 100644
index 0000000..4e4a45d
--- /dev/null
+++ b/.gitattributes
@@ -0,0 +1,4 @@
+* text=auto eol=lf +_.png binary +_.jpg binary +_.ico binary
\ No newline at end of file
diff --git a/.gitignore b/.gitignore
new file mode 100644
index 0000000..dc2a707
--- /dev/null
+++ b/.gitignore
@@ -0,0 +1,11 @@
+node_modules/
+dist/
+.nx/
+.turbo/ +_.log
+.env
+.env.local
+apps/mobile/.expo/
+apps/mobile/node_modules/
+coverage/
+.next/
\ No newline at end of file
diff --git a/.superpowers/sdd/2026-09-13-infrastructure-layer/briefs/task-1-brief.md b/.superpowers/sdd/2026-09-13-infrastructure-layer/briefs/task-1-brief.md
new file mode 100644
index 0000000..7e65d2a
--- /dev/null
+++ b/.superpowers/sdd/2026-09-13-infrastructure-layer/briefs/task-1-brief.md
@@ -0,0 +1,142 @@
+# Task 1 Brief — Initialize Nx Workspace + pnpm +
+## Context (1 line)
+First of 16 tasks in the KidsCare infrastructure bootstrap; the directory `C:\Users\Partridge\Desktop\KidsCare` currently holds only `CLAUDE.md`, `kres-uygulamasi-teknoloji-karar-raporu.md`, `docs/`, and `.claude/`. We start from an empty package. +
+## Files to create
+- `package.json` (overwrite the one `pnpm init` creates)
+- `pnpm-workspace.yaml`
+- `nx.json`
+- `.gitignore`
+- `.gitattributes` +
+## Steps (verbatim from the plan, follow exactly) + +**Step 1:** Open a terminal in `C:\Users\Partridge\Desktop\KidsCare`. Initialise an empty package and install Nx + pnpm tooling. + +`bash
+cd C:\Users\Partridge\Desktop\KidsCare
+pnpm init
+pnpm add -Dw nx@^19.0.0
+pnpm add -Dw typescript@^5.4.0 @types/node@^20.0.0
+` + +**Step 2:** Replace the generated `package.json` with the workspace root manifest. +
+```json
+{

- "name": "kidscare",
- "version": "0.0.0",
- "private": true,
- "packageManager": "pnpm@9.0.0",
- "engines": { "node": ">=20" },
- "scripts": {
- "db:up": "docker compose up -d",
- "db:down": "docker compose down",
- "db:migrate": "pnpm --filter @kidscare/database prisma migrate deploy",
- "db:migrate:dev": "pnpm --filter @kidscare/database prisma migrate dev",
- "db:seed": "pnpm --filter @kidscare/database prisma db seed",
- "db:reset": "pnpm --filter @kidscare/database prisma migrate reset --force",
- "dev:api": "pnpm --filter @kidscare/api start:dev",
- "dev:admin": "pnpm --filter @kidscare/admin-web dev",
- "dev:marketing": "pnpm --filter @kidscare/marketing dev",
- "dev:mobile": "pnpm --filter @kidscare/mobile start",
- "test": "pnpm exec nx run-many --target=test",
- "test:integration": "pnpm --filter @kidscare/api test:integration",
- "lint": "pnpm exec nx run-many --target=lint",
- "format": "pnpm exec nx format:write"
- },
- "devDependencies": {
- "nx": "^19.0.0",
- "typescript": "^5.4.0",
- "@types/node": "^20.0.0"
- }
  +}
  +```
-

+**Step 3:** Create `pnpm-workspace.yaml`: +
+```yaml
+packages:

- - 'apps/*'
- - 'packages/*'
    +```
-

+**Step 4:** Create `nx.json`: +
+```json
+{

- "npmScope": "kidscare",
- "affected": { "defaultBase": "main" },
- "tasksRunnerOptions": {
- "default": {
-      "runner": "nx/tasks-runners/default",
-      "options": { "cacheableOperations": ["build", "test", "lint"] }
- }
- },
- "workspaceLayout": { "appsDir": "apps", "libsDir": "packages" }
  +}
  +```
-

+**Step 5:** Create `.gitignore`: + +`
+node_modules/
+dist/
+.nx/
+.turbo/
+*.log
+.env
+.env.local
+apps/mobile/.expo/
+apps/mobile/node_modules/
+coverage/
+.next/
+` + +**Step 6:** Create `.gitattributes` to keep line endings consistent across OSes: + +`
+* text=auto eol=lf
+*.png binary
+*.jpg binary
+*.ico binary
+` + +**Step 7:** Initialise git and create the first commit. + +`bash
+git init
+git add .
+git commit -m "chore: initialise Nx workspace with pnpm"
+` +
+## Constraints (binding)
+- Node 20+ must be installed. If `node --version` is below 20, report it as a blocker; do not attempt to upgrade Node.
+- pnpm 9+ must be installed. If `pnpm --version` is below 9, report it as a blocker.
+- The workspace is Windows. All commands use forward-slash paths in scripts but Windows-native paths for filesystem operations.
+- Do not run `pnpm install` against any apps/packages that don't exist yet — there are no workspaces yet, so `pnpm install` will warn or error. Just install the dev deps at the root.
+- The `pnpm init` command creates a default `package.json`; you must overwrite it in Step 2 with the manifest above (do not `pnpm init` again). +
+## Report contract +
+Append the following to `.superpowers/sdd/2026-09-13-infrastructure-layer/reports/task-1-report.md`: + +``
+## Status
+DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED
+
+## One-line summary
+<what you actually did>
+
+## Test evidence
+<command run + relevant output — for Task 1 the only "test" is `pnpm --version` and the existence of the committed files; record both>
+
+## Self-review
+- <anything you noticed and fixed or that you want the reviewer to look at>
+
+## Commits
+<commit hashes, e.g. 7-char short form>
+`` +
+Then return ONLY: status, one-line summary, commit hashes. Nothing else.
diff --git a/.superpowers/sdd/2026-09-13-infrastructure-layer/progress.md b/.superpowers/sdd/2026-09-13-infrastructure-layer/progress.md
new file mode 100644
index 0000000..c7a3c7d
--- /dev/null
+++ b/.superpowers/sdd/2026-09-13-infrastructure-layer/progress.md
@@ -0,0 +1,29 @@
+# SDD ledger — plan: docs/superpowers/plans/2026-09-13-infrastructure-layer.md +
+## Identity
+- Plan: `docs/superpowers/plans/2026-09-13-infrastructure-layer.md`
+- Spec: `docs/superpowers/specs/2026-09-13-infrastructure-layer-design.md`
+- Workspace: `.superpowers/sdd/2026-09-13-infrastructure-layer/`
+- Branch: main (no worktree — project is not yet a git repo; Task 1 of the plan inits git) +
+## Pre-flight scan +
+| Pair / Item | Checked | Notes |
+|---|---|---|
+| Tasks 1 ↔ 2 | package.json scripts added by Task 1 used by Task 2 (`pnpm exec prettier`, `pnpm exec eslint`) | Clean — Task 1 installs only Nx + TS; Task 2 installs lint deps. |
+| Task 4 docker init vs Task 6 migration grants | Init script creates the three roles; migration grants `GRANT SELECT ... ON tenants/users TO kidscare_auth_lookup`. | Clean — grants are column-level on existing tables; roles exist by then. |
+| Task 6 `prisma migrate dev` regenerates SQL | Risk: re-running `prisma migrate dev` creates new migrations and loses hand-edited RLS SQL. | Mitigation: only run `prisma migrate dev` once for the initial migration. Future schema changes use `prisma migrate dev --name <change>` which adds new migrations; the init migration's RLS is preserved because it's a separate file. |
+| Task 8 `tenant.middleware.ts` has stub-then-replace pattern | Plan text shows a stub implementation followed by a "replace with the cleaner, real implementation" block. | Conflict — implementer could write both blocks or skip the replacement. See R1. |
+| Task 9 `nest start --watch` vs `@nx/node:node` executor | Plan defines both `start:dev` script (NestJS CLI) and `serve` target (Nx). | Both work; NestJS CLI owns watch mode. See R2. |
+| Task 11 `slug=a` / `slug=b` uniqueness | `@@unique([slug])` on `Tenant`. Two distinct slugs — no collision. | Clean. |
+| Task 12 Vite + Vitest, `jsx: react-jsx` and TS noEmit | Vitest needs Node test environment OR jsdom. Plan uses jsdom. | Clean. |
+| Task 15 `jest.config.ts` referenced but not created | Plan says "mirror Task 3 Step 9's jest.config.ts" without writing it. | Gap. See R3. |
+| Global constraints coverage | Three-role separation, FORCE RLS, generated client committed, `DATABASE_AUTH_LOOKUP_URL` import restriction | All covered in tasks. Clean. | +
+## Rulings + +**R1** — Task 8 ships only the final `withTenantContext` implementation. The throwaway stub block in the plan text is removed from the brief handed to the implementer. Cost if wrong: implementer writes the stub but never replaces it; middleware would be a no-op. Catchable in review. + +**R2** — Task 9 uses the NestJS CLI for dev (`nest start --watch`) and Nx for build/lint/test. `dev:api` script in the workspace `package.json` calls `pnpm --filter @kidscare/api start:dev`. The Nx `serve` target delegates to `start:dev`. Cost if wrong: dev server fails to start with confusing Nx/NestJS interaction. Catchable on first `pnpm dev:api`. + +**R3** — Task 15 explicitly creates `packages/shared-schemas/jest.config.ts` (and matching `project.json` if needed) using the same shape as Task 3 Step 9. The brief for Task 15 includes the file content verbatim. Cost if wrong: tests in shared-schemas fail to run or don't get picked up by the package-level test command. Catchable on test run.
diff --git a/.superpowers/sdd/2026-09-13-infrastructure-layer/reports/task-1-report.md b/.superpowers/sdd/2026-09-13-infrastructure-layer/reports/task-1-report.md
new file mode 100644
index 0000000..eea56c2
--- /dev/null
+++ b/.superpowers/sdd/2026-09-13-infrastructure-layer/reports/task-1-report.md
@@ -0,0 +1,27 @@
+## Status
+BLOCKED +
+## One-line summary
+Task 1 could not start: pnpm is not installed on this machine (and the brief instructs not to improvise around environment issues), so every `pnpm` invocation in Steps 1 and 7 would fail. +
+## Test evidence
+Preflight checks before Step 1: +
+- `node --version` -> `v24.16.0` (satisfies the "Node 20+" constraint).
+- `pnpm --version` -> `bash: pnpm: command not found` (exit code 127). pnpm is not on PATH and is not present under `/c/Users/Partridge/Desktop/KidsCare`, `/c/Users/Partridge/AppData/Roaming/npm`, `/c/Users/Partridge/AppData/Local/pnpm`, or any other searched location. Only Windows system files whose names start with `pnp*` (driver `.sys` / `.dll`) were found.
+- `corepack --version` -> `0.35.0` (present, but I did not invoke `corepack pnpm add ...` because the brief forbids improvising around environment issues — see Self-review).
+- `git --version` -> `git version 2.54.0.windows.1` (present; repo not yet initialized, which is expected). +
+No further steps were attempted because Steps 1 and 7 both require `pnpm`, and the workspace manifest pins `"packageManager": "pnpm@9.0.0"`, so even the workarounds (e.g. corepack activating pnpm 9.x, or substituting npm) would deviate from the brief. +
+## Self-review
+- I noticed `corepack` is available and could fetch pnpm 9.0.0 (`corepack prepare pnpm@9.0.0 --activate`), which would unblock Steps 1 and 7 without changing the pinned package manager. I deliberately did **not** run it because the brief states: _"If a step fails because of an environment issue (Node/pnpm version, network), report BLOCKED with the exact error rather than improvising."_ The spirit of that rule is to surface missing prerequisites rather than silently fix them, so I am flagging it instead.
+- No files in `C:\Users\Partridge\Desktop\KidsCare` were created or modified by this task — the directory still contains only the pre-existing `CLAUDE.md`, `kres-uygulamasi-teknoloji-karar-raporu.md`, `docs/`, and `.claude/`.
+- No git repository was initialized, so there are no commits. +
+What the reviewer / operator needs to decide:
+1. Approve me running `corepack enable` + `corepack prepare pnpm@9.0.0 --activate` (or equivalent global install of pnpm 9.x) and then re-running Steps 1-7 as written.
+2. Or treat this as a hard environment gate and resolve pnpm installation outside this task. +
+## Commits
+(none — task blocked before `git init`)
diff --git a/CLAUDE.md b/CLAUDE.md
new file mode 100644
index 0000000..bef8f69
--- /dev/null
+++ b/CLAUDE.md
@@ -0,0 +1,69 @@
+# KidsCare — Proje Kuralları (Claude Code için) +
+> **Not:** Bu proje şu anda MiniMax-M3 modeliyle çalıştırılıyor. Bu dosyadaki kurallar bilerek **çok somut ve az yoruma açık** yazıldı — model, mimariyi kendi inisiyatifiyle değil, buradaki şablonları birebir takip ederek uygulamalı. Belirsiz bir durumda agent **tahmin etmemeli**, bu dosyadaki en yakın örneğe bakmalı veya kullanıcıya sormalı. +
+## 1. Proje Özeti
+- **Ürün:** Çoklu kreşe satılabilir multi-tenant SaaS (KidsCare)
+- **Stack:** NestJS (backend) + PostgreSQL + Prisma + React/Vite (admin panel) + React Native/Expo (mobil) + Next.js (pazarlama sitesi)
+- **Monorepo:** Turborepo, `/apps` ve `/packages` altında +
+## 2. Değiştirilemez Mimari Kararlar (agent bunları SORGULAMAZ, DEĞİŞTİRMEZ)
+- Monorepo yapısı: `/apps/api`, `/apps/admin-web`, `/apps/marketing`, `/apps/mobile`, `/packages/shared-types`, `/packages/shared-schemas`
+- Multi-tenancy: PostgreSQL Row-Level Security + Prisma middleware ile `tenant_id` filtrelemesi — **her tabloda `tenant_id` kolonu zorunlu** (global/lookup tabloları hariç)
+- Backend mimarisi: NestJS modülerlik — her domain kendi modülü (`students`, `payments`, `tenants`, `auth`, `messages`, `attendance`)
+- Veri paylaşımı: DTO/interface tanımları `packages/shared-types` içinde tanımlanır, hem backend hem frontend/mobil buradan import eder — **asla aynı tipi iki yerde ayrı ayrı tanımlama** +
+## 3. Modül Şablonu (HER yeni modül birebir bu yapıda olmalı) +
+Örnek: `students` modülü + +`
+apps/api/src/modules/students/
+├── students.module.ts
+├── controllers/
+│   └── students.controller.ts
+├── services/
+│   └── students.service.ts
+├── dto/
+│   ├── create-student.dto.ts
+│   ├── update-student.dto.ts
+│   └── student-response.dto.ts
+├── entities/
+│   └── student.entity.ts
+├── repositories/
+│   └── students.repository.ts
+└── students.spec.ts
+` + +**Kural:** Controller iş mantığı içermez, sadece service çağırır. Service, doğrudan Prisma client'ı kullanmaz — repository katmanı üzerinden erişir. Bu katman ayrımı SOLID'in Dependency Inversion prensibinin somut uygulamasıdır — agent bunu atlayıp controller içinde Prisma sorgusu yazmamalı. +
+## 4. İsimlendirme Standardı
+- Dosyalar: `kebab-case.ts` (örn. `create-student.dto.ts`)
+- Sınıflar: `PascalCase` (örn. `StudentsService`)
+- Değişken/metod: `camelCase`
+- Interface/DTO isimleri fiil içermez, isim içerir (`CreateStudentDto`, `StudentResponseDto` — `MakeStudentDto` gibi isimler kullanılmaz)
+- Her modülün ana servis metodu isimlendirmesi: `create`, `findAll`, `findOne`, `update`, `remove` (NestJS CRUD konvansiyonu — tutarlılık için sapılmaz) +
+## 5. Tenant İzolasyon Kuralı (KRİTİK — güvenlik açığı riski)
+- Her repository metodu, sorgusuna `tenant_id` filtresini **otomatik olarak** bir base repository/guard katmanından almalı, controller veya service seviyesinde manuel eklenmez
+- Yeni bir endpoint yazılırken agent önce şunu kontrol eder: "Bu endpoint tenant-scoped mi?" — cevap evet ise `@UseGuards(TenantGuard)` decorator'ı zorunlu
+- Test yazarken her yeni endpoint için en az bir "farklı tenant'ın verisine erişememeli" test senaryosu eklenir +
+## 6. SOLID Prensiplerinin Somut Uygulaması
+- **Single Responsibility:** Bir service dosyası 200 satırı geçiyorsa, muhtemelen ikiye bölünmesi gerekiyor demektir — agent bunu fark ettiğinde kullanıcıya bildirir, sessizce büyütmez
+- **Dependency Inversion:** Service'ler somut sınıflara değil, interface'lere bağımlı olur (örn. `IStudentsRepository`) — özellikle dış servis entegrasyonlarında (ödeme, dosya depolama) bu zorunlu
+- **Open/Closed:** Yeni bir bildirim türü eklerken mevcut `NotificationService`'i değiştirmek yerine yeni bir strateji/handler eklenir +
+## 7. Yasaklı Kalıplar (agent bunları ASLA yapmaz)
+- Controller içinde doğrudan Prisma/veritabanı sorgusu
+- `any` tipi kullanımı (kesinlikle gerekliyse açıklama yorumu ile)
+- Tenant filtresi olmadan doğrudan `findMany`/`findFirst` çağrısı
+- Aynı DTO/interface'in birden fazla dosyada yeniden tanımlanması
+- Bir modülün başka bir modülün repository'sine doğrudan erişmesi (aralarında her zaman service katmanı üzerinden iletişim kurulur) +
+## 8. Belirsizlik Durumunda Davranış
+Bu dosyada karşılığı olmayan bir mimari karar gerektiğinde (yeni bir desen, yeni bir üçüncü parti servis entegrasyonu, DB şema değişikliği gibi), agent **kendi kararını uygulamaz** — seçenekleri kısaca özetleyip kullanıcıdan onay ister. +
+## 9. Test Beklentisi
+- Her yeni service metodu için en az 1 mutlu senaryo + 1 hata senaryosu testi
+- Tenant izolasyonu içeren her endpoint için izolasyon testi zorunlu (bkz. Bölüm 5)
diff --git a/docs/superpowers/plans/2026-09-13-infrastructure-layer.md b/docs/superpowers/plans/2026-09-13-infrastructure-layer.md
new file mode 100644
index 0000000..1ce20eb
--- /dev/null
+++ b/docs/superpowers/plans/2026-09-13-infrastructure-layer.md
@@ -0,0 +1,2378 @@
+# KidsCare Infrastructure Layer Implementation Plan +
+> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. + +**Goal:** Stand up the KidsCare monorepo skeleton, database layer with multi-tenant RLS infrastructure, NestJS API with a working `/health` endpoint, and minimal placeholders for admin-web, marketing, and mobile — verified end-to-end by the acceptance criteria in the spec. + +**Architecture:** Nx workspace with pnpm; packages `database` (Prisma + tenant middleware), `tenant-context` (AsyncLocalStorage), `shared-types` and `shared-schemas`. Apps `api` (NestJS), `admin-web` (Vite+React), `marketing` (Next.js), `mobile` (Expo). Local Postgres 16 + Redis 7 via docker-compose. Tenant isolation enforced by Postgres RLS + Prisma middleware that reads from AsyncLocalStorage; three Postgres roles (`migrator`, `app`, `auth_lookup`) with minimal privileges. + +**Tech Stack:** Node 20+, pnpm 9, Nx 19+, NestJS 10, Prisma 5+, Postgres 16, Redis 7, Docker Desktop, TypeScript 5+, Vite 5+, Next.js 14, Expo SDK 51, Jest, Vitest. + +**Spec:** `../specs/2026-09-13-infrastructure-layer-design.md` (also `.tr.md` for the Turkish translation; the English spec is the source of truth). +
+--- +
+## Global Constraints +
+These apply to every task below. Pulled verbatim from the spec and CLAUDE.md. +
+- **Node:** v20 LTS or newer (Expo SDK 51 and NestJS 10 both require Node 20+).
+- **pnpm:** v9 or newer (workspace support, peer-dependency isolation).
+- **Nx:** v19 or newer (flat ESLint config, modern generators).
+- **TypeScript:** v5.4+, `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`, `noImplicitOverride: true`.
+- **Postgres:** v16 (RLS, JSONB, `current_setting` second-arg behaviour).
+- **Redis:** v7 (BullMQ requirement, deferred but provisioned).
+- **Docker Desktop:** required on Windows; `docker compose` v2 syntax.
+- **No `any`:** the `@typescript-eslint/no-explicit-any` rule is set to `error` everywhere except `*.spec.ts` files (set to `warn`).
+- **Module template:** every NestJS domain module uses the layout in CLAUDE.md §3 — `controllers/`, `services/`, `repositories/`, `dto/`, `entities/`, plus `*.module.ts` and `*.spec.ts`. No helpers/, utils/, common/ at module root.
+- **Tenant guard:** every controller method that returns tenant-scoped data is decorated with `@UseGuards(TenantGuard)`. `@Public()` is only used for `/health`, `/auth/*` (sub-project #2), and the marketing site.
+- **Naming:** `kebab-case.ts` files, `PascalCase` classes, `camelCase` members. DTOs and entities are nouns. Service methods follow NestJS CRUD conventions.
+- **Commits:** conventional commits (`feat:`, `fix:`, `chore:`, `test:`, `docs:`). One commit per task. Run `pnpm exec nx format:write` and `pnpm exec nx lint` before committing.
+- **No `DATABASE_AUTH_LOOKUP_URL` import outside `apps/api/src/modules/auth/login.handler.ts`.** That module file does not exist yet (sub-project #2), so no import is permitted in sub-project #1 either — the connection-string constant lives in `packages/database/src/client/auth-lookup-client.ts` and is exported, but every consumer is forbidden until sub-project #2 lands.
+- **Three Postgres roles are mandatory:** `kidscare_migrator` (DDL, owns schema), `kidscare_app` (CRUD, subject to FORCE RLS), `kidscare_auth_lookup` (column-level SELECT on `users` and `tenants` only).
+- **Migrations are atomic:** every migration that creates a tenant-scoped table also includes `ENABLE ROW LEVEL SECURITY`, `FORCE ROW LEVEL SECURITY`, `CREATE POLICY`, and the `GRANT` to `kidscare_app` in the same SQL file.
+- **Generated Prisma client is committed** at `packages/database/src/generated/client/`. No `.gitignore` rule excluding it. +
+--- +
+## Task 1: Initialize Nx Workspace + pnpm + +**Files:**
+- Create: `package.json`
+- Create: `pnpm-workspace.yaml`
+- Create: `nx.json`
+- Create: `.gitignore`
+- Create: `.gitattributes` + +**Step 1:** Open a terminal in `C:\Users\Partridge\Desktop\KidsCare`. Initialise an empty package and install Nx + pnpm tooling. + +`bash
+cd C:\Users\Partridge\Desktop\KidsCare
+pnpm init
+pnpm add -Dw nx@^19.0.0
+pnpm add -Dw typescript@^5.4.0 @types/node@^20.0.0
+` + +**Step 2:** Replace the generated `package.json` with the workspace root manifest. +
+```json
+{

- "name": "kidscare",
- "version": "0.0.0",
- "private": true,
- "packageManager": "pnpm@9.0.0",
- "engines": { "node": ">=20" },
- "scripts": {
- "db:up": "docker compose up -d",
- "db:down": "docker compose down",
- "db:migrate": "pnpm --filter @kidscare/database prisma migrate deploy",
- "db:migrate:dev": "pnpm --filter @kidscare/database prisma migrate dev",
- "db:seed": "pnpm --filter @kidscare/database prisma db seed",
- "db:reset": "pnpm --filter @kidscare/database prisma migrate reset --force",
- "dev:api": "pnpm --filter @kidscare/api start:dev",
- "dev:admin": "pnpm --filter @kidscare/admin-web dev",
- "dev:marketing": "pnpm --filter @kidscare/marketing dev",
- "dev:mobile": "pnpm --filter @kidscare/mobile start",
- "test": "pnpm exec nx run-many --target=test",
- "test:integration": "pnpm --filter @kidscare/api test:integration",
- "lint": "pnpm exec nx run-many --target=lint",
- "format": "pnpm exec nx format:write"
- },
- "devDependencies": {
- "nx": "^19.0.0",
- "typescript": "^5.4.0",
- "@types/node": "^20.0.0"
- }
  +}
  +```
-

+**Step 3:** Create `pnpm-workspace.yaml`: +
+```yaml
+packages:

- - 'apps/*'
- - 'packages/*'
    +```
-

+**Step 4:** Create `nx.json`: +
+```json
+{

- "npmScope": "kidscare",
- "affected": { "defaultBase": "main" },
- "tasksRunnerOptions": {
- "default": {
-      "runner": "nx/tasks-runners/default",
-      "options": { "cacheableOperations": ["build", "test", "lint"] }
- }
- },
- "workspaceLayout": { "appsDir": "apps", "libsDir": "packages" }
  +}
  +```
-

+**Step 5:** Create `.gitignore`: + +`
+node_modules/
+dist/
+.nx/
+.turbo/
+*.log
+.env
+.env.local
+apps/mobile/.expo/
+apps/mobile/node_modules/
+coverage/
+.next/
+` + +**Step 6:** Create `.gitattributes` to keep line endings consistent across OSes: + +`
+* text=auto eol=lf
+*.png binary
+*.jpg binary
+*.ico binary
+` + +**Step 7:** Initialise git and create the first commit. + +`bash
+git init
+git add .
+git commit -m "chore: initialise Nx workspace with pnpm"
+` +
+--- +
+## Task 2: Base TypeScript, ESLint, Prettier, Husky + +**Files:**
+- Create: `tsconfig.base.json`
+- Create: `eslint.config.mjs`
+- Create: `.prettierrc`
+- Create: `.husky/pre-commit`
+- Create: `.lintstagedrc.json` + +**Step 1:** Create `tsconfig.base.json`: +
+```json
+{

- "compilerOptions": {
- "target": "ES2022",
- "module": "ESNext",
- "moduleResolution": "Bundler",
- "strict": true,
- "noUncheckedIndexedAccess": true,
- "exactOptionalPropertyTypes": true,
- "noImplicitOverride": true,
- "esModuleInterop": true,
- "skipLibCheck": true,
- "forceConsistentCasingInFileNames": true,
- "resolveJsonModule": true,
- "baseUrl": ".",
- "paths": {
-      "@kidscare/shared-types": ["packages/shared-types/src"],
-      "@kidscare/shared-schemas": ["packages/shared-schemas/src"],
-      "@kidscare/database": ["packages/database/src"],
-      "@kidscare/tenant-context": ["packages/tenant-context/src"]
- }
- },
- "exclude": ["node_modules", "dist", ".nx", "apps/mobile/node_modules"]
  +}
  +```
-

+**Step 2:** Install lint/format tooling. + +`bash
+pnpm add -Dw eslint@^9.0.0 @eslint/js typescript-eslint eslint-config-prettier prettier husky lint-staged
+` + +**Step 3:** Create `eslint.config.mjs`: +
+```js
+import js from '@eslint/js';
+import tseslint from 'typescript-eslint';
+import prettier from 'eslint-config-prettier'; +
+export default [

- js.configs.recommended,
- ...tseslint.configs.recommendedTypeChecked,
- {
- languageOptions: {
-      parserOptions: { projectService: true }
- },
- rules: {
-      '@typescript-eslint/no-explicit-any': 'error',
-      '@typescript-eslint/no-floating-promises': 'error',
-      '@typescript-eslint/consistent-type-imports': 'error',
-      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
- }
- },
- {
- files: ['**/\*.spec.ts', '**/_.test.ts', '\**/_.test.tsx'],
- rules: { '@typescript-eslint/no-explicit-any': 'warn' }
- },
- prettier
  +];
  +```
-

+**Step 4:** Create `.prettierrc`: +
+```json
+{

- "semi": true,
- "singleQuote": true,
- "trailingComma": "all",
- "printWidth": 100,
- "tabWidth": 2,
- "arrowParens": "always",
- "overrides": [{ "files": "*.prisma", "options": { "singleQuote": false } }]
  +}
  +```
-

+**Step 5:** Initialise Husky and create the pre-commit hook. + +`bash
+pnpm exec husky init
+` +
+Replace the contents of `.husky/pre-commit` with: + +`sh
+pnpm exec lint-staged
+` + +**Step 6:** Create `.lintstagedrc.json`: +
+```json
+{

- "*.{ts,tsx,js,mjs,json,md,prisma}": ["pnpm exec prettier --write", "pnpm exec eslint --fix"]
  +}
  +```
-

+**Step 7:** Run the formatters to confirm everything resolves. + +`bash
+pnpm exec prettier --check .
+pnpm exec eslint .
+` +
+Expected: prettier reports no diffs; eslint reports no errors (no source files yet). + +**Step 8:** Commit. + +`bash
+git add .
+git commit -m "chore: configure base TypeScript, ESLint, Prettier, Husky"
+` +
+--- +
+## Task 3: Create `packages/tenant-context` + +**Files:**
+- Create: `packages/tenant-context/project.json`
+- Create: `packages/tenant-context/package.json`
+- Create: `packages/tenant-context/tsconfig.json`
+- Create: `packages/tenant-context/src/tenant-context.ts`
+- Create: `packages/tenant-context/src/run-with-tenant.ts`
+- Create: `packages/tenant-context/src/index.ts`
+- Create: `packages/tenant-context/src/tenant-context.spec.ts` + +**Step 1:** Create `package.json`: +
+```json
+{

- "name": "@kidscare/tenant-context",
- "version": "0.0.0",
- "private": true,
- "main": "src/index.ts",
- "types": "src/index.ts",
- "scripts": { "test": "echo 'no test runner yet'" }
  +}
  +```
-

+**Step 2:** Create `tsconfig.json`: +
+```json
+{

- "extends": "../../tsconfig.base.json",
- "compilerOptions": { "outDir": "dist" },
- "include": ["src/**/*.ts"]
  +}
  +```
-

+**Step 3:** Create `project.json`: +
+```json
+{

- "name": "tenant-context",
- "$schema": "../../node_modules/nx/schemas/project-schema.json",
- "sourceRoot": "packages/tenant-context/src",
- "projectType": "library",
- "targets": {
- "lint": { "executor": "@nx/eslint:lint" },
- "test": { "executor": "@nx/jest:jest", "options": { "jestConfig": "packages/tenant-context/jest.config.ts" } }
- },
- "tags": ["scope:shared"]
  +}
  +```
-

+**Step 4:** Write the failing test first. + +`packages/tenant-context/src/tenant-context.spec.ts`: +
+```ts
+import { AsyncLocalStorage } from 'node:async_hooks';
+import { tenantContext, runWithTenant } from './index'; +
+describe('tenant-context', () => {

- it('exposes an AsyncLocalStorage instance', () => {
- expect(tenantContext).toBeInstanceOf(AsyncLocalStorage);
- });
-
- it('propagates the context value through runWithTenant', () => {
- const value = { tenantId: 't1', userId: 'u1', role: 'ADMIN' as const };
- let observed: unknown = null;
- runWithTenant(value, () => {
-      observed = tenantContext.getStore();
- });
- expect(observed).toEqual(value);
- });
-
- it('returns undefined outside any runWithTenant call', () => {
- expect(tenantContext.getStore()).toBeUndefined();
- });
  +});
  +```
-

+**Step 5:** Run the test to confirm it fails. + +`bash
+pnpm --filter @kidscare/tenant-context test
+` +
+Expected: FAIL — module `./index` not found. + +**Step 6:** Implement `tenant-context.ts`: +
+```ts
+import { AsyncLocalStorage } from 'node:async_hooks'; +
+export type TenantContextValue = {

- tenantId: string;
- userId: string;
- role: 'ADMIN' | 'TEACHER' | 'PARENT';
  +} | null;
-

+export const tenantContext = new AsyncLocalStorage<TenantContextValue>(); +``
+
+**Step 7:** Implement `run-with-tenant.ts`:
+
+``ts
+import { tenantContext, type TenantContextValue } from './tenant-context'; +
+export function runWithTenant<T>(value: TenantContextValue, fn: () => T): T {

- return tenantContext.run(value, fn);
  +}
  +```
-

+**Step 8:** Implement `index.ts`: + +`ts
+export { tenantContext, type TenantContextValue } from './tenant-context';
+export { runWithTenant } from './run-with-tenant';
+` + +**Step 9:** Set up Jest for the package (Nx will generate `jest.config.ts` on first `nx g` invocation). For now, add the bare minimum: + +`packages/tenant-context/jest.config.ts`: +
+```ts
+import type { Config } from 'jest'; +
+const config: Config = {

- preset: 'ts-jest',
- testEnvironment: 'node',
- testMatch: ['<rootDir>/src/**/*.spec.ts'],
  +};
-

+export default config; +`
+
+Install Jest deps at the workspace root:
+
+`bash
+pnpm add -Dw jest ts-jest @types/jest +`
+
+**Step 10:** Run the test. Expected: PASS.
+
+`bash
+pnpm --filter @kidscare/tenant-context test +`
+
+**Step 11:** Commit.
+
+`bash
+git add .
+git commit -m "feat(tenant-context): AsyncLocalStorage wrapper with runWithTenant helper" +``
+
+---
+
+## Task 4: Docker Compose for Postgres + Redis
+
+**Files:**
+- Create: `docker-compose.yml`
+- Create: `docker/init/01-roles.sql`
+- Create: `docker/init/02-extensions.sql`
+- Create: `.env.example`
+
+**Step 1:** Create `.env.example` at the workspace root:
+
+``
+# Migration role — schema owner, used only by prisma migrate / db push
+DATABASE_URL=postgresql://kidscare_migrator:migrator_pw@localhost:5432/kidscare?schema=public +
+# Normal application role — used by the NestJS app at runtime
+DATABASE_APP_URL=postgresql://kidscare_app:app_pw@localhost:5432/kidscare?schema=public +
+# Login-only role — read by auth module's login handler ONLY (see spec §7.5)
+DATABASE_AUTH_LOOKUP_URL=postgresql://kidscare_auth_lookup:auth_pw@localhost:5432/kidscare?schema=public +
+REDIS_URL=redis://localhost:6379
+JWT_SECRET=replace-me
+NODE_ENV=development
+PORT=3000 +``
+
+**Step 2:** Create `docker/init/02-extensions.sql`:
+
+``sql
+CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
+CREATE EXTENSION IF NOT EXISTS "pgcrypto"; +``
+
+**Step 3:** Create `docker/init/01-roles.sql`. This script runs once on first container start, after Postgres has created the `kidscare` database but before any application tables exist.
+
+``sql
+-- 02-extensions.sql runs first; roles must exist before grants apply. +
+CREATE ROLE kidscare_migrator LOGIN PASSWORD 'migrator_pw';
+CREATE ROLE kidscare_app LOGIN PASSWORD 'app_pw';
+CREATE ROLE kidscare_auth_lookup LOGIN PASSWORD 'auth_pw'; +
+GRANT CONNECT ON DATABASE kidscare TO kidscare_migrator;
+GRANT CONNECT ON DATABASE kidscare TO kidscare_app;
+GRANT CONNECT ON DATABASE kidscare TO kidscare_auth_lookup; +``
+
+**Step 4:** Create `docker-compose.yml`:
+
+``yaml
+services:

- postgres:
- image: postgres:16-alpine
- container_name: kidscare-postgres
- environment:
-      POSTGRES_USER: postgres
-      POSTGRES_PASSWORD: postgres
-      POSTGRES_DB: kidscare
- ports:
-      - '5432:5432'
- volumes:
-      - postgres-data:/var/lib/postgresql/data
-      - ./docker/init:/docker-entrypoint-initdb.d:ro
- healthcheck:
-      test: ['CMD-SHELL', 'pg_isready -U postgres']
-      interval: 5s
-      timeout: 5s
-      retries: 5
-
- redis:
- image: redis:7-alpine
- container_name: kidscare-redis
- ports:
-      - '6379:6379'
- healthcheck:
-      test: ['CMD', 'redis-cli', 'ping']
-      interval: 5s
-      timeout: 5s
-      retries: 5
-

+volumes:

- postgres-data:
  +```
-

+**Step 5:** Boot the stack and verify Postgres is healthy. + +`bash
+pnpm db:up
+docker compose ps
+` +
+Expected: both `kidscare-postgres` and `kidscare-redis` show `healthy`. + +**Step 6:** Verify the three roles exist. + +`bash
+docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "\du"
+` +
+Expected output includes `kidscare_migrator`, `kidscare_app`, `kidscare_auth_lookup`. + +**Step 7:** Verify RLS plumbing works end-to-end with a manual sanity check (this confirms the role/grant setup is correct before any tables exist): + +`bash
+docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "GRANT USAGE ON SCHEMA public TO kidscare_app, kidscare_auth_lookup;"
+` +
+Expected: `GRANT`. (Schema-level grants come before table-level grants; we grant `USAGE` here so future tables inherit by default.) + +**Step 8:** Commit. + +`bash
+git add .
+git commit -m "feat(infra): docker-compose with Postgres + Redis and three-role separation"
+` +
+--- +
+## Task 5: Create `packages/database` (Prisma Schema Skeleton) + +**Files:**
+- Create: `packages/database/package.json`
+- Create: `packages/database/project.json`
+- Create: `packages/database/tsconfig.json`
+- Create: `packages/database/jest.config.ts`
+- Create: `packages/database/prisma/schema.prisma`
+- Modify: `tsconfig.base.json` (add Prisma path if not already present) + +**Step 1:** Install Prisma. + +`bash
+pnpm add -Dw prisma@^5.10.0
+` + +**Step 2:** Create `packages/database/package.json`: +
+```json
+{

- "name": "@kidscare/database",
- "version": "0.0.0",
- "private": true,
- "main": "src/index.ts",
- "types": "src/index.ts",
- "scripts": {
- "prisma": "prisma",
- "db:seed": "prisma db seed"
- },
- "prisma": {
- "seed": "tsx prisma/seed.ts"
- },
- "dependencies": {
- "@prisma/client": "^5.10.0",
- "@kidscare/tenant-context": "workspace:*"
- },
- "devDependencies": {
- "prisma": "^5.10.0",
- "tsx": "^4.7.0"
- }
  +}
  +```
-

+**Step 3:** Create `packages/database/tsconfig.json`: +
+```json
+{

- "extends": "../../tsconfig.base.json",
- "compilerOptions": { "outDir": "dist" },
- "include": ["src/**/\*.ts", "prisma/**/*.ts"]
  +}
  +```
-

+**Step 4:** Create `packages/database/project.json`: +
+```json
+{

- "name": "database",
- "$schema": "../../node_modules/nx/schemas/project-schema.json",
- "sourceRoot": "packages/database/src",
- "projectType": "library",
- "targets": {
- "lint": { "executor": "@nx/eslint:lint" },
- "test": { "executor": "@nx/jest:jest", "options": { "jestConfig": "packages/database/jest.config.ts" } },
- "generate": { "executor": "nx:run-commands", "options": { "command": "pnpm prisma generate" } }
- },
- "tags": ["scope:shared"]
  +}
  +```
-

+**Step 5:** Create `packages/database/jest.config.ts`: +
+```ts
+import type { Config } from 'jest'; +
+const config: Config = {

- preset: 'ts-jest',
- testEnvironment: 'node',
- testMatch: ['<rootDir>/src/**/*.spec.ts'],
  +};
-

+export default config; +``
+
+**Step 6:** Create the initial schema.
+
+`packages/database/prisma/schema.prisma`:
+
+``prisma
+generator client {

- provider = "prisma-client-js"
- output = "../src/generated/client"
  +}
-

+datasource db {

- provider = "postgresql"
- url = env("DATABASE_URL")
  +}
-

+enum UserRole {

- ADMIN
- TEACHER
- PARENT
  +}
-

+enum TenantStatus {

- ACTIVE
- SUSPENDED
- DELETED
  +}
-

+model Tenant {

- id String @id @default(cuid())
- slug String @unique
- name String
- status TenantStatus @default(ACTIVE)
- createdAt DateTime @default(now())
- updatedAt DateTime @updatedAt
-
- users User[]
-
- @@map("tenants")
  +}
-

+model User {

- id String @id @default(cuid())
- tenantId String
- email String
- passwordHash String
- role UserRole
- isActive Boolean @default(true)
- lastLoginAt DateTime?
- createdAt DateTime @default(now())
- updatedAt DateTime @updatedAt
-
- tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
-
- @@unique([tenantId, email])
- @@index([tenantId])
- @@map("users")
  +}
  +```
-

+**Step 7:** Generate the Prisma client. + +`bash
+pnpm --filter @kidscare/database prisma generate
+` +
+Expected: client files generated under `packages/database/src/generated/client/`. + +**Step 8:** Commit. + +`bash
+git add .
+git commit -m "feat(database): Prisma schema skeleton with Tenant and User models"
+` +
+--- +
+## Task 6: Initial Migration with RLS, FORCE RLS, and Grants + +**Files:**
+- Create: `packages/database/prisma/migrations/0_init/migration.sql` (Prisma generates the file name; this step covers editing it) + +**Step 1:** Apply the migration in dev mode so Prisma writes the SQL for us. + +`bash
+pnpm --filter @kidscare/database prisma migrate dev --name init
+` +
+This creates `packages/database/prisma/migrations/<timestamp>_init/migration.sql`. Open it. + +**Step 2:** Append the RLS and grant statements to the end of the generated `migration.sql`. The Prisma-generated file ends with the `CREATE TABLE` blocks; append after them: +
+```sql
+-- ─── Row-Level Security ──────────────────────────────────────
+ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
+ALTER TABLE "tenants" FORCE ROW LEVEL SECURITY;
+CREATE POLICY tenant_isolation ON "tenants"

- USING (id = current_setting('app.tenant_id', true));
-

+ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
+ALTER TABLE "users" FORCE ROW LEVEL SECURITY;
+CREATE POLICY tenant_isolation ON "users"

- USING ("tenantId" = current_setting('app.tenant_id', true));
-

+-- ─── Application role grants ────────────────────────────────
+GRANT SELECT, INSERT, UPDATE, DELETE ON "tenants" TO kidscare_app;
+GRANT SELECT, INSERT, UPDATE, DELETE ON "users" TO kidscare_app; +
+-- ─── Auth lookup role grants (column-level) ──────────────────
+GRANT SELECT (id, slug) ON "tenants" TO kidscare_auth_lookup;
+GRANT SELECT (id, "tenantId", email, "passwordHash") ON "users" TO kidscare_auth_lookup; +`
+
+**Step 3:** Reset and re-apply the migration to confirm it works clean (this exercises the full path: migrator role creates tables, RLS policies apply, grants execute).
+
+`bash
+pnpm db:reset +`
+
+Expected: drop + re-create + migration apply + empty seed, no errors.
+
+**Step 4:** Verify RLS is on and policies exist.
+
+`bash
+docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "\d+ tenants" +``
+
+Expected output includes `Row security: enabled, forced` and a `Policies:` section listing `tenant_isolation`.
+
+**Step 5:** Verify grants.
+
+``bash
+docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name='users';" +``
+
+Expected: rows for `kidscare_app` with `SELECT/INSERT/UPDATE/DELETE`, and `kidscare_auth_lookup` with `SELECT`.
+
+**Step 6:** Commit.
+
+``bash
+git add .
+git commit -m "feat(database): add RLS, FORCE RLS, and three-role grants to initial migration" +``
+
+---
+
+## Task 7: Seed Script
+
+**Files:**
+- Create: `packages/database/prisma/seed.ts`
+
+**Step 1:** Write the seed.
+
+``ts
+import { PrismaClient } from '../src/generated/client';
+import * as bcrypt from 'bcryptjs'; +
+const prisma = new PrismaClient(); +
+async function main() {

- const tenant = await prisma.tenant.upsert({
- where: { slug: 'demo' },
- update: {},
- create: { slug: 'demo', name: 'Demo Kreş' },
- });
-
- const passwordHash = await bcrypt.hash('demo1234', 10);
-
- await prisma.user.upsert({
- where: { tenantId_email: { tenantId: tenant.id, email: 'admin@demo.test' } },
- update: {},
- create: {
-      tenantId: tenant.id,
-      email: 'admin@demo.test',
-      passwordHash,
-      role: 'ADMIN',
- },
- });
-
- await prisma.user.upsert({
- where: { tenantId_email: { tenantId: tenant.id, email: 'teacher@demo.test' } },
- update: {},
- create: {
-      tenantId: tenant.id,
-      email: 'teacher@demo.test',
-      passwordHash,
-      role: 'TEACHER',
- },
- });
-
- console.log(`Seeded tenant ${tenant.slug} with id ${tenant.id}`);
  +}
-

+main()

- .catch((err) => {
- console.error(err);
- process.exit(1);
- })
- .finally(() => prisma.$disconnect());
  +```
-

+**Step 2:** Install bcrypt. + +`bash
+pnpm add -Dw bcryptjs @types/bcryptjs
+` + +**Step 3:** Run the seed. + +`bash
+pnpm db:seed
+` +
+Expected output: `Seeded tenant demo with id <cuid>`. + +**Step 4:** Verify rows exist. + +`bash
+docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "SELECT slug, name FROM tenants;"
+docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "SELECT email, role FROM users;"
+` +
+Expected: one tenant (`demo`) and two users (`admin@demo.test` ADMIN, `teacher@demo.test` TEACHER). + +**Step 5:** Run the seed again to confirm idempotency. + +`bash
+pnpm db:seed
+` +
+Expected: same output, no duplicate-key errors. + +**Step 6:** Commit. + +`bash
+git add .
+git commit -m "feat(database): idempotent seed with demo tenant and two users"
+` +
+--- +
+## Task 8: Prisma Tenant Middleware + +**Files:**
+- Create: `packages/database/src/middleware/tenant.middleware.ts`
+- Create: `packages/database/src/middleware/tenant.middleware.spec.ts`
+- Create: `packages/database/src/client.ts`
+- Create: `packages/database/src/client/auth-lookup-client.ts`
+- Create: `packages/database/src/client/auth-lookup-client.spec.ts`
+- Create: `packages/database/src/index.ts` + +**Step 1:** Write the failing test for the tenant middleware. + +`packages/database/src/middleware/tenant.middleware.spec.ts`: +
+```ts
+import { PrismaClient } from '../generated/client';
+import { withTenantContext } from './tenant.middleware';
+import { runWithTenant } from '@kidscare/tenant-context'; +
+const prisma = new PrismaClient(); +
+describe('withTenantContext', () => {

- beforeAll(async () => {
- await prisma.tenant.deleteMany({});
- await prisma.user.deleteMany({});
- });
-
- afterAll(async () => {
- await prisma.$disconnect();
- });
-
- it('returns rows where tenantId matches the context', async () => {
- const a = await prisma.tenant.create({ data: { slug: 'a', name: 'A' } });
- const b = await prisma.tenant.create({ data: { slug: 'b', name: 'B' } });
- await prisma.user.create({
-      data: { tenantId: a.id, email: 'a@x', passwordHash: 'x', role: 'ADMIN' },
- });
- await prisma.user.create({
-      data: { tenantId: b.id, email: 'b@x', passwordHash: 'x', role: 'ADMIN' },
- });
-
- const extended = prisma.$extends(withTenantContext({ tenantId: a.id, userId: 'u', role: 'ADMIN' }));
- const rows = await extended.user.findMany();
-
- expect(rows).toHaveLength(1);
- expect(rows[0]?.email).toBe('a@x');
- });
-
- it('returns empty when context has no matching tenantId', async () => {
- const extended = prisma.$extends(
-      withTenantContext({ tenantId: 'does-not-exist', userId: 'u', role: 'ADMIN' }),
- );
- const rows = await extended.user.findMany();
- expect(rows).toEqual([]);
- });
  +});
  +```
-

+**Step 2:** Run the test to confirm it fails. + +`bash
+pnpm --filter @kidscare/database test
+` +
+Expected: FAIL — `tenant.middleware` not found. + +**Step 3:** Implement the middleware. + +`packages/database/src/middleware/tenant.middleware.ts`: +
+```ts
+import type { PrismaClient } from '../generated/client';
+import type { TenantContextValue } from '@kidscare/tenant-context'; +
+export function withTenantContext(ctx: NonNullable<TenantContextValue>) {

- return PrismaClient.prototype.$extends
- ? null // satisfy typing — actual implementation below
- : null;
  +}
-

+export const __withTenantContextImpl = Symbol('withTenantContext'); +
+export function withTenantContextExtends(ctx: NonNullable<TenantContextValue>) {

- // The actual implementation: open a tx, SET LOCAL the tenant id, run the query.
- // Prisma's $extends API lets us intercept queries; here we wrap every operation
- // in an interactive transaction that sets the session variable first.
- return {
- name: 'tenantContext',
- query: {
-      async $allOperations({ args, query }: any) {
-        return prisma.$transaction(async (tx) => {
-          await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${ctx.tenantId}'`);
-          return query(args);
-        });
-      },
- },
- };
  +}
  +```
-

+Replace with the cleaner, real implementation: + +`packages/database/src/middleware/tenant.middleware.ts` (final): +
+```ts
+import { Prisma } from '../generated/client';
+import type { TenantContextValue } from '@kidscare/tenant-context'; +
+type Ctx = NonNullable<TenantContextValue>; +
+export function withTenantContext(ctx: Ctx) {

- return Prisma.defineExtension({
- name: 'tenantContext',
- query: {
-      $allOperations: async ({ args, query }) => {
-        return Prisma.getExtensionContext(this).$transaction(async (tx) => {
-          await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${ctx.tenantId}'`);
-          return query(args);
-        });
-      },
- },
- });
  +}
  +```
-

+(`Prisma.defineExtension` requires importing from `@prisma/client/runtime/library`. Adjust the import if the build complains — the principle is the same.) + +**Step 4:** Implement the auth-lookup client factory. This is the only place in the codebase where `DATABASE_AUTH_LOOKUP_URL` may be referenced. + +`packages/database/src/client/auth-lookup-client.ts`: +
+```ts
+import { PrismaClient } from '../generated/client'; +
+/**

- - Creates a Prisma client bound to the auth-lookup connection.
- -
- - SECURITY: This client connects as the `kidscare_auth_lookup` role, which has
- - column-level SELECT grants on `users` and `tenants` only. It is intended for
- - the auth module's login handler. Importing or instantiating this factory
- - outside `apps/api/src/modules/auth/login.handler.ts` is a security violation.
- */
  +export function createAuthLookupClient(url: string): PrismaClient {
- return new PrismaClient({ datasources: { db: { url } } });
  +}
  +```
-

+**Step 5:** Write the test for the auth-lookup client factory. + +`packages/database/src/client/auth-lookup-client.spec.ts`: +
+```ts
+import { createAuthLookupClient } from './auth-lookup-client'; +
+describe('createAuthLookupClient', () => {

- it('returns a PrismaClient instance', () => {
- const client = createAuthLookupClient('postgresql://x:y@localhost:5432/z');
- expect(client).toBeDefined();
- expect(typeof client.$connect).toBe('function');
- void client.$disconnect();
- });
  +});
  +```
-

+**Step 6:** Implement the base client re-export and package index. + +`packages/database/src/client.ts`: + +`ts
+export { PrismaClient } from './generated/client';
+export * from './generated/client';
+` + +`packages/database/src/index.ts`: + +`ts
+export { PrismaClient } from './client';
+export { withTenantContext } from './middleware/tenant.middleware';
+export { createAuthLookupClient } from './client/auth-lookup-client';
+` + +**Step 7:** Run all package tests. + +`bash
+pnpm --filter @kidscare/database test
+` +
+Expected: PASS for both spec files. + +**Step 8:** Commit. + +`bash
+git add .
+git commit -m "feat(database): tenant context middleware and auth-lookup client factory"
+` +
+--- +
+## Task 9: `apps/api` NestJS Skeleton + +**Files:**
+- Create: `apps/api/project.json`
+- Create: `apps/api/package.json`
+- Create: `apps/api/tsconfig.json`
+- Create: `apps/api/tsconfig.app.json`
+- Create: `apps/api/nest-cli.json`
+- Create: `apps/api/jest.config.ts`
+- Create: `apps/api/src/main.ts`
+- Create: `apps/api/src/app.module.ts`
+- Create: `apps/api/src/health/health.module.ts`
+- Create: `apps/api/src/health/health.controller.ts`
+- Create: `apps/api/src/health/health.controller.spec.ts`
+- Create: `apps/api/src/common/context/tenant-context.module.ts`
+- Create: `apps/api/src/common/context/tenant-context.middleware.ts`
+- Create: `apps/api/src/common/guards/tenant.guard.ts`
+- Create: `apps/api/src/common/decorators/public.decorator.ts`
+- Create: `apps/api/src/prisma/prisma.module.ts`
+- Create: `apps/api/src/prisma/prisma.service.ts` + +**Step 1:** Install NestJS deps. + +`bash
+pnpm add -Dw @nx/nest@^19.0.0 @nestjs/core@^10.0.0 @nestjs/common@^10.0.0 @nestjs/platform-express@^10.0.0 @nestjs/config@^3.0.0 reflect-metadata rxjs
+pnpm add -Dw @nestjs/testing@^10.0.0 @types/express @types/supertest supertest
+` + +**Step 2:** Create `apps/api/package.json`: +
+```json
+{

- "name": "@kidscare/api",
- "version": "0.0.0",
- "private": true,
- "scripts": {
- "start:dev": "nest start --watch",
- "start": "nest start",
- "test": "jest",
- "test:integration": "jest --config jest.config.integration.ts --runInBand"
- },
- "dependencies": {
- "@kidscare/database": "workspace:*",
- "@kidscare/tenant-context": "workspace:*",
- "@nestjs/common": "^10.0.0",
- "@nestjs/config": "^3.0.0",
- "@nestjs/core": "^10.0.0",
- "@nestjs/platform-express": "^10.0.0",
- "reflect-metadata": "^0.2.0",
- "rxjs": "^7.8.0"
- }
  +}
  +```
-

+**Step 3:** Create `apps/api/tsconfig.json`: +
+```json
+{

- "extends": "../../tsconfig.base.json",
- "compilerOptions": {
- "module": "commonjs",
- "moduleResolution": "node",
- "experimentalDecorators": true,
- "emitDecoratorMetadata": true,
- "target": "ES2022",
- "outDir": "dist"
- },
- "include": ["src/**/*.ts"],
- "exclude": ["node_modules", "dist"]
  +}
  +```
-

+**Step 4:** Create `apps/api/project.json`: +
+```json
+{

- "name": "api",
- "$schema": "../../node_modules/nx/schemas/project-schema.json",
- "sourceRoot": "apps/api/src",
- "projectType": "application",
- "targets": {
- "serve": { "executor": "@nx/node:node", "options": { "buildTarget": "build" } },
- "build": { "executor": "@nx/node:webpack", "options": { "outputPath": "dist/apps/api" } },
- "lint": { "executor": "@nx/eslint:lint" },
- "test": { "executor": "@nx/jest:jest", "options": { "jestConfig": "apps/api/jest.config.ts" } }
- },
- "tags": ["scope:api"]
  +}
  +```
-

+**Step 5:** Create `apps/api/jest.config.ts`: +
+```ts
+import type { Config } from 'jest'; +
+const config: Config = {

- preset: 'ts-jest',
- testEnvironment: 'node',
- rootDir: '.',
- testRegex: '.*\\.spec\\.ts$',
- moduleDirectories: ['node_modules', '../../node_modules'],
  +};
-

+export default config; +``
+
+**Step 6:** Implement the public decorator.
+
+`apps/api/src/common/decorators/public.decorator.ts`:
+
+``ts
+import { SetMetadata } from '@nestjs/common'; +
+export const IS_PUBLIC_KEY = 'isPublic';
+export const Public = () => SetMetadata(IS_PUBLIC_KEY, true); +``
+
+**Step 7:** Implement the tenant guard.
+
+`apps/api/src/common/guards/tenant.guard.ts`:
+
+``ts
+import {

- CanActivate,
- ExecutionContext,
- ForbiddenException,
- Injectable,
  +} from '@nestjs/common';
  +import { Reflector } from '@nestjs/core';
  +import { tenantContext } from '@kidscare/tenant-context';
  +import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
-

+@Injectable()
+export class TenantGuard implements CanActivate {

- constructor(private readonly reflector: Reflector) {}
-
- canActivate(ctx: ExecutionContext): boolean {
- const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
-      ctx.getHandler(),
-      ctx.getClass(),
- ]);
- if (isPublic) return true;
-
- const store = tenantContext.getStore();
- if (!store) throw new ForbiddenException('Missing tenant context');
- return true;
- }
  +}
  +```
-

+**Step 8:** Implement the tenant-context middleware. + +`apps/api/src/common/context/tenant-context.middleware.ts`: +
+```ts
+import { Injectable, NestMiddleware } from '@nestjs/common';
+import { runWithTenant, type TenantContextValue } from '@kidscare/tenant-context';
+import type { Request, Response, NextFunction } from 'express'; +
+/**

- - Parses the request headers into a TenantContextValue and runs the rest of
- - the request inside that context.
- -
- - Sub-project #1 placeholder: in dev (NODE_ENV !== 'production') we accept
- - `x-tenant-id` and `x-user-id` and `x-role` headers directly. Sub-project #2
- - replaces this with a JWT parser.
- */
  +@Injectable()
  +export class TenantContextMiddleware implements NestMiddleware {
- use(req: Request, _res: Response, next: NextFunction): void {
- const value: TenantContextValue =
-      process.env.NODE_ENV === 'production'
-        ? null
-        : {
-            tenantId: (req.headers['x-tenant-id'] as string | undefined) ?? '',
-            userId: (req.headers['x-user-id'] as string | undefined) ?? '',
-            role: ((req.headers['x-role'] as string | undefined) ?? 'TEACHER') as
-              | 'ADMIN'
-              | 'TEACHER'
-              | 'PARENT',
-          };
-
- if (!value.tenantId || !value.userId) {
-      next();
-      return;
- }
- runWithTenant(value, () => next());
- }
  +}
  +```
-

+**Step 9:** Implement the tenant-context module. + +`apps/api/src/common/context/tenant-context.module.ts`: +
+```ts
+import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
+import { TenantContextMiddleware } from './tenant-context.middleware'; +
+@Module({})
+export class TenantContextModule implements NestModule {

- configure(consumer: MiddlewareConsumer): void {
- consumer.apply(TenantContextMiddleware).forRoutes('*');
- }
  +}
  +```
-

+**Step 10:** Implement the Prisma service. + +`apps/api/src/prisma/prisma.service.ts`: +
+```ts
+import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
+import { ConfigService } from '@nestjs/config';
+import { PrismaClient } from '@kidscare/database';
+import { tenantContext } from '@kidscare/tenant-context'; +
+@Injectable()
+export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

- constructor(config: ConfigService) {
- super({
-      datasources: {
-        db: { url: config.getOrThrow<string>('DATABASE_APP_URL') },
-      },
- });
- }
-
- async onModuleInit(): Promise<void> {
- await this.$connect();
- }
-
- async onModuleDestroy(): Promise<void> {
- await this.$disconnect();
- }
-
- /**
- - Returns a Prisma client extended with the current tenant context.
- - Use this from services; never call `this.user.findMany()` directly.
- */
- forTenant(): PrismaClient {
- const ctx = tenantContext.getStore();
- if (!ctx) throw new Error('No tenant context — call from inside a tenant-scoped request');
- return this.$extends({
-      query: {
-        $allOperations: async ({ args, query }) => {
-          return this.$transaction(async (tx) => {
-            await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${ctx.tenantId}'`);
-            return query(args);
-          });
-        },
-      },
- }) as unknown as PrismaClient;
- }
  +}
  +```
-

+**Step 11:** Implement the Prisma module. + +`apps/api/src/prisma/prisma.module.ts`: +
+```ts
+import { Global, Module } from '@nestjs/common';
+import { PrismaService } from './prisma.service'; +
+@Global()
+@Module({

- providers: [PrismaService],
- exports: [PrismaService],
  +})
  +export class PrismaModule {}
  +```
-

+**Step 12:** Implement the health controller. + +`apps/api/src/health/health.controller.ts`: +
+```ts
+import { Controller, Get } from '@nestjs/common';
+import { Public } from '../common/decorators/public.decorator'; +
+@Controller('health')
+export class HealthController {

- @Public()
- @Get()
- check(): { status: 'ok' } {
- return { status: 'ok' };
- }
  +}
  +```
-

+`apps/api/src/health/health.module.ts`: + +`ts
+import { Module } from '@nestjs/common';
+import { HealthController } from './health.controller';
+
+@Module({ controllers: [HealthController] })
+export class HealthModule {}
+` + +**Step 13:** Implement the app module. + +`apps/api/src/app.module.ts`: +
+```ts
+import { Module } from '@nestjs/common';
+import { ConfigModule } from '@nestjs/config';
+import { APP_GUARD } from '@nestjs/core';
+import { HealthModule } from './health/health.module';
+import { TenantContextModule } from './common/context/tenant-context.module';
+import { PrismaModule } from './prisma/prisma.module';
+import { TenantGuard } from './common/guards/tenant.guard';
+import { Reflector } from '@nestjs/core'; +
+@Module({

- imports: [
- ConfigModule.forRoot({ isGlobal: true }),
- TenantContextModule,
- PrismaModule,
- HealthModule,
- ],
- providers: [
- Reflector,
- { provide: APP_GUARD, useClass: TenantGuard },
- ],
  +})
  +export class AppModule {}
  +```
-

+**Step 14:** Implement `main.ts`. + +`apps/api/src/main.ts`: +
+```ts
+import 'reflect-metadata';
+import { NestFactory } from '@nestjs/core';
+import { AppModule } from './app.module'; +
+async function bootstrap() {

- const app = await NestFactory.create(AppModule);
- app.enableCors({ origin: ['http://localhost:5173', 'http://localhost:3001'] });
- const port = Number(process.env.PORT ?? 3000);
- await app.listen(port);
- console.log(`API listening on http://localhost:${port}`);
  +}
-

+bootstrap(); +`
+
+**Step 15:** Build to confirm everything compiles.
+
+`bash
+pnpm exec nx build api +`
+
+Expected: build succeeds.
+
+**Step 16:** Commit.
+
+`bash
+git add .
+git commit -m "feat(api): NestJS skeleton with health endpoint and tenant guard" +``
+
+---
+
+## Task 10: Health Controller Unit Test
+
+**Files:**
+- Create: `apps/api/src/health/health.controller.spec.ts`
+
+**Step 1:** Write the failing test.
+
+`apps/api/src/health/health.controller.spec.ts`:
+
+``ts
+import { HealthController } from './health.controller'; +
+describe('HealthController', () => {

- it('returns { status: "ok" }', () => {
- const controller = new HealthController();
- expect(controller.check()).toEqual({ status: 'ok' });
- });
  +});
  +```
-

+**Step 2:** Run the test. + +`bash
+pnpm --filter @kidscare/api test
+` +
+Expected: PASS (the controller already exists from Task 9). + +**Step 3:** Commit the test. + +`bash
+git add .
+git commit -m "test(api): health controller returns ok"
+` +
+--- +
+## Task 11: Tenant Isolation Integration Test + +**Files:**
+- Create: `apps/api/jest.config.integration.ts`
+- Create: `apps/api/test/setup-integration-db.ts`
+- Create: `apps/api/test/tenant-isolation.spec.ts` + +**Step 1:** Configure a separate Jest config for integration tests. + +`apps/api/jest.config.integration.ts`: +
+```ts
+import type { Config } from 'jest';
+import baseConfig from './jest.config'; +
+const config: Config = {

- ...baseConfig,
- testRegex: '.*\\.integration\\.spec\\.ts$|apps/api/test/.*\\.spec\\.ts$',
- testTimeout: 30000,
- setupFilesAfterEach: ['<rootDir>/test/setup-integration-db.ts'],
  +};
-

+export default config; +``
+
+**Step 2:** Add the integration test setup script.
+
+`apps/api/test/setup-integration-db.ts`:
+
+``ts
+import { PrismaClient } from '@kidscare/database'; +
+const prisma = new PrismaClient({

- datasources: { db: { url: process.env.DATABASE_URL ?? '' } },
  +});
-

+beforeEach(async () => {

- // Truncate in dependency order. Cascade would also work but explicit is safer.
- await prisma.user.deleteMany({});
- await prisma.tenant.deleteMany({});
  +});
-

+afterAll(async () => {

- await prisma.$disconnect();
  +});
-

+export {}; +``
+
+**Step 3:** Write the integration test.
+
+`apps/api/test/tenant-isolation.spec.ts`:
+
+``ts
+import { PrismaClient } from '@kidscare/database';
+import { runWithTenant } from '@kidscare/tenant-context';
+import { createAuthLookupClient } from '@kidscare/database';
+import * as bcrypt from 'bcryptjs'; +
+const prisma = new PrismaClient({

- datasources: { db: { url: process.env.DATABASE_URL ?? '' } },
  +});
-

+async function seedTwoTenants() {

- const a = await prisma.tenant.create({ data: { slug: 'a', name: 'A' } });
- const b = await prisma.tenant.create({ data: { slug: 'b', name: 'B' } });
- const hash = await bcrypt.hash('x', 4);
- await prisma.user.create({
- data: { tenantId: a.id, email: 'a@x', passwordHash: hash, role: 'ADMIN' },
- });
- await prisma.user.create({
- data: { tenantId: b.id, email: 'b@x', passwordHash: hash, role: 'ADMIN' },
- });
- return { a, b };
  +}
-

+describe('tenant isolation (RLS + AsyncLocalStorage)', () => {

- it('within-tenant read returns only that tenant\'s rows', async () => {
- const { a } = await seedTwoTenants();
- let rows: { email: string }[] = [];
- await runWithTenant(
-      { tenantId: a.id, userId: 'u', role: 'ADMIN' },
-      async () => {
-        const tx = prisma.$extends({
-          query: {
-            $allOperations: async ({ args, query }) =>
-              prisma.$transaction(async (txInner) => {
-                await txInner.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${a.id}'`);
-                return query(args);
-              }),
-          },
-        });
-        rows = await tx.user.findMany({ select: { email: true } });
-      },
- );
- expect(rows.map((r) => r.email)).toEqual(['a@x']);
- });
-
- it('cross-tenant read returns empty', async () => {
- const { a, b } = await seedTwoTenants();
- let rows: { email: string }[] = [];
- await runWithTenant(
-      { tenantId: a.id, userId: 'u', role: 'ADMIN' },
-      async () => {
-        const tx = prisma.$extends({
-          query: {
-            $allOperations: async ({ args, query }) =>
-              prisma.$transaction(async (txInner) => {
-                await txInner.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${a.id}'`);
-                return query(args);
-              }),
-          },
-        });
-        // Try to read user from tenant B by id — must be blocked.
-        rows = await tx.user.findMany({ where: { tenantId: b.id }, select: { email: true } });
-      },
- );
- expect(rows).toEqual([]);
- });
-
- it('login lookup via auth-lookup connection finds cross-tenant user', async () => {
- const { a } = await seedTwoTenants();
- const lookup = createAuthLookupClient(process.env.DATABASE_AUTH_LOOKUP_URL ?? '');
- try {
-      const user = await lookup.user.findFirst({ where: { email: 'a@x' } });
-      expect(user?.tenantId).toBe(a.id);
- } finally {
-      await lookup.$disconnect();
- }
- });
-
- it('auth-lookup role cannot INSERT into users', async () => {
- const lookup = createAuthLookupClient(process.env.DATABASE_AUTH_LOOKUP_URL ?? '');
- try {
-      await expect(
-        lookup.user.create({
-          data: { tenantId: 'x', email: 'evil@x', passwordHash: 'x', role: 'ADMIN' },
-        }),
-      ).rejects.toThrow();
- } finally {
-      await lookup.$disconnect();
- }
- });
  +});
  +```
-

+**Step 4:** Run the integration test. + +`bash
+pnpm test:integration
+` +
+Expected: all 4 cases PASS. + +**Step 5:** Commit. + +`bash
+git add .
+git commit -m "test(api): tenant isolation integration test for RLS + AsyncLocalStorage"
+` +
+--- +
+## Task 12: `apps/admin-web` (Vite + React) Skeleton + +**Files:**
+- Create: `apps/admin-web/project.json`
+- Create: `apps/admin-web/package.json`
+- Create: `apps/admin-web/tsconfig.json`
+- Create: `apps/admin-web/vite.config.ts`
+- Create: `apps/admin-web/index.html`
+- Create: `apps/admin-web/src/main.tsx`
+- Create: `apps/admin-web/src/App.tsx`
+- Create: `apps/admin-web/src/App.test.tsx` + +**Step 1:** Install Vite + React deps. + +`bash
+pnpm add -Dw vite@^5.0.0 @vitejs/plugin-react@^4.0.0 react@^18.0.0 react-dom@^18.0.0 @types/react @types/react-dom
+pnpm add -Dw vitest@^1.0.0 @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
+` + +**Step 2:** Create `apps/admin-web/package.json`: +
+```json
+{

- "name": "@kidscare/admin-web",
- "version": "0.0.0",
- "private": true,
- "type": "module",
- "scripts": {
- "dev": "vite",
- "build": "vite build",
- "test": "vitest run"
- },
- "dependencies": {
- "react": "^18.0.0",
- "react-dom": "^18.0.0"
- }
  +}
  +```
-

+**Step 3:** Create `apps/admin-web/tsconfig.json`: +
+```json
+{

- "extends": "../../tsconfig.base.json",
- "compilerOptions": {
- "jsx": "react-jsx",
- "module": "ESNext",
- "moduleResolution": "Bundler",
- "noEmit": true,
- "types": ["vitest/globals", "@testing-library/jest-dom"]
- },
- "include": ["src"]
  +}
  +```
-

+**Step 4:** Create `apps/admin-web/vite.config.ts`: +
+```ts
+import { defineConfig } from 'vite';
+import react from '@vitejs/plugin-react'; +
+export default defineConfig({

- plugins: [react()],
- server: { port: 5173 },
- test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.ts'] },
  +});
  +```
-

+**Step 5:** Create `apps/admin-web/src/test-setup.ts`: + +`ts
+import '@testing-library/jest-dom/vitest';
+` + +**Step 6:** Create `apps/admin-web/src/App.tsx`: +
+```tsx
+export function App() {

- return (
- <main>
-      <h1>KidsCare Admin</h1>
-      <p>Login, tenant management, and student records will land here.</p>
- </main>
- );
  +}
  +```
-

+**Step 7:** Create `apps/admin-web/src/main.tsx`: +
+```tsx
+import React from 'react';
+import ReactDOM from 'react-dom/client';
+import { App } from './App'; +
+ReactDOM.createRoot(document.getElementById('root')!).render(

- <React.StrictMode>
- <App />
- </React.StrictMode>,
  +);
  +```
-

+**Step 8:** Create `apps/admin-web/index.html`: +
+```html +<!doctype html> +<html lang="tr">

- <head>
- <meta charset="UTF-8" />
- <meta name="viewport" content="width=device-width, initial-scale=1.0" />
- <title>KidsCare Admin</title>
- </head>
- <body>
- <div id="root"></div>
- <script type="module" src="/src/main.tsx"></script>
- </body>

+</html> +``
+
+**Step 9:** Create `apps/admin-web/src/App.test.tsx`:
+
+``tsx
+import { render, screen } from '@testing-library/react';
+import { App } from './App'; +
+describe('App', () => {

- it('renders the heading', () => {
- render(<App />);
- expect(screen.getByRole('heading', { name: /kidscare admin/i })).toBeInTheDocument();
- });
  +});
  +```
-

+**Step 10:** Create `apps/admin-web/project.json`: +
+```json
+{

- "name": "admin-web",
- "$schema": "../../node_modules/nx/schemas/project-schema.json",
- "sourceRoot": "apps/admin-web/src",
- "projectType": "application",
- "targets": {
- "dev": { "executor": "@nx/vite:dev-server", "options": { "buildTarget": "build" } },
- "build": { "executor": "@nx/vite:build", "options": { "outputPath": "dist/apps/admin-web" } },
- "lint": { "executor": "@nx/eslint:lint" },
- "test": { "executor": "@nx/vite:test" }
- },
- "tags": ["scope:web"]
  +}
  +```
-

+**Step 11:** Run the test. + +`bash
+pnpm --filter @kidscare/admin-web test
+` +
+Expected: PASS. + +**Step 12:** Commit. + +`bash
+git add .
+git commit -m "feat(admin-web): Vite + React skeleton with placeholder landing"
+` +
+--- +
+## Task 13: `apps/marketing` (Next.js) Skeleton + +**Files:**
+- Create: `apps/marketing/project.json`
+- Create: `apps/marketing/package.json`
+- Create: `apps/marketing/tsconfig.json`
+- Create: `apps/marketing/next.config.mjs`
+- Create: `apps/marketing/app/layout.tsx`
+- Create: `apps/marketing/app/page.tsx` + +**Step 1:** Install Next.js. + +`bash
+pnpm add -Dw next@^14.0.0 react@^18.0.0 react-dom@^18.0.0 @types/react @types/react-dom
+` + +**Step 2:** Create `apps/marketing/package.json`: +
+```json
+{

- "name": "@kidscare/marketing",
- "version": "0.0.0",
- "private": true,
- "scripts": {
- "dev": "next dev -p 3001",
- "build": "next build"
- },
- "dependencies": {
- "next": "^14.0.0",
- "react": "^18.0.0",
- "react-dom": "^18.0.0"
- }
  +}
  +```
-

+**Step 3:** Create `apps/marketing/tsconfig.json`: +
+```json
+{

- "extends": "../../tsconfig.base.json",
- "compilerOptions": {
- "jsx": "preserve",
- "module": "ESNext",
- "moduleResolution": "Bundler",
- "noEmit": true,
- "incremental": true,
- "plugins": [{ "name": "next" }]
- },
- "include": ["next-env.d.ts", "**/\*.ts", "**/_.tsx", ".next/types/\**/_.ts"],
- "exclude": ["node_modules"]
  +}
  +```
-

+**Step 4:** Create `apps/marketing/next.config.mjs`: + +`js
+/** @type {import('next').NextConfig} */
+const config = {};
+export default config;
+` + +**Step 5:** Create `apps/marketing/app/layout.tsx`: +
+```tsx
+import type { ReactNode } from 'react'; +
+export const metadata = {

- title: 'KidsCare',
- description: 'Çocuğunuzun kreş günü, tek bir uygulamada.',
  +};
-

+export default function RootLayout({ children }: { children: ReactNode }) {

- return (
- <html lang="tr">
-      <body>{children}</body>
- </html>
- );
  +}
  +```
-

+**Step 6:** Create `apps/marketing/app/page.tsx`: +
+```tsx
+export default function Home() {

- return (
- <main style={{ fontFamily: 'system-ui', padding: '4rem 2rem', maxWidth: 720, margin: '0 auto' }}>
-      <h1>KidsCare</h1>
-      <p>Çocuğunuzun kreş günü, tek bir uygulamada.</p>
- </main>
- );
  +}
  +```
-

+**Step 7:** Create `apps/marketing/project.json`: +
+```json
+{

- "name": "marketing",
- "$schema": "../../node_modules/nx/schemas/project-schema.json",
- "sourceRoot": "apps/marketing",
- "projectType": "application",
- "targets": {
- "dev": { "executor": "@nx/next:dev", "options": { "port": 3001 } },
- "build": { "executor": "@nx/next:build", "options": { "outputPath": "dist/apps/marketing" } },
- "lint": { "executor": "@nx/eslint:lint" }
- },
- "tags": ["scope:web"]
  +}
  +```
-

+**Step 8:** Build to confirm. + +`bash
+pnpm exec nx build marketing
+` +
+Expected: build succeeds. + +**Step 9:** Commit. + +`bash
+git add .
+git commit -m "feat(marketing): Next.js skeleton with placeholder landing"
+` +
+--- +
+## Task 14: `apps/mobile` (Expo) Skeleton + +**Files:**
+- Create: `apps/mobile/package.json`
+- Create: `apps/mobile/tsconfig.json`
+- Create: `apps/mobile/app.json`
+- Create: `apps/mobile/App.tsx`
+- Create: `apps/mobile/babel.config.js`
+- Create: `apps/mobile/.gitignore` (overlay — Expo needs its own ignore rules) + +**Step 1:** Create `apps/mobile/package.json`: +
+```json
+{

- "name": "@kidscare/mobile",
- "version": "0.0.0",
- "private": true,
- "main": "node_modules/expo/AppEntry.js",
- "scripts": {
- "start": "expo start"
- },
- "dependencies": {
- "expo": "~51.0.0",
- "expo-status-bar": "~1.12.0",
- "react": "18.2.0",
- "react-native": "0.74.0"
- },
- "devDependencies": {
- "@babel/core": "^7.20.0",
- "@types/react": "~18.2.0",
- "typescript": "^5.4.0"
- }
  +}
  +```
-

+**Step 2:** Create `apps/mobile/tsconfig.json`: +
+```json
+{

- "extends": "../../tsconfig.base.json",
- "compilerOptions": {
- "jsx": "react-native",
- "moduleResolution": "node",
- "noEmit": true,
- "types": ["react-native"]
- },
- "include": ["**/\*.ts", "**/*.tsx"]
  +}
  +```
-

+**Step 3:** Create `apps/mobile/babel.config.js`: +
+```js
+module.exports = function (api) {

- api.cache(true);
- return {
- presets: ['babel-preset-expo'],
- };
  +};
  +```
-

+**Step 4:** Create `apps/mobile/app.json`: +
+```json
+{

- "expo": {
- "name": "KidsCare",
- "slug": "kidscare",
- "version": "0.0.0",
- "orientation": "portrait",
- "userInterfaceStyle": "light",
- "newArchEnabled": false,
- "ios": { "supportsTablet": true, "bundleIdentifier": "com.kidscare.app" },
- "android": { "package": "com.kidscare.app" }
- }
  +}
  +```
-

+**Step 5:** Create `apps/mobile/App.tsx`: +
+```tsx
+import { StatusBar } from 'expo-status-bar';
+import { Text, View } from 'react-native'; +
+export default function App() {

- return (
- <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
-      <Text>KidsCare</Text>
-      <StatusBar style="auto" />
- </View>
- );
  +}
  +```
-

+**Step 6:** Add an overlay `.gitignore` for Expo's generated directories: + +`apps/mobile/.gitignore`: + +`
+node_modules/
+.expo/
+dist/
+ios/
+android/
+` + +**Step 7:** Verify the app boots (does not require a device; Expo CLI will print a QR code and confirm the bundle compiles). + +`bash
+pnpm --filter @kidscare/mobile start --no-dev --minify
+` +
+Expected: bundle compiles without TypeScript errors. Press `Ctrl+C` to stop after the first successful bundle. + +**Step 8:** Commit. + +`bash
+git add .
+git commit -m "feat(mobile): Expo skeleton with placeholder screen"
+` +
+--- +
+## Task 15: `packages/shared-types` and `packages/shared-schemas` + +**Files:**
+- Create: `packages/shared-types/package.json`
+- Create: `packages/shared-types/tsconfig.json`
+- Create: `packages/shared-types/src/tenant.ts`
+- Create: `packages/shared-types/src/user.ts`
+- Create: `packages/shared-types/src/index.ts`
+- Create: `packages/shared-schemas/package.json`
+- Create: `packages/shared-schemas/tsconfig.json`
+- Create: `packages/shared-schemas/src/tenant.schema.ts`
+- Create: `packages/shared-schemas/src/user.schema.ts`
+- Create: `packages/shared-schemas/src/index.ts`
+- Create: `packages/shared-schemas/src/tenant.schema.spec.ts` + +**Step 1:** Install Zod. + +`bash
+pnpm add -Dw zod@^3.22.0
+` + +**Step 2:** Create `packages/shared-types/package.json`: +
+```json
+{

- "name": "@kidscare/shared-types",
- "version": "0.0.0",
- "private": true,
- "main": "src/index.ts",
- "types": "src/index.ts"
  +}
  +```
-

+**Step 3:** Create `packages/shared-types/tsconfig.json`: +
+```json
+{

- "extends": "../../tsconfig.base.json",
- "compilerOptions": { "outDir": "dist" },
- "include": ["src/**/*.ts"]
  +}
  +```
-

+**Step 4:** Create `packages/shared-types/src/tenant.ts`: +
+```ts
+export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED'; +
+export type Tenant = {

- id: string;
- slug: string;
- name: string;
- status: TenantStatus;
- createdAt: string;
- updatedAt: string;
  +};
-

+export type TenantSummary = Pick<Tenant, 'id' | 'slug' | 'name'>; +``
+
+**Step 5:** Create `packages/shared-types/src/user.ts`:
+
+``ts
+export type UserRole = 'ADMIN' | 'TEACHER' | 'PARENT'; +
+export type User = {

- id: string;
- tenantId: string;
- email: string;
- role: UserRole;
- isActive: boolean;
- lastLoginAt: string | null;
- createdAt: string;
- updatedAt: string;
  +};
  +```
-

+**Step 6:** Create `packages/shared-types/src/index.ts`: + +`ts
+export * from './tenant';
+export * from './user';
+` + +**Step 7:** Create `packages/shared-schemas/package.json`: +
+```json
+{

- "name": "@kidscare/shared-schemas",
- "version": "0.0.0",
- "private": true,
- "main": "src/index.ts",
- "types": "src/index.ts",
- "dependencies": {
- "@kidscare/shared-types": "workspace:*",
- "zod": "^3.22.0"
- }
  +}
  +```
-

+**Step 8:** Create `packages/shared-schemas/tsconfig.json`: +
+```json
+{

- "extends": "../../tsconfig.base.json",
- "compilerOptions": { "outDir": "dist" },
- "include": ["src/**/*.ts"]
  +}
  +```
-

+**Step 9:** Create the test first. + +`packages/shared-schemas/src/tenant.schema.spec.ts`: +
+```ts
+import { tenantInputSchema } from './tenant.schema'; +
+describe('tenantInputSchema', () => {

- it('accepts a valid slug and name', () => {
- expect(() =>
-      tenantInputSchema.parse({ slug: 'demo-kres', name: 'Demo Kreş' }),
- ).not.toThrow();
- });
-
- it('rejects a slug with uppercase letters', () => {
- expect(() =>
-      tenantInputSchema.parse({ slug: 'Demo-Kres', name: 'Demo Kreş' }),
- ).toThrow();
- });
-
- it('rejects a name shorter than 2 chars', () => {
- expect(() =>
-      tenantInputSchema.parse({ slug: 'demo', name: 'D' }),
- ).toThrow();
- });
  +});
  +```
-

+**Step 10:** Implement the tenant schema. + +`packages/shared-schemas/src/tenant.schema.ts`: +
+```ts
+import { z } from 'zod'; +
+export const tenantInputSchema = z.object({

- slug: z
- .string()
- .min(2)
- .max(64)
- .regex(/^[a-z0-9-]+$/),
- name: z.string().min(2).max(128),
  +});
-

+export type TenantInput = z.infer<typeof tenantInputSchema>; +``
+
+**Step 11:** Create the user schema.
+
+`packages/shared-schemas/src/user.schema.ts`:
+
+``ts
+import { z } from 'zod'; +
+export const userRoleSchema = z.enum(['ADMIN', 'TEACHER', 'PARENT']); +
+export const userCreateSchema = z.object({

- tenantId: z.string().cuid(),
- email: z.string().email(),
- password: z.string().min(8).max(128),
- role: userRoleSchema,
  +});
-

+export type UserCreate = z.infer<typeof userCreateSchema>; +``
+
+**Step 12:** Create the shared-schemas barrel.
+
+`packages/shared-schemas/src/index.ts`:
+
+``ts
+export * from './tenant.schema';
+export * from './user.schema'; +`
+
+**Step 13:** Run the test.
+
+`bash
+pnpm --filter @kidscare/shared-schemas test +``
+
+Expected: PASS (after configuring Jest for the package — mirror Task 3 Step 9's `jest.config.ts`).
+
+**Step 14:** Commit.
+
+``bash
+git add .
+git commit -m "feat(shared): shared-types and shared-schemas with Tenant and User" +``
+
+---
+
+## Task 16: README + End-to-End Verification
+
+**Files:**
+- Create: `README.md`
+
+**Step 1:** Write the README.
+
+`README.md`:
+
+````markdown
+# KidsCare
+
+Çoklu kreşe satılabilir multi-tenant SaaS. Mimari kararlar: `kres-uygulamasi-teknoloji-karar-raporu.md`. Proje kuralları: `CLAUDE.md`. Sub-project #1 (altyapı) tasarımı: `docs/superpowers/specs/2026-09-13-infrastructure-layer-design.md`.
+
+## Gereksinimler
+
+- Node 20 LTS
+- pnpm 9+
+- Docker Desktop (Windows: WSL2 backend önerilir)
+
+## Yerel geliştirme
+
+``bash
+pnpm install
+pnpm db:up # Postgres + Redis ayağa kalkar
+cp .env.example .env # gerekirse düzenle
+pnpm db:migrate # tabloları ve RLS politikalarını uygular
+pnpm db:seed # demo tenant + 2 kullanıcı
+pnpm dev:api # NestJS API (port 3000)
+pnpm dev:admin # admin paneli (port 5173)
+pnpm dev:marketing # pazarlama sitesi (port 3001)
+pnpm dev:mobile # Expo (QR kod ile telefondan açılır) +`
+
+## Test
+
+`bash
+pnpm test # tüm birim testleri
+pnpm test:integration # tenant izolasyon integration testi
+pnpm lint # ESLint +``
+
+## Mimari notlar
+
+- Üç Postgres rolü vardır: `kidscare_migrator` (DDL), `kidscare_app` (uygulama runtime), `kidscare_auth_lookup` (yalnızca login). `DATABASE_AUTH_LOOKUP_URL`'i yalnızca auth modülünün login handler'ı okuyabilir.
+- Tenant izolasyonu Postgres RLS + AsyncLocalStorage + Prisma middleware ile uygulanır. Üç katman birlikte çalışır; biri tek başına yeterli değildir.
+- Migration'lar atomiktir: yeni tenant-scoped tablo, RLS politikası ve `GRANT` aynı SQL dosyasında bulunur.
+````
+
+**Step 2:** Run the full acceptance check.
+
+``bash
+pnpm install
+pnpm db:up
+sleep 5
+pnpm db:migrate
+pnpm db:seed
+pnpm dev:api &
+sleep 5
+curl http://localhost:3000/health +``
+
+Expected: `{"status":"ok"}`.
+
+``bash
+kill %1 +`
+
+**Step 3:** Run the integration test one more time to confirm.
+
+`bash
+pnpm test:integration +`
+
+Expected: all 4 cases PASS.
+
+**Step 4:** Run lint.
+
+`bash
+pnpm lint +`
+
+Expected: no errors.
+
+**Step 5:** Commit.
+
+`bash
+git add .
+git commit -m "docs: README with local setup and architectural notes" +``
+
+---
+
+## Spec Coverage Check
+
+Running the writing-plans self-review against the spec:
+
+| Spec section | Covered by |
+|---|---|
+| §3 Architecture overview | Implicit — workspace layout created in Tasks 1, 5, 12–15 |
+| §4 Repository layout | Tasks 1, 3, 5, 9, 12, 13, 14, 15 |
+| §5 Tech stack | Tasks 1, 9, 12, 13, 14 |
+| §6 DB schema + RLS + 3-role | Tasks 5, 6, 7 |
+| §7.1 AsyncLocalStorage context | Task 3 |
+| §7.2 NestJS middleware + guard + @Public | Task 9 |
+| §7.3 Prisma middleware | Task 8 |
+| §7.4 Request lifecycle | Implicit — wired through Tasks 9 + 11 |
+| §7.5 Auth Lookup Connection | Tasks 6 (grants), 8 (factory) |
+| §8 App skeletons | Tasks 9, 12, 13, 14 |
+| §9 tsconfig + ESLint + Prettier + Husky | Task 2 |
+| §10 Testing (Jest + tenant-isolation integration) | Tasks 10, 11 |
+| §11 Environment & Secrets (.env.example, three URLs) | Task 4 |
+| §12 Acceptance criteria 1–12 | Task 16 verification step |
+| §13 Risks (mitigations) | Distributed across tasks (Docker roles in Task 4, Expo in Task 14, generated client committed in Task 5, etc.) |
+| §14 Out of scope | Confirmed — no auth, no feature modules |
+
+No gaps found.
+
+---
+
+## Ready to Execute
+
+Plan complete and saved to `docs/superpowers/plans/2026-09-13-infrastructure-layer.md`. Two execution options:
+
+1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
+2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.
+
+Which approach?
diff --git a/docs/superpowers/specs/2026-09-13-infrastructure-layer-design.md b/docs/superpowers/specs/2026-09-13-infrastructure-layer-design.md
new file mode 100644
index 0000000..d2fb2f7
--- /dev/null
+++ b/docs/superpowers/specs/2026-09-13-infrastructure-layer-design.md
@@ -0,0 +1,586 @@
+# KidsCare — Infrastructure Layer Design
+
+**Date:** 2026-09-13
+**Status:** Approved (brainstorming complete)
+**Scope:** Sub-project #1 of 7 in the KidsCare bootstrap plan
+**Related:** `../kres-uygulamasi-teknoloji-karar-raporu.md`, `../../CLAUDE.md`
+
+---
+
+## 1. Purpose
+
+Establish the monorepo skeleton, database layer, tenant-isolation infrastructure, and minimal app skeletons needed before any feature module can be built. After this sub-project, the following will work end-to-end:
+
+- `pnpm install` resolves all workspace dependencies
+- `docker compose up -d` starts Postgres + Redis locally
+- `pnpm db:migrate` applies the schema to Postgres
+- `pnpm dev:api` starts the NestJS API; `GET /health` returns 200
+- `pnpm dev:admin`, `pnpm dev:marketing`, `pnpm dev:mobile` start the corresponding apps
+- A tenant-isolation test proves the guard and RLS pipeline work
+
+Feature modules (auth, tenants, students, payments, etc.) are out of scope and will be planned separately.
+
+---
+
+## 2. Non-Goals
+
+- No authentication flow yet (sub-project #2)
+- No business modules (students, payments, messages, attendance — later)
+- No CI/CD pipelines (added when first PR lands)
+- No production deployment configuration
+- No Cloudflare R2, iyzico, or FCM integration (later)
+- No UI design work on admin/marketing/mobile (placeholders only)
+
+---
+
+## 3. Architecture Overview
+
+``

-                ┌──────────────────────────────────────────┐
-                │              Nx Workspace               │
-                │  pnpm + TypeScript strict + ESLint flat │
-                └──────────────────────────────────────────┘
-                                    │
-        ┌───────────────────┬───────┴────────┬─────────────────────┐
-        ▼                   ▼                ▼                     ▼
- apps/api (NestJS) apps/admin-web apps/marketing apps/mobile
-                                         (Next.js)            (Expo)
-        │                   │                │                     │
-        └───────────────────┴────────────────┴─────────────────────┘
-                                    │
-                ┌───────────────────┼───────────────────┐
-                ▼                   ▼                   ▼
-        packages/database    packages/shared-     packages/shared-
-        (Prisma schema +    types (DTOs)         schemas (Zod)
-         generated client)
-                │
-                ▼
-        docker-compose: postgres:16 + redis:7
-                │
-                ▼
-        Postgres RLS policies on every tenant-scoped table

+``
+
+**Request flow (sub-project #1 demonstration):**
+
+1. `GET /health` arrives at NestJS
+2. `TenantContextMiddleware` reads JWT (placeholder — empty for /health) and sets AsyncLocalStorage context
+3. `TenantGuard` checks the context; on `/health` it short-circuits
+4. Controller returns `{ status: 'ok' }`
+5. (When feature modules land) Repository calls Prisma, which uses the middleware to `SET LOCAL app.tenant_id = '<ctx>'`, which RLS policies enforce
+
+---
+
+## 4. Repository Layout
+
+``
+kidscare/
+├── apps/
+│ ├── api/
+│ │ ├── src/
+│ │ │ ├── main.ts
+│ │ │ ├── app.module.ts
+│ │ │ ├── health/
+│ │ │ │ ├── health.module.ts
+│ │ │ │ ├── health.controller.ts
+│ │ │ │ └── health.controller.spec.ts
+│ │ │ └── common/
+│ │ │ ├── context/
+│ │ │ │ ├── tenant-context.service.ts
+│ │ │ │ ├── tenant-context.middleware.ts
+│ │ │ │ └── tenant-context.module.ts
+│ │ │ └── guards/
+│ │ │ └── tenant.guard.ts
+│ │ ├── project.json (Nx)
+│ │ └── tsconfig.json
+│ ├── admin-web/
+│ │ ├── src/main.tsx
+│ │ ├── src/App.tsx
+│ │ ├── project.json
+│ │ └── tsconfig.json
+│ ├── marketing/
+│ │ ├── app/page.tsx
+│ │ ├── project.json
+│ │ └── tsconfig.json
+│ └── mobile/
+│ ├── app.json (Expo)
+│ ├── App.tsx
+│ ├── package.json (Expo)
+│ └── tsconfig.json
+├── packages/
+│ ├── database/
+│ │ ├── prisma/
+│ │ │ ├── schema.prisma
+│ │ │ ├── seed.ts
+│ │ │ └── migrations/ (generated)
+│ │ ├── src/
+│ │ │ ├── client.ts (re-exports generated client)
+│ │ │ ├── middleware/
+│ │ │ │ └── tenant.middleware.ts
+│ │ │ └── index.ts
+│ │ ├── project.json
+│ │ └── package.json
+│ ├── tenant-context/ (new in this sub-project — see §7.1)
+│ │ ├── src/
+│ │ │ ├── tenant-context.ts
+│ │ │ ├── run-with-tenant.ts
+│ │ │ └── index.ts
+│ │ ├── project.json
+│ │ └── package.json
+│ ├── shared-types/
+│ │ ├── src/
+│ │ │ ├── tenant.ts
+│ │ │ ├── user.ts
+│ │ │ └── index.ts
+│ │ ├── project.json
+│ │ └── package.json
+│ └── shared-schemas/
+│ ├── src/
+│ │ ├── tenant.schema.ts
+│ │ ├── user.schema.ts
+│ │ └── index.ts
+│ ├── project.json
+│ └── package.json
+├── docker-compose.yml
+├── nx.json
+├── package.json (workspace root)
+├── pnpm-workspace.yaml
+├── tsconfig.base.json
+├── .editorconfig
+├── .eslintrc.cjs (or eslint.config.mjs for flat)
+├── .prettierrc
+├── .husky/
+│ └── pre-commit
+└── .lintstagedrc.json +``
+
+---
+
+## 5. Technology Choices (Decided)
+
+| Concern | Choice | Reason |
+|---|---|---|
+| Monorepo tool | **Nx** | Per user decision; stronger dependency graph than Turborepo |
+| Package manager | **pnpm** | Disk-efficient, native workspace support |
+| Backend framework | NestJS 10 | Already in CLAUDE.md; modularity enforced |
+| Admin panel | React 18 + Vite | Already in CLAUDE.md |
+| Marketing | Next.js 14 (app router) | Already in decision report |
+| Mobile | Expo SDK 51 | Already in decision report |
+| ORM | Prisma | Already in decision report |
+| Database | Postgres 16 | RLS support, JSONB for student passport later |
+| Tenant isolation | **Postgres RLS + AsyncLocalStorage** | Defense in depth |
+| Backend tests | Jest | NestJS default |
+| Frontend tests | Vitest | Native Vite integration |
+| Lint | ESLint flat config | Nx default + custom rules |
+| Format | Prettier | Nx default |
+| Git hooks | Husky + lint-staged | Pre-commit lint+format |
+
+---
+
+## 6. Database Schema (Sub-project #1)
+
+`packages/database/prisma/schema.prisma`:
+
+``prisma
+generator client {

- provider = "prisma-client-js"
- output = "../src/generated/client"
  +}
-

+datasource db {

- provider = "postgresql"
- url = env("DATABASE_URL")
  +}
-

+enum UserRole {

- ADMIN // tenant admin
- TEACHER
- PARENT
  +}
-

+enum TenantStatus {

- ACTIVE
- SUSPENDED
- DELETED
  +}
-

+model Tenant {

- id String @id @default(cuid())
- slug String @unique
- name String
- status TenantStatus @default(ACTIVE)
- createdAt DateTime @default(now())
- updatedAt DateTime @updatedAt
-
- users User[]
-
- @@map("tenants")
  +}
-

+model User {

- id String @id @default(cuid())
- tenantId String
- email String
- passwordHash String
- role UserRole
- isActive Boolean @default(true)
- lastLoginAt DateTime?
- createdAt DateTime @default(now())
- updatedAt DateTime @updatedAt
-
- tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
-
- @@unique([tenantId, email]) // email unique per tenant
- @@index([tenantId])
- @@map("users")
  +}
  +```
-

+**RLS policies** (applied via migration SQL): +
+```sql
+-- tenants: only the row matching the session tenant_id is visible
+ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
+ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
+CREATE POLICY tenant_isolation ON tenants

- USING (id = current_setting('app.tenant_id', true));
-

+-- users: scoped to tenant_id in session
+ALTER TABLE users ENABLE ROW LEVEL SECURITY;
+ALTER TABLE users FORCE ROW LEVEL SECURITY;
+CREATE POLICY tenant_isolation ON users

- USING ("tenantId" = current_setting('app.tenant_id', true));
  +```
-

+`FORCE ROW LEVEL SECURITY` is required so that RLS applies even to the table owner. Without it, the migrator role would bypass all policies and a misconfigured connection could leak data. + +**Postgres role separation** (applied by `docker-compose.yml` init script `init/01-roles.sql`): +
+Three roles, each with minimal privileges: +
+- `kidscare_migrator` — owner of the schema; used **only** by `prisma migrate` and `prisma db push`. Can DDL, can CRUD all rows. Connects with `DATABASE_URL`.
+- `kidscare_app` — normal application role. Granted `SELECT/INSERT/UPDATE/DELETE` on all tenant-scoped tables. Subject to `FORCE RLS`. Connects with `DATABASE_APP_URL`.
+- `kidscare_auth_lookup` — login-only role. Granted `SELECT` on **specific columns only** of `users` and `tenants` (see §7.5). Subject to `FORCE RLS`. Connects with `DATABASE_AUTH_LOOKUP_URL`. +
+The runtime app connects with `DATABASE_APP_URL`. Migration tooling connects with `DATABASE_URL`. Login only uses `DATABASE_AUTH_LOOKUP_URL`. No role is granted `BYPASSRLS`. +
+Note: The `tenants` table itself being tenant-scoped is unusual but appropriate here — a tenant's own row is visible to its admins; other tenants are invisible. Global lookup of tenants by slug (for login) happens via the dedicated `kidscare_auth_lookup` role (§7.5). + +**Seed data** (`packages/database/prisma/seed.ts`): +
+- 1 demo tenant: `slug=demo`, `name=Demo Kreş`
+- 1 admin user: `email=admin@demo.test`, `passwordHash=<bcrypt 'demo1234'>`, `role=ADMIN`
+- 1 teacher user: `email=teacher@demo.test`, `passwordHash=<bcrypt 'demo1234'>`, `role=TEACHER` +
+--- +
+## 7. Tenant Guard Infrastructure +
+### 7.1 AsyncLocalStorage context + +`packages/database` cannot depend on NestJS, so the AsyncLocalStorage primitive lives in `apps/api/src/common/context/tenant-context.service.ts` and is consumed by both the middleware and the Prisma middleware (via a shared package or DI token). +
+Two options considered: +
+- **Option A (chosen):** Define a `@kidscare/tenant-context` package that exports `TenantContext` (AsyncLocalStorage wrapper). `apps/api` and `packages/database` both depend on it. Lightweight, framework-agnostic.
+- **Option B:** Define the AsyncLocalStorage inside `packages/database` and have `apps/api` import from there. Couples DB package to API patterns. +
+We choose **Option A** for clean layering. + +`
+packages/tenant-context/        (new package, minimal)
+├── src/
+│   ├── tenant-context.ts        (AsyncLocalStorage<TenantContextValue>)
+│   ├── run-with-tenant.ts       (helper to wrap a callback)
+│   └── index.ts
+├── project.json
+├── package.json
+└── tsconfig.json
+` + +`TenantContextValue`:
+```ts
+export type TenantContextValue = {

- tenantId: string;
- userId: string;
- role: 'ADMIN' | 'TEACHER' | 'PARENT';
  +} | null;
  +```
-

+### 7.2 NestJS middleware + +`apps/api/src/common/context/tenant-context.middleware.ts`: +
+- Reads `Authorization: Bearer <jwt>` (placeholder for sub-project #1: header `x-tenant-id` + `x-user-id` allowed in dev only, gated by `NODE_ENV !== 'production'`)
+- Parses `{ tenantId, userId, role }`
+- Calls `tenantContext.run(value, next)` to wrap the request lifecycle + +`apps/api/src/common/guards/tenant.guard.ts`: +
+- Used via `@UseGuards(TenantGuard)` on tenant-scoped controllers (mandatory per CLAUDE.md §5)
+- Throws `ForbiddenException` if no context
+- Skips when `@Public()` decorator is present (used for `/health`) +
+### 7.3 Prisma middleware + +`packages/database/src/middleware/tenant.middleware.ts`: +
+- Exports `withTenantContext(prisma, ctx)` — wraps a Prisma client so every query runs inside a transaction that first `SET LOCAL app.tenant_id = '<ctx.tenantId>'`
+- Uses Prisma's `$extends` API (Prisma 4.16+) for type safety
+- The base `prisma` export is a raw client intended for migration tooling and seed scripts only. Application runtime uses the extended client. Login does not go through this client — it constructs its own dedicated `PrismaClient` bound to `DATABASE_AUTH_LOOKUP_URL` (§7.5). +
+### 7.4 Request lifecycle +
+```
+HTTP request

- │
- ▼
  +TenantContextMiddleware
- │ parses headers → ctx
- │ tenantContext.run(ctx, () => next())
- ▼
  +TenantGuard (on tenant-scoped routes)
- │ ctx present? proceed : 403
- ▼
  +Controller
- │ injects PrismaService
- │ prisma.$extends(withTenantContext(ctx))
- ▼
  +Prisma query
- │ middleware opens tx, SET LOCAL app.tenant_id, runs query
- ▼
  +Postgres
- │ RLS policy evaluates using current_setting('app.tenant_id')
- │ returns rows where policy matches
- ▼
  +Response
  +```
-

+### 7.5 Auth Lookup Connection +
+Login requires looking up a user by email across tenants (the request does not yet carry a tenant id). This lookup must not happen through `kidscare_app`, because `kidscare_app` is scoped to a single tenant via `SET LOCAL app.tenant_id` and could never find cross-tenant rows even if it tried. It also must not happen through `kidscare_migrator`, which has full DDL access and is only meant for migrations. +
+Instead, login uses a third role: `kidscare_auth_lookup`. + +**Role definition** (in `init/01-roles.sql`): + +`sql
+CREATE ROLE kidscare_auth_lookup LOGIN PASSWORD :'AUTH_LOOKUP_PASSWORD';
+GRANT CONNECT ON DATABASE kidscare TO kidscare_auth_lookup;
+GRANT USAGE ON SCHEMA public TO kidscare_auth_lookup;
+
+-- column-level SELECT only on the minimum needed for login
+GRANT SELECT (id, "tenantId", email, "passwordHash") ON TABLE users TO kidscare_auth_lookup;
+GRANT SELECT (id, slug) ON TABLE tenants TO kidscare_auth_lookup;
+
+-- explicitly no INSERT/UPDATE/DELETE/REFERENCES/TRUNCATE
+-- explicitly no TRIGGER, no RULE, no ownership of anything
+` + +**Connection string** (`DATABASE_AUTH_LOOKUP_URL`) is exposed only via `process.env` and read **exclusively** in `apps/api/src/modules/auth/login.handler.ts` (sub-project #2 will create this file). It is never imported by any other module. + +**CLAUDE.md rule** (to be added in sub-project #2's spec, enforced from day one): +
+> `DATABASE_AUTH_LOOKUP_URL` may only be read from `process.env` inside the auth module's login handler. Any other import, reference, or usage — including tests outside the auth module — is a security violation and must be rejected at code review. + +**Login flow** (preview — full design in sub-project #2): +
+```
+POST /auth/login { email, password }

- │
- ▼
  +login.handler reads DATABASE_AUTH_LOOKUP_URL
- │ opens a dedicated PrismaClient bound to that URL
- │ SELECT id, "tenantId", email, "passwordHash" FROM users WHERE email = $1
- │ verify password hash (bcrypt) — fail-fast constant-time comparison
- │ on success: issue JWT signed with JWT_SECRET, scoped to tenantId
- │ on failure: generic 401 (no user enumeration)
- ▼
  +Response: { token, tenantId, role }
  +```
-

+The dedicated `PrismaClient` is constructed inside the handler, used for the single query, and immediately closed. It does not share the connection pool with the main app client. + +**Why not `BYPASSRLS`?** A `BYPASSRLS` role can read everything. `kidscare_auth_lookup` is locked down to specific columns on specific tables — even if compromised, it cannot enumerate all users or pivot to other tables. +
+--- +
+## 8. App Skeletons +
+### apps/api (NestJS) +
+- `AppModule` imports: `ConfigModule`, `HealthModule`, `TenantContextModule`, `PrismaModule`
+- `PrismaModule` (global) provides `PrismaService` extending `PrismaClient`. Configured to read `DATABASE_APP_URL` (not `DATABASE_URL`) so the runtime never connects as the migrator role.
+- `HealthModule` exports `HealthController` with `@Public()` decorator
+- `main.ts`: `app.use(...)` to register the middleware globally, listen on `process.env.PORT ?? 3000`
+- Bootstrap CORS for `http://localhost:5173` (admin-web) and `http://localhost:3000` (marketing) — different ports, configured explicitly +
+### apps/admin-web (Vite + React) +
+- Vite scaffold (no template — bare React + TS)
+- Routes: `/` → landing placeholder, future routes will live here
+- TanStack Query provider wired
+- Theme: light only for sub-project #1; design tokens added later +
+### apps/marketing (Next.js) +
+- App Router scaffold
+- `/` → placeholder landing with `<h1>KidsCare</h1>` and a paragraph +
+### apps/mobile (Expo) +
+- `expo-template-blank-typescript` baseline
+- Single screen with `<Text>KidsCare</Text>`
+- TypeScript configured +
+--- +
+## 9. Tooling Configuration +
+### `tsconfig.base.json` +
+```json
+{

- "compilerOptions": {
- "target": "ES2022",
- "module": "ESNext",
- "moduleResolution": "Bundler",
- "strict": true,
- "noUncheckedIndexedAccess": true,
- "exactOptionalPropertyTypes": true,
- "noImplicitOverride": true,
- "esModuleInterop": true,
- "skipLibCheck": true,
- "paths": {
-      "@kidscare/shared-types": ["packages/shared-types/src"],
-      "@kidscare/shared-schemas": ["packages/shared-schemas/src"],
-      "@kidscare/database": ["packages/database/src"],
-      "@kidscare/tenant-context": ["packages/tenant-context/src"]
- }
- }
  +}
  +```
-

+### ESLint +
+- `@nx/eslint-plugin`
+- `@typescript-eslint/recommended-type-checked`
+- Custom rule: `no-explicit-any: error`
+- Test files: relaxed `no-explicit-any` to `warn` +
+### Prettier +
+- Nx defaults; overrides for `.prisma` files (no quotes on string defaults) +
+### Husky + lint-staged +
+- Pre-commit: `pnpm exec nx format:write --files=<staged>` + `pnpm exec nx lint --files=<staged>` +
+--- +
+## 10. Testing Strategy +
+### Backend (Jest) +
+- **Unit:** Each service, repository, middleware, guard gets a `.spec.ts` colocated
+- **Integration:** `tenant-isolation.spec.ts` in `apps/api/test/` boots a test Postgres, seeds two tenants, and proves:

- - Tenant A user querying `users` sees only Tenant A's users
- - Tenant B user querying `users` sees only Tenant B's users
- - Cross-tenant query returns empty
    +- Tests run against a separate `DATABASE_URL` pointing at a dedicated schema; per-test setup truncates tables
-

+### Frontend (Vitest) +
+- Vitest scaffolded in `apps/admin-web`
+- Initial test: `App.test.tsx` — renders without crashing +
+### E2E (deferred) +
+- Not in this sub-project; first E2E will land with auth +
+### Coverage +
+- No minimum threshold in sub-project #1; baseline coverage report enabled in CI later +
+--- +
+## 11. Environment & Secrets + +`.env.example` (committed): + +`
+# Migration role — owner of schema, used only by prisma migrate / db push
+DATABASE_URL=postgresql://kidscare_migrator:migrator_pw@localhost:5432/kidscare?schema=public
+
+# Normal application role — used by the NestJS app at runtime
+DATABASE_APP_URL=postgresql://kidscare_app:app_pw@localhost:5432/kidscare?schema=public
+
+# Login-only role — read by auth module's login handler ONLY (see §7.5)
+DATABASE_AUTH_LOOKUP_URL=postgresql://kidscare_auth_lookup:auth_pw@localhost:5432/kidscare?schema=public
+
+REDIS_URL=redis://localhost:6379
+JWT_SECRET=replace-me
+NODE_ENV=development
+PORT=3000
+` +
+Role passwords above are placeholders for local dev. The actual passwords come from `docker-compose.yml`'s init script (`init/01-roles.sql` reads them from a Compose-only `secrets` file, not from `.env`). + +**Prisma uses `DATABASE_URL`** (the migrator role) for `prisma migrate` and `prisma generate`. The NestJS runtime reads `DATABASE_APP_URL` (see `PrismaModule` configuration in §8). + +`.env` (gitignored, dev only) — copy of `.env.example` with real local values matching the init script. +
+No production secrets in this sub-project. +
+--- +
+## 12. Acceptance Criteria +
+A sub-project is considered done when **all** of the following are true: +
+1. `pnpm install` succeeds with no errors
+2. `docker compose up -d` starts Postgres + Redis; `docker compose ps` shows both healthy
+3. `pnpm db:migrate` applies the initial migration including RLS policies
+4. `pnpm db:seed` creates the demo tenant and two users
+5. `pnpm dev:api` boots NestJS; `curl http://localhost:3000/health` returns `{"status":"ok"}`
+6. `pnpm dev:admin` renders `http://localhost:5173` with the admin landing placeholder
+7. `pnpm dev:marketing` renders `http://localhost:3000` (or chosen port) with the marketing landing
+8. `pnpm dev:mobile` boots Expo and displays the placeholder screen in Expo Go
+9. `pnpm test` runs all backend + frontend tests green
+10. `pnpm test:integration` runs the tenant-isolation integration test green
+11. `pnpm lint` passes with no errors
+12. The CLAUDE.md module template is respected in any module-shaped code added (no premature modules) +
+--- +
+## 13. Risks & Open Questions +
+| # | Risk / Question | Mitigation |
+|---|---|---|
+| 1 | Docker Desktop not running on Windows | Document fallback in README; user can use `pg_ctl` natively if Docker is unavailable |
+| 2 | Nx + Expo interop quirks | Use Expo's standalone `package.json` (not Nx project.json) for `apps/mobile`; Nx only owns the dependency graph, not the build |
+| 3 | Prisma client generation across packages | Pin `output` to a deterministic path; commit a `.gitignore` rule for generated files is **not** used — generated client is committed for build reproducibility |
+| 4 | Login flow needs cross-tenant lookup | Login constructs its own dedicated `PrismaClient` bound to `DATABASE_AUTH_LOOKUP_URL` (see §7.5); the `kidscare_auth_lookup` role is restricted to column-level `SELECT` on `users` and `tenants` — no `BYPASSRLS`, no other table access |
+| 5 | Husky on Windows | Use Husky 9 which supports Windows; document `corepack enable` requirement | +
+--- +
+## 14. Out of Scope (Confirmed) +
+- Auth flow (login, register, JWT issuance, refresh) — sub-project #2
+- Tenant CRUD endpoints — sub-project #3
+- Students / Student Passport — sub-project #4
+- Admin panel real screens — sub-project #5
+- Mobile real screens — sub-project #6
+- Marketing site real content — sub-project #7
+- CI/CD, observability, deployment — future +
+--- +
+## 15. References +
+- `CLAUDE.md` — module template, naming, SOLID, tenant rules
+- `kres-uygulamasi-teknoloji-karar-raporu.md` — stack decisions
+- Prisma `$extends` docs (RLS pattern)
+- NestJS `AsyncLocalStorage` integration via middleware
+- Postgres RLS docs
diff --git a/docs/superpowers/specs/2026-09-13-infrastructure-layer-design.tr.md b/docs/superpowers/specs/2026-09-13-infrastructure-layer-design.tr.md
new file mode 100644
index 0000000..ed98437
--- /dev/null
+++ b/docs/superpowers/specs/2026-09-13-infrastructure-layer-design.tr.md
@@ -0,0 +1,586 @@
+# KidsCare — Altyapı Katmanı Tasarımı + +**Tarih:** 2026-09-13 +**Durum:** Onaylandı (brainstorming tamamlandı) +**Kapsam:** KidsCare bootstrap planındaki 7 alt-projeden #1 +**İlgili:** `../kres-uygulamasi-teknoloji-karar-raporu.md`, `../../CLAUDE.md` +
+--- +
+## 1. Amaç +
+Herhangi bir feature modülü inşa edilmeden önce ihtiyaç duyulan monorepo iskeletini, veritabanı katmanını, tenant-izolasyon altyapısını ve minimal app iskeletlerini kurmak. Bu alt-proje tamamlandığında aşağıdakiler uçtan uca çalışır: +
+- `pnpm install` tüm workspace bağımlılıklarını çözer
+- `docker compose up -d` Postgres + Redis'i lokalde başlatır
+- `pnpm db:migrate` şemayı Postgres'e uygular
+- `pnpm dev:api` NestJS API'sini başlatır; `GET /health` 200 döner
+- `pnpm dev:admin`, `pnpm dev:marketing`, `pnpm dev:mobile` ilgili app'leri başlatır
+- Bir tenant-izolasyon testi guard + RLS pipeline'ının çalıştığını kanıtlar +
+Feature modülleri (auth, tenants, students, payments vb.) kapsam dışıdır, ayrı planlanacak. +
+--- +
+## 2. Kapsam Dışı (Non-Goals) +
+- Authentication akışı yok (alt-proje #2)
+- İş modülleri yok (students, payments, messages, attendance — sonra)
+- CI/CD pipeline'ları yok (ilk PR'da eklenecek)
+- Production deployment konfigürasyonu yok
+- Cloudflare R2, iyzico veya FCM entegrasyonu yok (sonra)
+- Admin/marketing/mobile için UI tasarım çalışması yok (yalnızca placeholder) +
+--- +
+## 3. Mimari Genel Bakış +
+```

-                ┌──────────────────────────────────────────┐
-                │              Nx Workspace               │
-                │  pnpm + TypeScript strict + ESLint flat │
-                └──────────────────────────────────────────┘
-                                    │
-        ┌───────────────────┬───────┴────────┬─────────────────────┐
-        ▼                   ▼                ▼                     ▼
- apps/api (NestJS) apps/admin-web apps/marketing apps/mobile
-                                         (Next.js)            (Expo)
-        │                   │                │                     │
-        └───────────────────┴────────────────┴─────────────────────┘
-                                    │
-                ┌───────────────────┼───────────────────┐
-                ▼                   ▼                   ▼
-        packages/database    packages/shared-     packages/shared-
-        (Prisma şema +       types (DTO)         schemas (Zod)
-         generated client)
-                │
-                ▼
-        docker-compose: postgres:16 + redis:7
-                │
-                ▼
-        Her tenant-scoped tabloda Postgres RLS politikaları

+``
+
+**İstek akışı (alt-proje #1 gösterimi):**
+
+1. `GET /health` NestJS'e gelir
+2. `TenantContextMiddleware` JWT'yi okur (placeholder — /health için boş), AsyncLocalStorage context'i set eder
+3. `TenantGuard` context'i kontrol eder; `/health` için kısa devre yapar
+4. Controller `{ status: 'ok' }` döner
+5. (Feature modülleri geldiğinde) Repository Prisma'yı çağırır, middleware `SET LOCAL app.tenant_id = '<ctx>'` çalıştırır, RLS politikaları uygular
+
+---
+
+## 4. Dizin Yapısı
+
+``
+kidscare/
+├── apps/
+│ ├── api/
+│ │ ├── src/
+│ │ │ ├── main.ts
+│ │ │ ├── app.module.ts
+│ │ │ ├── health/
+│ │ │ │ ├── health.module.ts
+│ │ │ │ ├── health.controller.ts
+│ │ │ │ └── health.controller.spec.ts
+│ │ │ └── common/
+│ │ │ ├── context/
+│ │ │ │ ├── tenant-context.service.ts
+│ │ │ │ ├── tenant-context.middleware.ts
+│ │ │ │ └── tenant-context.module.ts
+│ │ │ └── guards/
+│ │ │ └── tenant.guard.ts
+│ │ ├── project.json (Nx)
+│ │ └── tsconfig.json
+│ ├── admin-web/
+│ │ ├── src/main.tsx
+│ │ ├── src/App.tsx
+│ │ ├── project.json
+│ │ └── tsconfig.json
+│ ├── marketing/
+│ │ ├── app/page.tsx
+│ │ ├── project.json
+│ │ └── tsconfig.json
+│ └── mobile/
+│ ├── app.json (Expo)
+│ ├── App.tsx
+│ ├── package.json (Expo)
+│ └── tsconfig.json
+├── packages/
+│ ├── database/
+│ │ ├── prisma/
+│ │ │ ├── schema.prisma
+│ │ │ ├── seed.ts
+│ │ │ └── migrations/ (generated)
+│ │ ├── src/
+│ │ │ ├── client.ts (generated client'ı re-export eder)
+│ │ │ ├── middleware/
+│ │ │ │ └── tenant.middleware.ts
+│ │ │ └── index.ts
+│ │ ├── project.json
+│ │ └── package.json
+│ ├── tenant-context/ (bu alt-projede yeni — bkz. §7.1)
+│ │ ├── src/
+│ │ │ ├── tenant-context.ts
+│ │ │ ├── run-with-tenant.ts
+│ │ │ └── index.ts
+│ │ ├── project.json
+│ │ └── package.json
+│ ├── shared-types/
+│ │ ├── src/
+│ │ │ ├── tenant.ts
+│ │ │ ├── user.ts
+│ │ │ └── index.ts
+│ │ ├── project.json
+│ │ └── package.json
+│ └── shared-schemas/
+│ ├── src/
+│ │ ├── tenant.schema.ts
+│ │ ├── user.schema.ts
+│ │ └── index.ts
+│ ├── project.json
+│ └── package.json
+├── docker-compose.yml
+├── nx.json
+├── package.json (workspace root)
+├── pnpm-workspace.yaml
+├── tsconfig.base.json
+├── .editorconfig
+├── .eslintrc.cjs (veya flat için eslint.config.mjs)
+├── .prettierrc
+├── .husky/
+│ └── pre-commit
+└── .lintstagedrc.json +``
+
+---
+
+## 5. Teknoloji Seçimleri (Kararlaştırıldı)
+
+| Konu | Seçim | Neden |
+|---|---|---|
+| Monorepo aracı | **Nx** | Kullanıcı kararı; Turborepo'dan daha güçlü dependency graph |
+| Package manager | **pnpm** | Disk-efficient, native workspace desteği |
+| Backend framework | NestJS 10 | CLAUDE.md'de zaten var; modülerlik zorunlu kılınmış |
+| Admin panel | React 18 + Vite | CLAUDE.md'de zaten var |
+| Marketing | Next.js 14 (app router) | Karar raporunda zaten var |
+| Mobil | Expo SDK 51 | Karar raporunda zaten var |
+| ORM | Prisma | Karar raporunda zaten var |
+| Veritabanı | Postgres 16 | RLS desteği, Öğrenci Pasaportu için JSONB (sonra) |
+| Tenant izolasyon | **Postgres RLS + AsyncLocalStorage** | Savunma derinliği |
+| Backend testleri | Jest | NestJS default |
+| Frontend testleri | Vitest | Native Vite entegrasyonu |
+| Lint | ESLint flat config | Nx default + özel kurallar |
+| Format | Prettier | Nx default |
+| Git hooks | Husky + lint-staged | Pre-commit lint+format |
+
+---
+
+## 6. Veritabanı Şeması (Alt-proje #1)
+
+`packages/database/prisma/schema.prisma`:
+
+``prisma
+generator client {

- provider = "prisma-client-js"
- output = "../src/generated/client"
  +}
-

+datasource db {

- provider = "postgresql"
- url = env("DATABASE_URL")
  +}
-

+enum UserRole {

- ADMIN // tenant admin
- TEACHER
- PARENT
  +}
-

+enum TenantStatus {

- ACTIVE
- SUSPENDED
- DELETED
  +}
-

+model Tenant {

- id String @id @default(cuid())
- slug String @unique
- name String
- status TenantStatus @default(ACTIVE)
- createdAt DateTime @default(now())
- updatedAt DateTime @updatedAt
-
- users User[]
-
- @@map("tenants")
  +}
-

+model User {

- id String @id @default(cuid())
- tenantId String
- email String
- passwordHash String
- role UserRole
- isActive Boolean @default(true)
- lastLoginAt DateTime?
- createdAt DateTime @default(now())
- updatedAt DateTime @updatedAt
-
- tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
-
- @@unique([tenantId, email]) // email tenant başına unique
- @@index([tenantId])
- @@map("users")
  +}
  +```
-

+**RLS politikaları** (migration SQL ile uygulanır): +
+```sql
+-- tenants: yalnızca session tenant_id ile eşleşen satır görünür
+ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
+ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
+CREATE POLICY tenant_isolation ON tenants

- USING (id = current_setting('app.tenant_id', true));
-

+-- users: session'daki tenant_id ile kapsanır
+ALTER TABLE users ENABLE ROW LEVEL SECURITY;
+ALTER TABLE users FORCE ROW LEVEL SECURITY;
+CREATE POLICY tenant_isolation ON users

- USING ("tenantId" = current_setting('app.tenant_id', true));
  +```
-

+`FORCE ROW LEVEL SECURITY` zorunludur — RLS'nin tablo sahibine de uygulanmasını sağlar. Yoksa migrator rolü tüm politikaları bypass eder ve yanlış yapılandırılmış bir bağlantı veri sızdırır. + +**Postgres rol ayrımı** (`docker-compose.yml` init script `init/01-roles.sql` ile uygulanır): +
+Üç rol, her biri minimum yetkiyle: +
+- `kidscare_migrator` — şemanın sahibi; **yalnızca** `prisma migrate` ve `prisma db push` tarafından kullanılır. DDL yapabilir, tüm satırlarda CRUD yapabilir. `DATABASE_URL` ile bağlanır.
+- `kidscare_app` — normal uygulama rolü. Tüm tenant-scoped tablolarda `SELECT/INSERT/UPDATE/DELETE` yetkisi verilir. `FORCE RLS`'e tabidir. `DATABASE_APP_URL` ile bağlanır.
+- `kidscare_auth_lookup` — yalnızca login rolü. `users` ve `tenants` tablolarının **yalnızca belirli sütunlarında** `SELECT` yetkisi (bkz. §7.5). `FORCE RLS`'e tabidir. `DATABASE_AUTH_LOOKUP_URL` ile bağlanır. +
+Runtime uygulama `DATABASE_APP_URL` ile bağlanır. Migration araçları `DATABASE_URL` ile. Login yalnızca `DATABASE_AUTH_LOOKUP_URL` kullanır. Hiçbir role `BYPASSRLS` verilmez. +
+Not: `tenants` tablosunun kendisinin tenant-scoped olması alışılmadık ama burada uygun — bir tenant'ın kendi satırı admin'lerine görünür, diğer tenant'lar görünmez. Slug ile tenant global araması (login için) özel `kidscare_auth_lookup` rolü üzerinden yapılır (§7.5). + +**Seed verisi** (`packages/database/prisma/seed.ts`): +
+- 1 demo tenant: `slug=demo`, `name=Demo Kreş`
+- 1 admin kullanıcı: `email=admin@demo.test`, `passwordHash=<bcrypt 'demo1234'>`, `role=ADMIN`
+- 1 teacher kullanıcı: `email=teacher@demo.test`, `passwordHash=<bcrypt 'demo1234'>`, `role=TEACHER` +
+--- +
+## 7. Tenant Guard Altyapısı +
+### 7.1 AsyncLocalStorage context + +`packages/database` NestJS'e bağımlı olamaz, bu yüzden AsyncLocalStorage primitive'i `apps/api/src/common/context/tenant-context.service.ts` içinde değil, **`packages/tenant-context`** paketinde yaşar; hem middleware hem Prisma middleware'i buradan tüketir. +
+İki seçenek değerlendirildi: +
+- **Seçenek A (tercih edilen):** `@kidscare/tenant-context` paketi tanımla, `TenantContext` (AsyncLocalStorage wrapper) export et. `apps/api` ve `packages/database` ikisi de buna bağımlı olur. Hafif, framework-agnostic.
+- **Seçenek B:** AsyncLocalStorage'ı `packages/database` içinde tanımla, `apps/api` oradan import etsin. DB paketini API kalıplarına bağlar. + +**Seçenek A** seçildi — temiz katmanlama için. + +`
+packages/tenant-context/        (yeni paket, minimal)
+├── src/
+│   ├── tenant-context.ts        (AsyncLocalStorage<TenantContextValue>)
+│   ├── run-with-tenant.ts       (callback'u sarmalayan helper)
+│   └── index.ts
+├── project.json
+├── package.json
+└── tsconfig.json
+` + +`TenantContextValue`:
+```ts
+export type TenantContextValue = {

- tenantId: string;
- userId: string;
- role: 'ADMIN' | 'TEACHER' | 'PARENT';
  +} | null;
  +```
-

+### 7.2 NestJS middleware + +`apps/api/src/common/context/tenant-context.middleware.ts`: +
+- `Authorization: Bearer <jwt>` başlığını okur (alt-proje #1 için placeholder — dev'de `x-tenant-id` + `x-user-id` başlıklarına izin var, `NODE_ENV !== 'production'` ile gated)
+- `{ tenantId, userId, role }` parse eder
+- `tenantContext.run(value, () => next())` çağırır + +`apps/api/src/common/guards/tenant.guard.ts`: +
+- Tenant-scoped controller'larda `@UseGuards(TenantGuard)` ile kullanılır (CLAUDE.md §5 uyarınca zorunlu)
+- Context yoksa `ForbiddenException` fırlatır
+- `@Public()` decorator varsa atlar (`/health` için kullanılır) +
+### 7.3 Prisma middleware + +`packages/database/src/middleware/tenant.middleware.ts`: +
+- `withTenantContext(prisma, ctx)` export eder — bir Prisma client'ı sarar; her sorgu önce `SET LOCAL app.tenant_id = '<ctx.tenantId>'` çalıştıran bir transaction içinde yürür
+- Prisma'nın `$extends` API'sini kullanır (Prisma 4.16+) — tip güvenliği için
+- Base `prisma` export'u raw client olarak kalır — yalnızca migration araçları ve seed script'leri için. Runtime bu client'ı kullanmaz (uzantılı kullanır). Login bu client'tan geçmez; `DATABASE_AUTH_LOOKUP_URL`'e bağlı kendi özel `PrismaClient`'ını inşa eder (§7.5). +
+### 7.4 İstek yaşam döngüsü +
+```
+HTTP isteği

- │
- ▼
  +TenantContextMiddleware
- │ başlıkları parse → ctx
- │ tenantContext.run(ctx, () => next())
- ▼
  +TenantGuard (tenant-scoped route'larda)
- │ ctx var mı? devam : 403
- ▼
  +Controller
- │ PrismaService inject edilir
- │ prisma.$extends(withTenantContext(ctx))
- ▼
  +Prisma sorgusu
- │ middleware tx açar, SET LOCAL app.tenant_id, sorguyu çalıştırır
- ▼
  +Postgres
- │ RLS policy current_setting('app.tenant_id') ile değerlendirir
- │ policy eşleşen satırları döner
- ▼
  +Yanıt
  +```
-

+### 7.5 Auth Lookup Bağlantısı +
+Login, tenantlar arası email ile kullanıcı araması gerektirir (istek henüz tenant id taşımaz). Bu arama `kidscare_app` üzerinden yapılamaz çünkü `kidscare_app` `SET LOCAL app.tenant_id` ile tek bir tenant'a kapsanır ve denese bile cross-tenant satır bulamaz. `kidscare_migrator` üzerinden de yapılamaz çünkü tam DDL erişimi var ve yalnızca migration'lar için tasarlandı. +
+Bunun yerine login üçüncü bir rol kullanır: `kidscare_auth_lookup`. + +**Rol tanımı** (`init/01-roles.sql` içinde): + +`sql
+CREATE ROLE kidscare_auth_lookup LOGIN PASSWORD :'AUTH_LOOKUP_PASSWORD';
+GRANT CONNECT ON DATABASE kidscare TO kidscare_auth_lookup;
+GRANT USAGE ON SCHEMA public TO kidscare_auth_lookup;
+
+-- login için gereken minimum üzerinde sütun-düzeyinde SELECT
+GRANT SELECT (id, "tenantId", email, "passwordHash") ON TABLE users TO kidscare_auth_lookup;
+GRANT SELECT (id, slug) ON TABLE tenants TO kidscare_auth_lookup;
+
+-- açıkça INSERT/UPDATE/DELETE/REFERENCES/TRUNCATE yok
+-- açıkça TRIGGER, RULE, sahiplik yok
+` + +**Bağlantı string'i** (`DATABASE_AUTH_LOOKUP_URL`) yalnızca `process.env` üzerinden açılır ve **münhasıran** `apps/api/src/modules/auth/login.handler.ts` içinde okunur (alt-proje #2 bu dosyayı oluşturacak). Başka hiçbir modül tarafından import edilmez. + +**CLAUDE.md kuralı** (alt-proje #2'nin spec'inde eklenecek, birinci günden itibaren uygulanır): +
+> `DATABASE_AUTH_LOOKUP_URL` yalnızca auth modülünün login handler'ı içinde `process.env`'den okunabilir. Bunun dışındaki herhangi bir import, referans veya kullanım — auth modülü dışındaki testler dahil — güvenlik ihlalidir ve code review'da reddedilmelidir. + +**Login akışı** (önizleme — tam tasarım alt-proje #2'de): +
+```
+POST /auth/login { email, password }

- │
- ▼
  +login.handler DATABASE_AUTH_LOOKUP_URL okur
- │ o URL'ye bağlı özel bir PrismaClient açar
- │ SELECT id, "tenantId", email, "passwordHash" FROM users WHERE email = $1
- │ password hash doğrula (bcrypt) — constant-time karşılaştırma, fail-fast
- │ başarı: JWT_SECRET ile imzalı, tenantId'ye kapsamlı JWT üret
- │ başarısızlık: generic 401 (user enumeration yok)
- ▼
  +Yanıt: { token, tenantId, role }
  +```
-

+Özel `PrismaClient` handler içinde inşa edilir, tek sorgu için kullanılır ve hemen kapatılır. Ana uygulama client'ıyla bağlantı havuzunu paylaşmaz. + +**Neden `BYPASSRLS` değil?** `BYPASSRLS` rolü her şeyi okuyabilir. `kidscare_auth_lookup` belirli tabloların belirli sütunlarına kilitlidir — ele geçirilse bile tüm kullanıcıları enumerate edemez, başka tablolara pivot yapamaz. +
+--- +
+## 8. App İskeletleri +
+### apps/api (NestJS) +
+- `AppModule` importları: `ConfigModule`, `HealthModule`, `TenantContextModule`, `PrismaModule`
+- `PrismaModule` (global) `PrismaClient`'ı extend eden `PrismaService` sağlar. Runtime'ın migrator rolüyle bağlanmaması için `DATABASE_APP_URL` (değil `DATABASE_URL`) okuyacak şekilde yapılandırılır.
+- `HealthModule` `@Public()` decorator'lı `HealthController` export eder
+- `main.ts`: middleware'i global olarak kaydetmek için `app.use(...)`, `process.env.PORT ?? 3000` üzerinde dinle
+- CORS: `http://localhost:5173` (admin-web) ve marketing portu için yapılandırılır +
+### apps/admin-web (Vite + React) +
+- Vite scaffold (template yok — bare React + TS)
+- Route'lar: `/` → landing placeholder, gelecek route'lar burada
+- TanStack Query provider bağlı
+- Tema: alt-proje #1 için yalnızca light; design token'lar sonra +
+### apps/marketing (Next.js) +
+- App Router scaffold
+- `/` → `<h1>KidsCare</h1>` ve bir paragraf içeren placeholder landing +
+### apps/mobile (Expo) +
+- `expo-template-blank-typescript` tabanı
+- `<Text>KidsCare</Text>` içeren tek ekran
+- TypeScript yapılandırılmış +
+--- +
+## 9. Tooling Konfigürasyonu +
+### `tsconfig.base.json` +
+```json
+{

- "compilerOptions": {
- "target": "ES2022",
- "module": "ESNext",
- "moduleResolution": "Bundler",
- "strict": true,
- "noUncheckedIndexedAccess": true,
- "exactOptionalPropertyTypes": true,
- "noImplicitOverride": true,
- "esModuleInterop": true,
- "skipLibCheck": true,
- "paths": {
-      "@kidscare/shared-types": ["packages/shared-types/src"],
-      "@kidscare/shared-schemas": ["packages/shared-schemas/src"],
-      "@kidscare/database": ["packages/database/src"],
-      "@kidscare/tenant-context": ["packages/tenant-context/src"]
- }
- }
  +}
  +```
-

+### ESLint +
+- `@nx/eslint-plugin`
+- `@typescript-eslint/recommended-type-checked`
+- Özel kural: `no-explicit-any: error`
+- Test dosyaları: `no-explicit-any` `warn`'a gevşetilir +
+### Prettier +
+- Nx default'ları; `.prisma` dosyaları için override (string default'larda tırnak yok) +
+### Husky + lint-staged +
+- Pre-commit: `pnpm exec nx format:write --files=<staged>` + `pnpm exec nx lint --files=<staged>` +
+--- +
+## 10. Test Stratejisi +
+### Backend (Jest) +
+- **Unit:** Her service, repository, middleware, guard'a yan yana `.spec.ts`
+- **Integration:** `apps/api/test/tenant-isolation.spec.ts` test Postgres'ini ayağa kaldırır, iki tenant seed'ler ve kanıtlar:

- - Tenant A kullanıcısı `users` sorguladığında yalnızca Tenant A'nın user'larını görür
- - Tenant B kullanıcısı `users` sorguladığında yalnızca Tenant B'nın user'larını görür
- - Cross-tenant sorgu boş döner
    +- Testler ayrı bir `DATABASE_URL` (özel schema) karşısında çalışır; her test öncesi tablolar truncate edilir
-

+### Frontend (Vitest) +
+- `apps/admin-web` içinde Vitest scaffold
+- İlk test: `App.test.tsx` — hatasız render +
+### E2E (ertelendi) +
+- Bu alt-projede yok; ilk E2E auth ile gelecek +
+### Coverage +
+- Alt-proje #1'de minimum eşik yok; baseline coverage raporu CI'da sonra etkinleştirilecek +
+--- +
+## 11. Ortam ve Secret'lar + +`.env.example` (commit edilir): + +`
+# Migration rolü — şema sahibi, yalnızca prisma migrate / db push kullanır
+DATABASE_URL=postgresql://kidscare_migrator:migrator_pw@localhost:5432/kidscare?schema=public
+
+# Normal uygulama rolü — NestJS runtime'ı kullanır
+DATABASE_APP_URL=postgresql://kidscare_app:app_pw@localhost:5432/kidscare?schema=public
+
+# Yalnızca login rolü — auth modülünün login handler'ı okur (bkz. §7.5)
+DATABASE_AUTH_LOOKUP_URL=postgresql://kidscare_auth_lookup:auth_pw@localhost:5432/kidscare?schema=public
+
+REDIS_URL=redis://localhost:6379
+JWT_SECRET=replace-me
+NODE_ENV=development
+PORT=3000
+` +
+Yukarıdaki rol şifreleri lokal dev için placeholder. Gerçek şifreler `docker-compose.yml`'in init script'inden (`init/01-roles.sql`) gelir — Compose-only `secrets` dosyasından okunur, `.env`'den değil. + +**Prisma, `DATABASE_URL` kullanır** (migrator rolü) — `prisma migrate` ve `prisma generate` için. NestJS runtime'ı `DATABASE_APP_URL` okur (`PrismaModule` konfigürasyonu için bkz. §8). + +`.env` (gitignore, yalnızca dev) — init script ile eşleşen gerçek lokal değerlerle `.env.example`'ın kopyası. +
+Bu alt-projede production secret yok. +
+--- +
+## 12. Kabul Kriterleri +
+Alt-proje, aşağıdakilerin **tümü** doğru olduğunda tamamlanmış sayılır: +
+1. `pnpm install` hatasız tamamlanır
+2. `docker compose up -d` Postgres + Redis'i başlatır; `docker compose ps` her ikisini de healthy gösterir
+3. `pnpm db:migrate` RLS politikaları dahil ilk migration'ı uygular
+4. `pnpm db:seed` demo tenant ve iki kullanıcı oluşturur
+5. `pnpm dev:api` NestJS'i başlatır; `curl http://localhost:3000/health` `{"status":"ok"}` döner
+6. `pnpm dev:admin` `http://localhost:5173`'te admin landing placeholder'ını render eder
+7. `pnpm dev:marketing` marketing landing'i render eder
+8. `pnpm dev:mobile` Expo'yu başlatır ve placeholder ekranı Expo Go'da görüntüler
+9. `pnpm test` tüm backend + frontend testlerini yeşil çalıştırır
+10. `pnpm test:integration` tenant-izolasyon integration testini yeşil çalıştırır
+11. `pnpm lint` hatasız geçer
+12. CLAUDE.md modül şablonu eklenen modül-şekilli kodda korunur (prematüre modül yok) +
+--- +
+## 13. Riskler ve Açık Sorular +
+| # | Risk / Soru | Önlem |
+|---|---|---|
+| 1 | Windows'ta Docker Desktop çalışmıyor | README'de fallback dokümante edilir; Docker yoksa kullanıcı native `pg_ctl` kullanabilir |
+| 2 | Nx + Expo interop tuhaflıkları | `apps/mobile` için Expo'nun standalone `package.json`'ı kullanılır (Nx project.json değil); Nx yalnızca dependency graph'ı sahiplenir, build'i değil |
+| 3 | Paketler arası Prisma client generation | `output` deterministik bir path'e pinlenir; generated dosyalar için `.gitignore` kuralı **kullanılmaz** — build reproducibility için generated client commit edilir |
+| 4 | Login akışı cross-tenant aramaya ihtiyaç duyar | Login, `DATABASE_AUTH_LOOKUP_URL`'e bağlı kendine özel `PrismaClient` inşa eder (bkz. §7.5); `kidscare_auth_lookup` rolü `users` ve `tenants` üzerinde sütun-düzeyinde `SELECT` ile sınırlandırılmıştır — `BYPASSRLS` yok, başka tabloya erişim yok |
+| 5 | Windows'ta Husky | Windows desteği olan Husky 9 kullanılır; `corepack enable` gereksinimi dokümante edilir | +
+--- +
+## 14. Kapsam Dışı (Onaylandı) +
+- Auth akışı (login, register, JWT üretimi, refresh) — alt-proje #2
+- Tenant CRUD endpoint'leri — alt-proje #3
+- Students / Öğrenci Pasaportu — alt-proje #4
+- Admin panel gerçek ekranları — alt-proje #5
+- Mobil gerçek ekranlar — alt-proje #6
+- Marketing site gerçek içeriği — alt-proje #7
+- CI/CD, observability, deployment — gelecek +
+--- +
+## 15. Referanslar +
+- `CLAUDE.md` — modül şablonu, isimlendirme, SOLID, tenant kuralları
+- `kres-uygulamasi-teknoloji-karar-raporu.md` — stack kararları
+- Prisma `$extends` docs (RLS kalıbı)
+- NestJS `AsyncLocalStorage` middleware entegrasyonu
+- Postgres RLS docs
diff --git a/kres-uygulamasi-teknoloji-karar-raporu.md b/kres-uygulamasi-teknoloji-karar-raporu.md
new file mode 100644
index 0000000..42522bb
--- /dev/null
+++ b/kres-uygulamasi-teknoloji-karar-raporu.md
@@ -0,0 +1,116 @@
+# Kreş Uygulaması — Teknoloji Kararları & Mimari Özet Raporu +
+## 1. Proje Kimliği (Özet)
+- **Vizyon:** Öğretmen, öğrenci ve aile arasındaki bağı güçlendiren, tüm günlük iletişim ve bilgilendirmenin uygulama üzerinden aktığı bir kreş platformu
+- **Model:** Birden fazla kreşe satılabilir çok kiracılı (multi-tenant) SaaS
+- **Geliştirici profili:** Solo geliştirici; öncelik hız değil **kalite** (hız ve sağlamlık eşit ağırlıkta)
+- **Ana uzmanlık:** React + Node.js (Angular/.NET yeni öğreniliyor — bu proje kapsamında kullanılmayacak)
+- **İlk KPI:** Öğretmen ve ailenin uygulamaya adaptasyonu, herkesin sorunsuz kullanabilmesi +
+--- +
+## 2. Bizi Ayıracak Farklılaştırıcılar
+1. **Öğrenci Pasaportu** — kan grubu, alerjiler, beslenme tercihleri, bireysel notlar tek profilde (öğretmenin unutmaması için)
+2. **AI destekli günlük özet** — öğretmen kısa not girer, sistem düzgün rapora çevirir
+3. **Aile-katılımlı etkinlik modeli** — sadece bilgilendirme değil, aktif katılım
+4. **Vendor lock-in karşıtı duruş** — istediğin an veri export
+5. **Çoklu şube yönetimi** (V2) — kreş zincirlerine merkezi panel +
+--- +
+## 3. MVP Kapsamı
+| # | Özellik |
+|---|---------|
+| 1 | Öğrenci Pasaportu |
+| 2 | Günlük Yaşam Takibi (yemek, uyku, aktivite) |
+| 3 | Fotoğraf + Video + Günlük Akış |
+| 4 | Giriş-Çıkış + Güvenlik |
+| 5 | Veli ↔ Öğretmen İletişimi |
+| 6 | Yemek Listesi |
+| 7 | Etkinlik Yönetimi (+ materyal bilgilendirmesi) |
+| 8 | Aidat + Ödeme + Evrak Yönetimi | +
+--- +
+## 4. Teknoloji Kararları (Final) +
+### Karar Süreci
+Tüm alternatifler (backend: NestJS/.NET/Django/Go/Spring; web: React/Angular/Vue/Svelte; mobil: Flutter/React Native/Ionic/Native) karşılaştırmalı olarak değerlendirildi. Solo geliştirici + gerçek uzmanlık alanı (React/Node.js) + kalite önceliği kriterleri birlikte değerlendirilince **tek dil ekseni (TypeScript uçtan uca)** net kazanan oldu. +
+### Final Stack +
+| Katman | Teknoloji | Gerekçe (özet) |
+|---|---|---|
+| **Veritabanı** | PostgreSQL | Row-Level Security ile tenant izolasyonu, JSONB ile esnek şema (Öğrenci Pasaportu) |
+| **ORM** | Prisma | NestJS ile olgun entegrasyon, uçtan uca tip güvenliği |
+| **Backend** | NestJS | Zorunlu modülerlik, built-in DI, Guard/Interceptor ile merkezi tenant izolasyonu — solo geliştiricide disiplini "yapı" sağlıyor, sen değil |
+| **Admin/Öğretmen Paneli** | React + Vite | Login arkası, SEO gereksiz, hafif ve hızlı SPA |
+| **Pazarlama/Tanıtım Sitesi** | Next.js | Public, SEO ve hızlı ilk yükleme kritik (müşteri kazanımı buradan) |
+| **Mobil (Veli + Öğretmen)** | React Native + Expo | Tek kod tabanı, Expo ile native modül/build süreci basitleşiyor |
+| **Real-time** | Socket.io | Günlük akış bildirimleri, mesajlaşma |
+| **Push Notification** | Firebase Cloud Messaging | Web + mobil tek entegrasyon |
+| **Dosya/Medya Depolama** | Cloudflare R2 (S3 uyumlu) | Maliyet avantajlı |
+| **Ödeme** | iyzico | Türkiye pazarı |
+| **Background Jobs** | BullMQ (Redis) | Günlük özet, hatırlatmalar, otomatik uyarılar |
+| **State/Data Fetching (Web+Mobil)** | TanStack Query + Zustand | Az boilerplate, solo bakım kolaylığı |
+| **UI Kütüphanesi (Admin Panel)** | Mantine veya shadcn/ui | Hazır bileşen seti, tasarım zamanı tasarrufu |
+| **Form + Validasyon** | React Hook Form + Zod | Backend ile paylaşılan şema |
+| **Monorepo** | Turborepo veya Nx | Paylaşılan tipler (`Student`, `Tenant`, `Payment`) ve validasyon şemaları tek kaynaktan | +
+### Neden NestJS (Express/Fastify değil)?
+Express ile gidilirse yapı/disiplin geliştiriciye kalır — solo geliştirici için 6 ay sonra tutarlılığı koruma riski yüksek. NestJS'in modül/DI/Guard sistemi bu disiplini hazır sağlıyor; multi-tenant izolasyonu merkezi Guard'da tek yerden yönetilebiliyor (Express'te route başına manuel tekrar riski var — çocuk sağlık verisiyle çalışıldığı için bu risk kritik). +
+### Neden React + Vite / Next.js ayrımı?
+Next.js'in gücü SSR + SEO. Admin panel login arkasında ve public değil, bu yüzden Next.js gereksiz ağırlık. Pazarlama sitesi ise tamamen public ve SEO'ya bağımlı büyüme stratejisi taşıyor — orada Next.js doğru araç. +
+--- +
+## 5. Mimari Notlar
+- **Multi-tenancy:** PostgreSQL Row-Level Security + Prisma middleware ile tenant_id filtrelemesi
+- **Monorepo yapısı:**

- ```

  ```
- /apps
- /api → NestJS backend
- /admin-web → React + Vite (admin/öğretmen paneli)
- /marketing → Next.js (tanıtım sitesi)
- /mobile → React Native + Expo
- /packages
- /shared-types → DTO/interface tanımları
- /shared-schemas → Zod validasyon şemaları
- ```

  ```

+- **KVKK/Gizlilik:** Öğrenci Pasaportu sağlık verisi içerdiği için açık rıza akışı ve erişim loglaması ilk günden planlanmalı +
+--- +
+## 6. Mimari Kararların Sahipliği (Belirlenmiş vs. Agent'a Bırakılan) +
+### Zaten Belirlenmiş Olan (üst düzey mimari — sonradan değiştirilmesi pahalı kararlar)
+- Monorepo yapısı (`/apps/api`, `/admin-web`, `/marketing`, `/mobile`, `/packages`)
+- Multi-tenancy stratejisi: PostgreSQL Row-Level Security + Prisma middleware
+- Katman modeli: NestJS modülerlik (her domain kendi modülü — `students`, `payments`, `tenants` vb.)
+- Veri akışı: Backend → paylaşılan tipler (`packages/shared-types`) → Web/Mobil +
+Bu kararlar AI agent'ına bırakılmayacak; kod yazımına başlamadan önce sabitlenmiş durumda. +
+### Henüz Belirlenmemiş Olan (agent'ın, verilen kurallar dahilinde uygulayacağı ince mimari)
+- Her modülün içindeki dosya yapısı (controller/service/DTO isimlendirmesi, repository pattern / CQRS gibi desen tercihi)
+- SOLID prensiplerinin somut kod seviyesinde uygulanışı (interface soyutlamaları, DI detayları)
+- Test yapısı ve klasörleme +
+Bu ikinci kısım agent'a tamamen serbest bırakılmayacak — `CLAUDE.md` (Claude Code için proje kuralları dosyası) içine somut kurallar (örnek modül şablonu, isimlendirme standardı, her yeni modülün içermesi gereken dosyalar) yazılarak agent'ın çerçeve içinde kod üretmesi sağlanacak. +
+## 7. Geliştirme Araçları Kararı +
+| Görev | Araç | Neden |
+|---|---|---|
+| Backend mimarisi (NestJS modülleri, tenant izolasyonu, domain mantığı) | **Claude Code** (Sonnet 5/Opus 5) | Derin kod tabanı muhakemesi, SOLID'e sadık kalma, çok dosyalı tutarlılık en kritik burada |
+| Frontend/UI iterasyonu (admin panel, mobil ekranlar) | **Antigravity + Gemini** | Görsel diff + browser automation ile hızlı UI iterasyonu, ücretsiz |
+| Rutin/toplu işler (CRUD boilerplate, dokümantasyon, basit testler) | **MiniMax M3** | Çok ucuz, bu tür işlerde yeterli | +
+## 8. Sıradaki Adım
+Kod yazımına **Claude Code** ile başlanacak — en kritik ve sonradan değiştirilmesi en pahalı olan temel (backend mimarisi) burada atılıyor. Önerilen sıra:
+1. `CLAUDE.md` proje kurallarının yazılması (modül şablonu, isimlendirme standardı, tenant izolasyon deseni)
+2. Monorepo iskeletinin kurulması (Turborepo/Nx + apps/packages yapısı)
+3. Veritabanı şeması (tenant, kullanıcı, öğrenci/pasaport, ödeme tabloları) + Prisma migration
+4. NestJS backend temel modülleri (auth, tenants, students)
+5. Admin panel temel iskelet + auth akışı (Antigravity/Gemini'ye geçiş)
diff --git a/nx.json b/nx.json
new file mode 100644
index 0000000..be42d13
--- /dev/null
+++ b/nx.json
@@ -0,0 +1,11 @@
+{

- "npmScope": "kidscare",
- "affected": { "defaultBase": "main" },
- "tasksRunnerOptions": {
- "default": {
-      "runner": "nx/tasks-runners/default",
-      "options": { "cacheableOperations": ["build", "test", "lint"] }
- }
- },
- "workspaceLayout": { "appsDir": "apps", "libsDir": "packages" }
  +}
  \ No newline at end of file
  diff --git a/package.json b/package.json
  new file mode 100644
  index 0000000..7a56caa
  --- /dev/null
  +++ b/package.json
  @@ -0,0 +1,28 @@
  +{
- "name": "kidscare",
- "version": "0.0.0",
- "private": true,
- "packageManager": "pnpm@9.0.0",
- "engines": { "node": ">=20" },
- "scripts": {
- "db:up": "docker compose up -d",
- "db:down": "docker compose down",
- "db:migrate": "pnpm --filter @kidscare/database prisma migrate deploy",
- "db:migrate:dev": "pnpm --filter @kidscare/database prisma migrate dev",
- "db:seed": "pnpm --filter @kidscare/database prisma db seed",
- "db:reset": "pnpm --filter @kidscare/database prisma migrate reset --force",
- "dev:api": "pnpm --filter @kidscare/api start:dev",
- "dev:admin": "pnpm --filter @kidscare/admin-web dev",
- "dev:marketing": "pnpm --filter @kidscare/marketing dev",
- "dev:mobile": "pnpm --filter @kidscare/mobile start",
- "test": "pnpm exec nx run-many --target=test",
- "test:integration": "pnpm --filter @kidscare/api test:integration",
- "lint": "pnpm exec nx run-many --target=lint",
- "format": "pnpm exec nx format:write"
- },
- "devDependencies": {
- "nx": "^19.0.0",
- "typescript": "^5.4.0",
- "@types/node": "^20.0.0"
- }
  +}
  \ No newline at end of file
  diff --git a/pnpm-lock.yaml b/pnpm-lock.yaml
  new file mode 100644
  index 0000000..494e454
  --- /dev/null
  +++ b/pnpm-lock.yaml
  @@ -0,0 +1,1133 @@
  +lockfileVersion: '9.0'
-

+settings:

- autoInstallPeers: true
- excludeLinksFromLockfile: false
-

+importers: +

- .:
- devDependencies:
-      '@types/node':
-        specifier: ^20.0.0
-        version: 20.19.43
-      nx:
-        specifier: ^19.0.0
-        version: 19.8.14
-      typescript:
-        specifier: ^5.4.0
-        version: 5.9.3
-

+packages: +

- '@emnapi/core@1.11.3':
- resolution: {integrity: sha512-zLpS5asjEb7lq8jYLq37N6XKaE41DIexlY1rF/z4/tIl3wo13Sqm28fRyfIsKZD+NZ8mM5RoKkpW/rBcuoSZSg==}
-
- '@emnapi/runtime@1.11.3':
- resolution: {integrity: sha512-Xz4Tpyki7XyrpbUK1jR1AhdAdaXyhhY4lZ3neLodmhpuWfy2PAQN5B46sAiU4liOXGLkHypn/qU+jvfWSCYYLA==}
-
- '@emnapi/wasi-threads@1.2.3':
- resolution: {integrity: sha512-ELEBe8PsLvvJ6QMr0zLt8ffvOHW/dc1m3CEzNMg7aJUv3bMaoDtw2TXyDAwkYBuroxxuHEwhRTLJSe5sya547g==}
-
- '@jest/schemas@29.6.3':
- resolution: {integrity: sha512-mo5j5X+jIZmJQveBKeS/clAueipV7KgiX1vMgCxam1RNYiqE1w62n0/tJJnHtjW8ZHcQco5gY85jA3mi0L+nSA==}
- engines: {node: ^14.15.0 || ^16.10.0 || >=18.0.0}
-
- '@napi-rs/wasm-runtime@0.2.4':
- resolution: {integrity: sha512-9zESzOO5aDByvhIAsOy9TbpZ0Ur2AJbUI7UT73kcUTS2mxAMHOBaa1st/jAymNoCtvrit99kkzT1FZuXVcgfIQ==}
-
- '@nrwl/tao@19.8.14':
- resolution: {integrity: sha512-zBeYzzwg43T/Z8ZtLblv0fcKuqJULttqYDekSLILThXp3UOMSerEvruhUgwddCY1jUssfLscz8vacMKISv5X4w==}
- hasBin: true
-
- '@nx/nx-darwin-arm64@19.8.14':
- resolution: {integrity: sha512-bZUFf23gAzuwVw71dR8rngye5aCR8Z/ouIo+KayjqB0LWWoi3WzO73s4S69ljftYt4n6z9wvD+Trbb1BKm2fPg==}
- engines: {node: '>= 10'}
- cpu: [arm64]
- os: [darwin]
-
- '@nx/nx-darwin-x64@19.8.14':
- resolution: {integrity: sha512-UXXVea8icFG/3rFwpbLYsD6O4wlyJ1STQfOdhGK1Hyuga70AUUdrjVm7HzigAQP/Sb2Nzd7155YXHzfpRPDFYA==}
- engines: {node: '>= 10'}
- cpu: [x64]
- os: [darwin]
-
- '@nx/nx-freebsd-x64@19.8.14':
- resolution: {integrity: sha512-TK2xuXn+BI6hxGaRK1HRUPWeF/nOtezKSqM+6rbippfCzjES/crmp9l5nbI764MMthtUmykCyWvhEfkDca6kbA==}
- engines: {node: '>= 10'}
- cpu: [x64]
- os: [freebsd]
-
- '@nx/nx-linux-arm-gnueabihf@19.8.14':
- resolution: {integrity: sha512-33rptyRraqaeQ2Kq6pcZKQqgnYY/7zcGH8fHXgKK7XzKk+7QuPViq+jMEUZP5E3UzZPkIYhsfmZcZqhNRvepJQ==}
- engines: {node: '>= 10'}
- cpu: [arm]
- os: [linux]
-
- '@nx/nx-linux-arm64-gnu@19.8.14':
- resolution: {integrity: sha512-2E70qMKOhh7Fp4JGcRbRLvFKq0+ANVdAgSzH47plxOLygIeVAfIXRSuQbCI0EUFa5Sy6hImLaoRSB2GdgKihAw==}
- engines: {node: '>= 10'}
- cpu: [arm64]
- os: [linux]
-
- '@nx/nx-linux-arm64-musl@19.8.14':
- resolution: {integrity: sha512-ltty/PDWqkYgu/6Ye65d7v5nh3D6e0n3SacoKRs2Vtfz5oHYRUkSKizKIhEVfRNuHn3d9j8ve1fdcCN4SDPUBQ==}
- engines: {node: '>= 10'}
- cpu: [arm64]
- os: [linux]
-
- '@nx/nx-linux-x64-gnu@19.8.14':
- resolution: {integrity: sha512-JzE3BuO9RCBVdgai18CCze6KUzG0AozE0TtYFxRokfSC05NU3nUhd/o62UsOl7s6Bqt/9nwrW7JC8pNDiCi9OQ==}
- engines: {node: '>= 10'}
- cpu: [x64]
- os: [linux]
-
- '@nx/nx-linux-x64-musl@19.8.14':
- resolution: {integrity: sha512-2rPvDOQLb7Wd6YiU88FMBiLtYco0dVXF99IJBRGAWv+WTI7MNr47OyK2ze+JOsbYY1d8aOGUvckUvCCZvZKEfg==}
- engines: {node: '>= 10'}
- cpu: [x64]
- os: [linux]
-
- '@nx/nx-win32-arm64-msvc@19.8.14':
- resolution: {integrity: sha512-JxW+YPS+EjhUsLw9C6wtk9pQTG3psyFwxhab8y/dgk2s4AOTLyIm0XxgcCJVvB6i4uv+s1g0QXRwp6+q3IR6hg==}
- engines: {node: '>= 10'}
- cpu: [arm64]
- os: [win32]
-
- '@nx/nx-win32-x64-msvc@19.8.14':
- resolution: {integrity: sha512-RxiPlBWPcGSf9TzIIy62iKRdRhokXMDUsPub9DL2VdVyTMXPZQR25aY/PJeasJN1EQU74hg097LK2wSHi+vzOQ==}
- engines: {node: '>= 10'}
- cpu: [x64]
- os: [win32]
-
- '@sinclair/typebox@0.27.12':
- resolution: {integrity: sha512-hhyNJ+nbR6ZR7pToHvllEFun9TL0sbL+tk/ON75lo+Xas054uez98qRbsuNt7MBCyZKK4+8Yli/OAGZhmfBZ/g==}
-
- '@tybys/wasm-util@0.9.0':
- resolution: {integrity: sha512-6+7nlbMVX/PVDCwaIQ8nTOPveOcFLSt8GcXdx8hD0bt39uWxYT88uXzqTd4fTvqta7oeUJqudepapKNt2DYJFw==}
-
- '@types/node@20.19.43':
- resolution: {integrity: sha512-6oYBAi5ikg4Pl+kGsoYtawUMBT2zZMCvPNF7pVLnHZfd1zf38DRiWn/gT01RYCdUqkv7Fhr+C9ot4/tb+2sVvA==}
-
- '@yarnpkg/lockfile@1.1.0':
- resolution: {integrity: sha512-GpSwvyXOcOOlV70vbnzjj4fW5xW/FdUF6nQEt1ENy7m4ZCczi1+/buVUPAqmGfqznsORNFzUMjctTIp8a9tuCQ==}
-
- '@yarnpkg/parsers@3.0.0-rc.46':
- resolution: {integrity: sha512-aiATs7pSutzda/rq8fnuPwTglyVwjM22bNnK2ZgjrpAjQHSSl3lztd2f9evst1W/qnC58DRz7T7QndUDumAR4Q==}
- engines: {node: '>=14.15.0'}
-
- '@zkochan/js-yaml@0.0.7':
- resolution: {integrity: sha512-nrUSn7hzt7J6JWgWGz78ZYI8wj+gdIJdk0Ynjpp8l+trkn58Uqsf6RYrYkEK+3X18EX+TNdtJI0WxAtc+L84SQ==}
- hasBin: true
-
- agent-base@6.0.2:
- resolution: {integrity: sha512-RZNwNclF7+MS/8bDg70amg32dyeZGZxiDuQmZxKLAlQjr3jGyLx+4Kkk58UO7D2QdgFIQCovuSuZESne6RG6XQ==}
- engines: {node: '>= 6.0.0'}
-
- ansi-colors@4.1.3:
- resolution: {integrity: sha512-/6w/C21Pm1A7aZitlI5Ni/2J6FFQN8i1Cvz3kHABAAbw93v/NlvKdVOqz7CCWz/3iv/JplRSEEZ83XION15ovw==}
- engines: {node: '>=6'}
-
- ansi-regex@5.0.1:
- resolution: {integrity: sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==}
- engines: {node: '>=8'}
-
- ansi-styles@4.3.0:
- resolution: {integrity: sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==}
- engines: {node: '>=8'}
-
- ansi-styles@5.2.0:
- resolution: {integrity: sha512-Cxwpt2SfTzTtXcfOlzGEee8O+c+MmUgGrNiBcXnuWxuFJHe6a5Hz7qwhwe5OgaSYI0IJvkLqWX1ASG+cJOkEiA==}
- engines: {node: '>=10'}
-
- argparse@1.0.10:
- resolution: {integrity: sha512-o5Roy6tNG4SL/FOkCAN6RzjiakZS25RLYFrcMttJqbdd8BWrnA+fGz57iN5Pb06pvBGvl5gQ0B48dJlslXvoTg==}
-
- argparse@2.0.1:
- resolution: {integrity: sha512-8+9WqebbFzpX9OR+Wa6O29asIogeRMzcGtAINdpMHHyAg10f05aSFVBbcEqGf/PXw1EjAZ+q2/bEBg3DvurK3Q==}
-
- asynckit@0.4.0:
- resolution: {integrity: sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q==}
-
- axios@1.20.0:
- resolution: {integrity: sha512-r8aOh8j9cGKpgQAqpzrUHnSIc6a59Y3Xf/cv8sy1DrHCkZHzQGEuoq1tARk6qSyDdtQGSDgpb9kFlruzPvrgwg==}
-
- balanced-match@1.0.2:
- resolution: {integrity: sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw==}
-
- base64-js@1.5.1:
- resolution: {integrity: sha512-AKpaYlHn8t4SVbOHCy+b5+KKgvR4vrsD8vbvrbiQJps7fKDTkjkDry6ji0rUJjC0kzbNePLwzxq8iypo41qeWA==}
-
- bl@4.1.0:
- resolution: {integrity: sha512-1W07cM9gS6DcLperZfFSj+bWLtaPGSOHWhPiGzXmvVJbRLdG82sH/Kn8EtW1VqWVA54AKf2h5k5BbnIbwF3h6w==}
-
- brace-expansion@2.1.4:
- resolution: {integrity: sha512-hGfVzPxthbf3+2yjg/RBs60cB0FhqBS/zvdV/4wn4/BmN0bNMMHPc4V/BbFieqf1TKAGGAHnY4eSjajCl0f2Xg==}
-
- buffer@5.7.1:
- resolution: {integrity: sha512-EHcyIPBQ4BSGlvjB16k5KgAJ27CIsHY/2JBmCRReo48y9rQ3MaUzWX3KVlBa4U7MyX02HdVj0K7C3WaB3ju7FQ==}
-
- call-bind-apply-helpers@1.0.2:
- resolution: {integrity: sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==}
- engines: {node: '>= 0.4'}
-
- chalk@4.1.2:
- resolution: {integrity: sha512-oKnbhFyRIXpUuez8iBMmyEa4nbj4IOQyuhc/wy9kY7/WVPcwIO9VA668Pu8RkO7+0G76SLROeyw9CpQ061i4mA==}
- engines: {node: '>=10'}
-
- cli-cursor@3.1.0:
- resolution: {integrity: sha512-I/zHAwsKf9FqGoXM4WWRACob9+SNukZTd94DWF57E4toouRulbCxcUh6RKUEOQlYTHJnzkPMySvPNaaSLNfLZw==}
- engines: {node: '>=8'}
-
- cli-spinners@2.6.1:
- resolution: {integrity: sha512-x/5fWmGMnbKQAaNwN+UZlV79qBLM9JFnJuJ03gIi5whrob0xV0ofNVHy9DhwGdsMJQc2OKv0oGmLzvaqvAVv+g==}
- engines: {node: '>=6'}
-
- cliui@8.0.1:
- resolution: {integrity: sha512-BSeNnyus75C4//NQ9gQt1/csTXyo/8Sb+afLAkzAptFuMsod9HFokGNudZpi/oQV73hnVK+sR+5PVRMd+Dr7YQ==}
- engines: {node: '>=12'}
-
- clone@1.0.4:
- resolution: {integrity: sha512-JQHZ2QMW6l3aH/j6xCqQThY/9OH4D/9ls34cgkUBiEeocRTU04tHfKPBsUK1PqZCUQM7GiA0IIXJSuXHI64Kbg==}
- engines: {node: '>=0.8'}
-
- color-convert@2.0.1:
- resolution: {integrity: sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==}
- engines: {node: '>=7.0.0'}
-
- color-name@1.1.4:
- resolution: {integrity: sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==}
-
- combined-stream@1.0.8:
- resolution: {integrity: sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==}
- engines: {node: '>= 0.8'}
-
- debug@4.4.3:
- resolution: {integrity: sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==}
- engines: {node: '>=6.0'}
- peerDependencies:
-      supports-color: '*'
- peerDependenciesMeta:
-      supports-color:
-        optional: true
-
- defaults@1.0.4:
- resolution: {integrity: sha512-eFuaLoy/Rxalv2kr+lqMlUnrDWV+3j4pljOIJgLIhI058IQfWJ7vXhyEIHu+HtC738klGALYxOKDO0bQP3tg8A==}
-
- define-lazy-prop@2.0.0:
- resolution: {integrity: sha512-Ds09qNh8yw3khSjiJjiUInaGX9xlqZDY7JVryGxdxV7NPeuqQfplOpQ66yJFZut3jLa5zOwkXw1g9EI2uKh4Og==}
- engines: {node: '>=8'}
-
- delayed-stream@1.0.0:
- resolution: {integrity: sha512-ZySD7Nf91aLB0RxL4KGrKHBXl7Eds1DAmEdcoVawXnLD7SDhpNgtuII2aAkg7a7QS41jxPSZ17p4VdGnMHk3MQ==}
- engines: {node: '>=0.4.0'}
-
- diff-sequences@29.6.3:
- resolution: {integrity: sha512-EjePK1srD3P08o2j4f0ExnylqRs5B9tJjcp9t1krH2qRi8CCdsYfwe9JgSLurFBWwq4uOlipzfk5fHNvwFKr8Q==}
- engines: {node: ^14.15.0 || ^16.10.0 || >=18.0.0}
-
- dotenv-expand@11.0.7:
- resolution: {integrity: sha512-zIHwmZPRshsCdpMDyVsqGmgyP0yT8GAgXUnkdAoJisxvf33k7yO6OuoKmcTGuXPWSsm8Oh88nZicRLA9Y0rUeA==}
- engines: {node: '>=12'}
-
- dotenv@16.4.7:
- resolution: {integrity: sha512-47qPchRCykZC03FhkYAhrvwU4xDBFIj1QPqaarj6mdM/hgUzfPHcpkHJOn3mJAufFeeAxAzeGsr5X0M4k6fLZQ==}
- engines: {node: '>=12'}
-
- dunder-proto@1.0.1:
- resolution: {integrity: sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==}
- engines: {node: '>= 0.4'}
-
- duplexer@0.1.2:
- resolution: {integrity: sha512-jtD6YG370ZCIi/9GTaJKQxWTZD045+4R4hTk/x1UyoqadyJ9x9CgSi1RlVDQF8U2sxLLSnFkCaMihqljHIWgMg==}
-
- emoji-regex@8.0.0:
- resolution: {integrity: sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==}
-
- end-of-stream@1.4.5:
- resolution: {integrity: sha512-ooEGc6HP26xXq/N+GCGOT0JKCLDGrq2bQUZrQ7gyrJiZANJ/8YDTxTpQBXGMn+WbIQXNVpyWymm7KYVICQnyOg==}
-
- enquirer@2.3.6:
- resolution: {integrity: sha512-yjNnPr315/FjS4zIsUxYguYUPP2e1NK4d7E7ZOLiyYCcbFBiTMyID+2wvm2w6+pZ/odMA7cRkjhsPbltwBOrLg==}
- engines: {node: '>=8.6'}
-
- es-define-property@1.0.1:
- resolution: {integrity: sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==}
- engines: {node: '>= 0.4'}
-
- es-errors@1.3.0:
- resolution: {integrity: sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==}
- engines: {node: '>= 0.4'}
-
- es-object-atoms@1.1.2:
- resolution: {integrity: sha512-HWcBoN6NileqtSydK2FqHbS/LoDd2pqrnQHLyJzBj4kOp/ky2MWMN694xOfkK8/SnUsW2DH7EfyVlydKCsm1Zw==}
- engines: {node: '>= 0.4'}
-
- es-set-tostringtag@2.1.0:
- resolution: {integrity: sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==}
- engines: {node: '>= 0.4'}
-
- escalade@3.2.0:
- resolution: {integrity: sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==}
- engines: {node: '>=6'}
-
- escape-string-regexp@1.0.5:
- resolution: {integrity: sha512-vbRorB5FUQWvla16U8R/qgaFIya2qGzwDrNmCZuYKrbdSUMG6I1ZCGQRefkRVhuOkIGVne7BQ35DSfo1qvJqFg==}
- engines: {node: '>=0.8.0'}
-
- esprima@4.0.1:
- resolution: {integrity: sha512-eGuFFw7Upda+g4p+QHvnW0RyTX/SVeJBDM/gCtMARO0cLuT2HcEKnTPvhjV6aGeqrCB/sbNop0Kszm0jsaWU4A==}
- engines: {node: '>=4'}
- hasBin: true
-
- figures@3.2.0:
- resolution: {integrity: sha512-yaduQFRKLXYOGgEn6AZau90j3ggSOyiqXU0F9JZfeXYhNa+Jk4X+s45A2zg5jns87GAFa34BBm2kXw4XpNcbdg==}
- engines: {node: '>=8'}
-
- flat@5.0.2:
- resolution: {integrity: sha512-b6suED+5/3rTpUBdG1gupIl8MPFCAMA0QXwmljLhvCUKcUvdE4gWky9zpuGCcXHOsz4J9wPGNWq6OKpmIzz3hQ==}
- hasBin: true
-
- follow-redirects@1.16.0:
- resolution: {integrity: sha512-y5rN/uOsadFT/JfYwhxRS5R7Qce+g3zG97+JrtFZlC9klX/W5hD7iiLzScI4nZqUS7DNUdhPgw4xI8W2LuXlUw==}
- engines: {node: '>=4.0'}
- peerDependencies:
-      debug: '*'
- peerDependenciesMeta:
-      debug:
-        optional: true
-
- form-data@4.0.6:
- resolution: {integrity: sha512-vKatAh4SlVfgbv+YtmhiRjhEMJsYpsG1Y2rMQtR+SVSbytsSD1YGzDIcrAJmdFec88u/+VoGmxnl+80gL1tRCQ==}
- engines: {node: '>= 6'}
-
- front-matter@4.0.2:
- resolution: {integrity: sha512-I8ZuJ/qG92NWX8i5x1Y8qyj3vizhXS31OxjKDu3LKP+7/qBgfIKValiZIEwoVoJKUHlhWtYrktkxV1XsX+pPlg==}
-
- fs-constants@1.0.0:
- resolution: {integrity: sha512-y6OAwoSIf7FyjMIv94u+b5rdheZEjzR63GTyZJm5qh4Bi+2YgwLCcI/fPFZkL5PSixOt6ZNKm+w+Hfp/Bciwow==}
-
- function-bind@1.1.2:
- resolution: {integrity: sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==}
-
- get-caller-file@2.0.5:
- resolution: {integrity: sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==}
- engines: {node: 6.* || 8.* || >= 10.*}
-
- get-intrinsic@1.3.0:
- resolution: {integrity: sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==}
- engines: {node: '>= 0.4'}
-
- get-proto@1.0.1:
- resolution: {integrity: sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==}
- engines: {node: '>= 0.4'}
-
- gopd@1.2.0:
- resolution: {integrity: sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==}
- engines: {node: '>= 0.4'}
-
- has-flag@4.0.0:
- resolution: {integrity: sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==}
- engines: {node: '>=8'}
-
- has-symbols@1.1.0:
- resolution: {integrity: sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==}
- engines: {node: '>= 0.4'}
-
- has-tostringtag@1.0.2:
- resolution: {integrity: sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==}
- engines: {node: '>= 0.4'}
-
- hasown@2.0.4:
- resolution: {integrity: sha512-T2UbfbBEF32wiepXIsMlTW9+dDYC6wMh/t/vYA4tuOMKqWz/n3vr1NFSxQiyP+zk2mXsoMA/i/7qV6LKut1t1A==}
- engines: {node: '>= 0.4'}
-
- https-proxy-agent@5.0.1:
- resolution: {integrity: sha512-dFcAjpTQFgoLMzC2VwU+C/CbS7uRL0lWmxDITmqm7C+7F0Odmj6s9l6alZc6AELXhrnggM2CeWSXHGOdX2YtwA==}
- engines: {node: '>= 6'}
-
- ieee754@1.2.1:
- resolution: {integrity: sha512-dcyqhDvX1C46lXZcVqCpK+FtMRQVdIMN6/Df5js2zouUsqG7I6sFxitIC+7KYK29KdXOLHdu9zL4sFnoVQnqaA==}
-
- ignore@5.3.2:
- resolution: {integrity: sha512-hsBTNUqQTDwkWtcdYI2i06Y/nUBEsNEDJKjWdigLvegy8kDuJAS8uRlpkkcQpyEXL0Z/pjDy5HBmMjRCJ2gq+g==}
- engines: {node: '>= 4'}
-
- inherits@2.0.4:
- resolution: {integrity: sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==}
-
- is-docker@2.2.1:
- resolution: {integrity: sha512-F+i2BKsFrH66iaUFc0woD8sLy8getkwTwtOBjvs56Cx4CgJDeKQeqfz8wAYiSb8JOprWhHH5p77PbmYCvvUuXQ==}
- engines: {node: '>=8'}
- hasBin: true
-
- is-fullwidth-code-point@3.0.0:
- resolution: {integrity: sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==}
- engines: {node: '>=8'}
-
- is-interactive@1.0.0:
- resolution: {integrity: sha512-2HvIEKRoqS62guEC+qBjpvRubdX910WCMuJTZ+I9yvqKU2/12eSL549HMwtabb4oupdj2sMP50k+XJfB/8JE6w==}
- engines: {node: '>=8'}
-
- is-unicode-supported@0.1.0:
- resolution: {integrity: sha512-knxG2q4UC3u8stRGyAVJCOdxFmv5DZiRcdlIaAQXAbSfJya+OhopNotLQrstBhququ4ZpuKbDc/8S6mgXgPFPw==}
- engines: {node: '>=10'}
-
- is-wsl@2.2.0:
- resolution: {integrity: sha512-fKzAra0rGJUUBwGBgNkHZuToZcn+TtXHpeCgmkMJMMYx1sQDYaCSyjJBSCa2nH1DGm7s3n1oBnohoVTBaN7Lww==}
- engines: {node: '>=8'}
-
- jest-diff@29.7.0:
- resolution: {integrity: sha512-LMIgiIrhigmPrs03JHpxUh2yISK3vLFPkAodPeo0+BuF7wA2FoQbkEg1u8gBYBThncu7e1oEDUfIXVuTqLRUjw==}
- engines: {node: ^14.15.0 || ^16.10.0 || >=18.0.0}
-
- jest-get-type@29.6.3:
- resolution: {integrity: sha512-zrteXnqYxfQh7l5FHyL38jL39di8H8rHoecLH3JNxH3BwOrBsNeabdap5e0I23lD4HHI8W5VFBZqG4Eaq5LNcw==}
- engines: {node: ^14.15.0 || ^16.10.0 || >=18.0.0}
-
- js-yaml@3.15.2:
- resolution: {integrity: sha512-6EuL879VkRA+1Cz578mKMiKvjPNEuk6+r1JaFzoSWejZmtf7xWbIyw1e3KkxlkzTIt9Taw6JBhEppG7utc1P+w==}
- hasBin: true
-
- json5@2.2.3:
- resolution: {integrity: sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==}
- engines: {node: '>=6'}
- hasBin: true
-
- jsonc-parser@3.2.0:
- resolution: {integrity: sha512-gfFQZrcTc8CnKXp6Y4/CBT3fTc0OVuDofpre4aEeEpSBPV5X5v4+Vmx+8snU7RLPrNHPKSgLxGo9YuQzz20o+w==}
-
- lines-and-columns@2.0.3:
- resolution: {integrity: sha512-cNOjgCnLB+FnvWWtyRTzmB3POJ+cXxTA81LoW7u8JdmhfXzriropYwpjShnz1QLLWsQwY7nIxoDmcPTwphDK9w==}
- engines: {node: ^12.20.0 || ^14.13.1 || >=16.0.0}
-
- log-symbols@4.1.0:
- resolution: {integrity: sha512-8XPvpAA8uyhfteu8pIvQxpJZ7SYYdpUivZpGy6sFsBuKRY/7rQGavedeB8aK+Zkyq6upMFVL/9AW6vOYzfRyLg==}
- engines: {node: '>=10'}
-
- math-intrinsics@1.1.0:
- resolution: {integrity: sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==}
- engines: {node: '>= 0.4'}
-
- mime-db@1.52.0:
- resolution: {integrity: sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==}
- engines: {node: '>= 0.6'}
-
- mime-types@2.1.35:
- resolution: {integrity: sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==}
- engines: {node: '>= 0.6'}
-
- mimic-fn@2.1.0:
- resolution: {integrity: sha512-OqbOk5oEQeAZ8WXWydlu9HJjz9WVdEIvamMCcXmuqUYjTknH/sqsWvhQ3vgwKFRR1HpjvNBKQ37nbJgYzGqGcg==}
- engines: {node: '>=6'}
-
- minimatch@9.0.3:
- resolution: {integrity: sha512-RHiac9mvaRw0x3AYRgDC1CxAP7HTcNrrECeA8YYJeWnpo+2Q5CegtZjaotWTWxDG3UeGA1coE05iH1mPjT/2mg==}
- engines: {node: '>=16 || 14 >=14.17'}
-
- minimist@1.2.8:
- resolution: {integrity: sha512-2yyAR8qBkN3YuheJanUpWC5U3bb5osDywNB8RzDVlDwDHbocAJveqqj1u8+SVD7jkWT4yvsHCpWqqWqAxb0zCA==}
-
- ms@2.1.3:
- resolution: {integrity: sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==}
-
- node-machine-id@1.1.12:
- resolution: {integrity: sha512-QNABxbrPa3qEIfrE6GOJ7BYIuignnJw7iQ2YPbc3Nla1HzRJjXzZOiikfF8m7eAMfichLt3M4VgLOetqgDmgGQ==}
-
- npm-run-path@4.0.1:
- resolution: {integrity: sha512-S48WzZW777zhNIrn7gxOlISNAqi9ZC/uQFnRdbeIHhZhCA6UqpkOT8T1G7BvfdgP4Er8gF4sUbaS0i7QvIfCWw==}
- engines: {node: '>=8'}
-
- nx@19.8.14:
- resolution: {integrity: sha512-yprBOWV16eQntz5h5SShYHMVeN50fUb6yHfzsqNiFneCJeyVjyJ585m+2TuVbE11vT1amU0xCjHcSGfJBBnm8g==}
- hasBin: true
- peerDependencies:
-      '@swc-node/register': ^1.8.0
-      '@swc/core': ^1.3.85
- peerDependenciesMeta:
-      '@swc-node/register':
-        optional: true
-      '@swc/core':
-        optional: true
-
- once@1.4.0:
- resolution: {integrity: sha512-lNaJgI+2Q5URQBkccEKHTQOPaXdUxnZZElQTZY0MFUAuaEqe1E+Nyvgdz/aIyNi6Z9MzO5dv1H8n58/GELp3+w==}
-
- onetime@5.1.2:
- resolution: {integrity: sha512-kbpaSSGJTWdAY5KPVeMOKXSrPtr8C8C7wodJbcsd51jRnmD+GZu8Y0VoU6Dm5Z4vWr0Ig/1NKuWRKf7j5aaYSg==}
- engines: {node: '>=6'}
-
- open@8.4.2:
- resolution: {integrity: sha512-7x81NCL719oNbsq/3mh+hVrAWmFuEYUqrq/Iw3kUzH8ReypT9QQ0BLoJS7/G9k6N81XjW4qHWtjWwe/9eLy1EQ==}
- engines: {node: '>=12'}
-
- ora@5.3.0:
- resolution: {integrity: sha512-zAKMgGXUim0Jyd6CXK9lraBnD3H5yPGBPPOkC23a2BG6hsm4Zu6OQSjQuEtV0BHDf4aKHcUFvJiGRrFuW3MG8g==}
- engines: {node: '>=10'}
-
- path-key@3.1.1:
- resolution: {integrity: sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==}
- engines: {node: '>=8'}
-
- pretty-format@29.7.0:
- resolution: {integrity: sha512-Pdlw/oPxN+aXdmM9R00JVC9WVFoCLTKJvDVLgmJ+qAffBMxsV85l/Lu7sNx4zSzPyoL2euImuEwHhOXdEgNFZQ==}
- engines: {node: ^14.15.0 || ^16.10.0 || >=18.0.0}
-
- proxy-from-env@2.1.0:
- resolution: {integrity: sha512-cJ+oHTW1VAEa8cJslgmUZrc+sjRKgAKl3Zyse6+PV38hZe/V6Z14TbCuXcan9F9ghlz4QrFr2c92TNF82UkYHA==}
- engines: {node: '>=10'}
-
- react-is@18.3.1:
- resolution: {integrity: sha512-/LLMVyas0ljjAtoYiPqYiL8VWXzUUdThrmU5+n20DZv+a+ClRoevUzw5JxU+Ieh5/c87ytoTBV9G1FiKfNJdmg==}
-
- readable-stream@3.6.2:
- resolution: {integrity: sha512-9u/sniCrY3D5WdsERHzHE4G2YCXqoG5FTHUiCC4SIbr6XcLZBY05ya9EKjYek9O5xOAwjGq+1JdGBAS7Q9ScoA==}
- engines: {node: '>= 6'}
-
- require-directory@2.1.1:
- resolution: {integrity: sha512-fGxEI7+wsG9xrvdjsrlmL22OMTTiHRwAMroiEeMgq8gzoLC/PQr7RsRDSTLUg/bZAZtF+TVIkHc6/4RIKrui+Q==}
- engines: {node: '>=0.10.0'}
-
- restore-cursor@3.1.0:
- resolution: {integrity: sha512-l+sSefzHpj5qimhFSE5a8nufZYAM3sBSVMAPtYkmC+4EH2anSGaEMXSD0izRQbu9nfyQ9y5JrVmp7E8oZrUjvA==}
- engines: {node: '>=8'}
-
- safe-buffer@5.2.1:
- resolution: {integrity: sha512-rp3So07KcdmmKbGvgaNxQSJr7bGVSVk5S9Eq1F+ppbRo70+YeaDxkw5Dd8NPN+GD6bjnYm2VuPuCXmpuYvmCXQ==}
-
- semver@7.8.5:
- resolution: {integrity: sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==}
- engines: {node: '>=10'}
- hasBin: true
-
- signal-exit@3.0.7:
- resolution: {integrity: sha512-wnD2ZE+l+SPC/uoS0vXeE9L1+0wuaMqKlfz9AMUo38JsyLSBWSFcHR1Rri62LZc12vLr1gb3jl7iwQhgwpAbGQ==}
-
- sprintf-js@1.0.3:
- resolution: {integrity: sha512-D9cPgkvLlV3t3IzL0D0YLvGA9Ahk4PcvVwUbN0dSGr1aP0Nrt4AEnTUbuGvquEC0mA64Gqt1fzirlRs5ibXx8g==}
-
- string-width@4.2.3:
- resolution: {integrity: sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==}
- engines: {node: '>=8'}
-
- string_decoder@1.3.0:
- resolution: {integrity: sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==}
-
- strip-ansi@6.0.1:
- resolution: {integrity: sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==}
- engines: {node: '>=8'}
-
- strip-bom@3.0.0:
- resolution: {integrity: sha512-vavAMRXOgBVNF6nyEEmL3DBK19iRpDcoIwW+swQ+CbGiu7lju6t+JklA1MHweoWtadgt4ISVUsXLyDq34ddcwA==}
- engines: {node: '>=4'}
-
- strong-log-transformer@2.1.0:
- resolution: {integrity: sha512-B3Hgul+z0L9a236FAUC9iZsL+nVHgoCJnqCbN588DjYxvGXaXaaFbfmQ/JhvKjZwsOukuR72XbHv71Qkug0HxA==}
- engines: {node: '>=4'}
- hasBin: true
-
- supports-color@7.2.0:
- resolution: {integrity: sha512-qpCAvRl9stuOHveKsn7HncJRvv501qIacKzQlO/+Lwxc9+0q2wLyv4Dfvt80/DPn2pqOBsJdDiogXGR9+OvwRw==}
- engines: {node: '>=8'}
-
- tar-stream@2.2.0:
- resolution: {integrity: sha512-ujeqbceABgwMZxEJnk2HDY2DlnUZ+9oEcb1KzTVfYHio0UE6dG71n60d8D2I4qNvleWrrXpmjpt7vZeF1LnMZQ==}
- engines: {node: '>=6'}
-
- through@2.3.8:
- resolution: {integrity: sha512-w89qg7PI8wAdvX60bMDP+bFoD5Dvhm9oLheFp5O4a2QF0cSBGsBX4qZmadPMvVqlLJBBci+WqGGOAPvcDeNSVg==}
-
- tmp@0.2.7:
- resolution: {integrity: sha512-e0votIpp4Uo2AJYSzVHV6xCcawuiez3DzqDAbrTc3YxBkplN6e+dM13ZeIcZnDg/QpSuU2zfZ3rzwY8ukEnaXw==}
- engines: {node: '>=14.14'}
-
- tsconfig-paths@4.2.0:
- resolution: {integrity: sha512-NoZ4roiN7LnbKn9QqE1amc9DJfzvZXxF4xDavcOWt1BPkdx+m+0gJuPM+S0vCe7zTJMYUP0R8pO2XMr+Y8oLIg==}
- engines: {node: '>=6'}
-
- tslib@2.8.1:
- resolution: {integrity: sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==}
-
- typescript@5.9.3:
- resolution: {integrity: sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==}
- engines: {node: '>=14.17'}
- hasBin: true
-
- undici-types@6.21.0:
- resolution: {integrity: sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==}
-
- util-deprecate@1.0.2:
- resolution: {integrity: sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==}
-
- wcwidth@1.0.1:
- resolution: {integrity: sha512-XHPEwS0q6TaxcvG85+8EYkbiCux2XtWG2mkc47Ng2A77BQu9+DqIOJldST4HgPkuea7dvKSj5VgX3P1d4rW8Tg==}
-
- wrap-ansi@7.0.0:
- resolution: {integrity: sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==}
- engines: {node: '>=10'}
-
- wrappy@1.0.2:
- resolution: {integrity: sha512-l4Sp/DRseor9wL6EvV2+TuQn63dMkPjZ/sp9XkghTEbV9KlPS1xUsZ3u7/IQO4wxtcFB4bgpQPRcR3QCvezPcQ==}
-
- y18n@5.0.8:
- resolution: {integrity: sha512-0pfFzegeDWJHJIAmTLRP2DwHjdF5s7jo9tuztdQxAhINCdvS+3nGINqPd00AphqJR/0LhANUS6/+7SCb98YOfA==}
- engines: {node: '>=10'}
-
- yargs-parser@21.1.1:
- resolution: {integrity: sha512-tVpsJW7DdjecAiFpbIB1e3qxIQsE6NoPc5/eTdrbbIC4h0LVsWhnoa3g+m2HclBIujHzsxZ4VJVA+GUuc2/LBw==}
- engines: {node: '>=12'}
-
- yargs@17.7.3:
- resolution: {integrity: sha512-GZtjxm/J/4TSxuL3FNYjCmLktBTnIw/rVmKSIyKeYAZpmJB2ig9VauCC5xsa82GNKVKDAqpOn3KVzNt0zmrU0g==}
- engines: {node: '>=12'}
-

+snapshots: +

- '@emnapi/core@1.11.3':
- dependencies:
-      '@emnapi/wasi-threads': 1.2.3
-      tslib: 2.8.1
-
- '@emnapi/runtime@1.11.3':
- dependencies:
-      tslib: 2.8.1
-
- '@emnapi/wasi-threads@1.2.3':
- dependencies:
-      tslib: 2.8.1
-
- '@jest/schemas@29.6.3':
- dependencies:
-      '@sinclair/typebox': 0.27.12
-
- '@napi-rs/wasm-runtime@0.2.4':
- dependencies:
-      '@emnapi/core': 1.11.3
-      '@emnapi/runtime': 1.11.3
-      '@tybys/wasm-util': 0.9.0
-
- '@nrwl/tao@19.8.14':
- dependencies:
-      nx: 19.8.14
-      tslib: 2.8.1
- transitivePeerDependencies:
-      - '@swc-node/register'
-      - '@swc/core'
-      - debug
-      - supports-color
-
- '@nx/nx-darwin-arm64@19.8.14':
- optional: true
-
- '@nx/nx-darwin-x64@19.8.14':
- optional: true
-
- '@nx/nx-freebsd-x64@19.8.14':
- optional: true
-
- '@nx/nx-linux-arm-gnueabihf@19.8.14':
- optional: true
-
- '@nx/nx-linux-arm64-gnu@19.8.14':
- optional: true
-
- '@nx/nx-linux-arm64-musl@19.8.14':
- optional: true
-
- '@nx/nx-linux-x64-gnu@19.8.14':
- optional: true
-
- '@nx/nx-linux-x64-musl@19.8.14':
- optional: true
-
- '@nx/nx-win32-arm64-msvc@19.8.14':
- optional: true
-
- '@nx/nx-win32-x64-msvc@19.8.14':
- optional: true
-
- '@sinclair/typebox@0.27.12': {}
-
- '@tybys/wasm-util@0.9.0':
- dependencies:
-      tslib: 2.8.1
-
- '@types/node@20.19.43':
- dependencies:
-      undici-types: 6.21.0
-
- '@yarnpkg/lockfile@1.1.0': {}
-
- '@yarnpkg/parsers@3.0.0-rc.46':
- dependencies:
-      js-yaml: 3.15.2
-      tslib: 2.8.1
-
- '@zkochan/js-yaml@0.0.7':
- dependencies:
-      argparse: 2.0.1
-
- agent-base@6.0.2:
- dependencies:
-      debug: 4.4.3
- transitivePeerDependencies:
-      - supports-color
-
- ansi-colors@4.1.3: {}
-
- ansi-regex@5.0.1: {}
-
- ansi-styles@4.3.0:
- dependencies:
-      color-convert: 2.0.1
-
- ansi-styles@5.2.0: {}
-
- argparse@1.0.10:
- dependencies:
-      sprintf-js: 1.0.3
-
- argparse@2.0.1: {}
-
- asynckit@0.4.0: {}
-
- axios@1.20.0:
- dependencies:
-      follow-redirects: 1.16.0
-      form-data: 4.0.6
-      https-proxy-agent: 5.0.1
-      proxy-from-env: 2.1.0
- transitivePeerDependencies:
-      - debug
-      - supports-color
-
- balanced-match@1.0.2: {}
-
- base64-js@1.5.1: {}
-
- bl@4.1.0:
- dependencies:
-      buffer: 5.7.1
-      inherits: 2.0.4
-      readable-stream: 3.6.2
-
- brace-expansion@2.1.4:
- dependencies:
-      balanced-match: 1.0.2
-
- buffer@5.7.1:
- dependencies:
-      base64-js: 1.5.1
-      ieee754: 1.2.1
-
- call-bind-apply-helpers@1.0.2:
- dependencies:
-      es-errors: 1.3.0
-      function-bind: 1.1.2
-
- chalk@4.1.2:
- dependencies:
-      ansi-styles: 4.3.0
-      supports-color: 7.2.0
-
- cli-cursor@3.1.0:
- dependencies:
-      restore-cursor: 3.1.0
-
- cli-spinners@2.6.1: {}
-
- cliui@8.0.1:
- dependencies:
-      string-width: 4.2.3
-      strip-ansi: 6.0.1
-      wrap-ansi: 7.0.0
-
- clone@1.0.4: {}
-
- color-convert@2.0.1:
- dependencies:
-      color-name: 1.1.4
-
- color-name@1.1.4: {}
-
- combined-stream@1.0.8:
- dependencies:
-      delayed-stream: 1.0.0
-
- debug@4.4.3:
- dependencies:
-      ms: 2.1.3
-
- defaults@1.0.4:
- dependencies:
-      clone: 1.0.4
-
- define-lazy-prop@2.0.0: {}
-
- delayed-stream@1.0.0: {}
-
- diff-sequences@29.6.3: {}
-
- dotenv-expand@11.0.7:
- dependencies:
-      dotenv: 16.4.7
-
- dotenv@16.4.7: {}
-
- dunder-proto@1.0.1:
- dependencies:
-      call-bind-apply-helpers: 1.0.2
-      es-errors: 1.3.0
-      gopd: 1.2.0
-
- duplexer@0.1.2: {}
-
- emoji-regex@8.0.0: {}
-
- end-of-stream@1.4.5:
- dependencies:
-      once: 1.4.0
-
- enquirer@2.3.6:
- dependencies:
-      ansi-colors: 4.1.3
-
- es-define-property@1.0.1: {}
-
- es-errors@1.3.0: {}
-
- es-object-atoms@1.1.2:
- dependencies:
-      es-errors: 1.3.0
-
- es-set-tostringtag@2.1.0:
- dependencies:
-      es-errors: 1.3.0
-      get-intrinsic: 1.3.0
-      has-tostringtag: 1.0.2
-      hasown: 2.0.4
-
- escalade@3.2.0: {}
-
- escape-string-regexp@1.0.5: {}
-
- esprima@4.0.1: {}
-
- figures@3.2.0:
- dependencies:
-      escape-string-regexp: 1.0.5
-
- flat@5.0.2: {}
-
- follow-redirects@1.16.0: {}
-
- form-data@4.0.6:
- dependencies:
-      asynckit: 0.4.0
-      combined-stream: 1.0.8
-      es-set-tostringtag: 2.1.0
-      hasown: 2.0.4
-      mime-types: 2.1.35
-
- front-matter@4.0.2:
- dependencies:
-      js-yaml: 3.15.2
-
- fs-constants@1.0.0: {}
-
- function-bind@1.1.2: {}
-
- get-caller-file@2.0.5: {}
-
- get-intrinsic@1.3.0:
- dependencies:
-      call-bind-apply-helpers: 1.0.2
-      es-define-property: 1.0.1
-      es-errors: 1.3.0
-      es-object-atoms: 1.1.2
-      function-bind: 1.1.2
-      get-proto: 1.0.1
-      gopd: 1.2.0
-      has-symbols: 1.1.0
-      hasown: 2.0.4
-      math-intrinsics: 1.1.0
-
- get-proto@1.0.1:
- dependencies:
-      dunder-proto: 1.0.1
-      es-object-atoms: 1.1.2
-
- gopd@1.2.0: {}
-
- has-flag@4.0.0: {}
-
- has-symbols@1.1.0: {}
-
- has-tostringtag@1.0.2:
- dependencies:
-      has-symbols: 1.1.0
-
- hasown@2.0.4:
- dependencies:
-      function-bind: 1.1.2
-
- https-proxy-agent@5.0.1:
- dependencies:
-      agent-base: 6.0.2
-      debug: 4.4.3
- transitivePeerDependencies:
-      - supports-color
-
- ieee754@1.2.1: {}
-
- ignore@5.3.2: {}
-
- inherits@2.0.4: {}
-
- is-docker@2.2.1: {}
-
- is-fullwidth-code-point@3.0.0: {}
-
- is-interactive@1.0.0: {}
-
- is-unicode-supported@0.1.0: {}
-
- is-wsl@2.2.0:
- dependencies:
-      is-docker: 2.2.1
-
- jest-diff@29.7.0:
- dependencies:
-      chalk: 4.1.2
-      diff-sequences: 29.6.3
-      jest-get-type: 29.6.3
-      pretty-format: 29.7.0
-
- jest-get-type@29.6.3: {}
-
- js-yaml@3.15.2:
- dependencies:
-      argparse: 1.0.10
-      esprima: 4.0.1
-
- json5@2.2.3: {}
-
- jsonc-parser@3.2.0: {}
-
- lines-and-columns@2.0.3: {}
-
- log-symbols@4.1.0:
- dependencies:
-      chalk: 4.1.2
-      is-unicode-supported: 0.1.0
-
- math-intrinsics@1.1.0: {}
-
- mime-db@1.52.0: {}
-
- mime-types@2.1.35:
- dependencies:
-      mime-db: 1.52.0
-
- mimic-fn@2.1.0: {}
-
- minimatch@9.0.3:
- dependencies:
-      brace-expansion: 2.1.4
-
- minimist@1.2.8: {}
-
- ms@2.1.3: {}
-
- node-machine-id@1.1.12: {}
-
- npm-run-path@4.0.1:
- dependencies:
-      path-key: 3.1.1
-
- nx@19.8.14:
- dependencies:
-      '@napi-rs/wasm-runtime': 0.2.4
-      '@nrwl/tao': 19.8.14
-      '@yarnpkg/lockfile': 1.1.0
-      '@yarnpkg/parsers': 3.0.0-rc.46
-      '@zkochan/js-yaml': 0.0.7
-      axios: 1.20.0
-      chalk: 4.1.2
-      cli-cursor: 3.1.0
-      cli-spinners: 2.6.1
-      cliui: 8.0.1
-      dotenv: 16.4.7
-      dotenv-expand: 11.0.7
-      enquirer: 2.3.6
-      figures: 3.2.0
-      flat: 5.0.2
-      front-matter: 4.0.2
-      ignore: 5.3.2
-      jest-diff: 29.7.0
-      jsonc-parser: 3.2.0
-      lines-and-columns: 2.0.3
-      minimatch: 9.0.3
-      node-machine-id: 1.1.12
-      npm-run-path: 4.0.1
-      open: 8.4.2
-      ora: 5.3.0
-      semver: 7.8.5
-      string-width: 4.2.3
-      strong-log-transformer: 2.1.0
-      tar-stream: 2.2.0
-      tmp: 0.2.7
-      tsconfig-paths: 4.2.0
-      tslib: 2.8.1
-      yargs: 17.7.3
-      yargs-parser: 21.1.1
- optionalDependencies:
-      '@nx/nx-darwin-arm64': 19.8.14
-      '@nx/nx-darwin-x64': 19.8.14
-      '@nx/nx-freebsd-x64': 19.8.14
-      '@nx/nx-linux-arm-gnueabihf': 19.8.14
-      '@nx/nx-linux-arm64-gnu': 19.8.14
-      '@nx/nx-linux-arm64-musl': 19.8.14
-      '@nx/nx-linux-x64-gnu': 19.8.14
-      '@nx/nx-linux-x64-musl': 19.8.14
-      '@nx/nx-win32-arm64-msvc': 19.8.14
-      '@nx/nx-win32-x64-msvc': 19.8.14
- transitivePeerDependencies:
-      - debug
-      - supports-color
-
- once@1.4.0:
- dependencies:
-      wrappy: 1.0.2
-
- onetime@5.1.2:
- dependencies:
-      mimic-fn: 2.1.0
-
- open@8.4.2:
- dependencies:
-      define-lazy-prop: 2.0.0
-      is-docker: 2.2.1
-      is-wsl: 2.2.0
-
- ora@5.3.0:
- dependencies:
-      bl: 4.1.0
-      chalk: 4.1.2
-      cli-cursor: 3.1.0
-      cli-spinners: 2.6.1
-      is-interactive: 1.0.0
-      log-symbols: 4.1.0
-      strip-ansi: 6.0.1
-      wcwidth: 1.0.1
-
- path-key@3.1.1: {}
-
- pretty-format@29.7.0:
- dependencies:
-      '@jest/schemas': 29.6.3
-      ansi-styles: 5.2.0
-      react-is: 18.3.1
-
- proxy-from-env@2.1.0: {}
-
- react-is@18.3.1: {}
-
- readable-stream@3.6.2:
- dependencies:
-      inherits: 2.0.4
-      string_decoder: 1.3.0
-      util-deprecate: 1.0.2
-
- require-directory@2.1.1: {}
-
- restore-cursor@3.1.0:
- dependencies:
-      onetime: 5.1.2
-      signal-exit: 3.0.7
-
- safe-buffer@5.2.1: {}
-
- semver@7.8.5: {}
-
- signal-exit@3.0.7: {}
-
- sprintf-js@1.0.3: {}
-
- string-width@4.2.3:
- dependencies:
-      emoji-regex: 8.0.0
-      is-fullwidth-code-point: 3.0.0
-      strip-ansi: 6.0.1
-
- string_decoder@1.3.0:
- dependencies:
-      safe-buffer: 5.2.1
-
- strip-ansi@6.0.1:
- dependencies:
-      ansi-regex: 5.0.1
-
- strip-bom@3.0.0: {}
-
- strong-log-transformer@2.1.0:
- dependencies:
-      duplexer: 0.1.2
-      minimist: 1.2.8
-      through: 2.3.8
-
- supports-color@7.2.0:
- dependencies:
-      has-flag: 4.0.0
-
- tar-stream@2.2.0:
- dependencies:
-      bl: 4.1.0
-      end-of-stream: 1.4.5
-      fs-constants: 1.0.0
-      inherits: 2.0.4
-      readable-stream: 3.6.2
-
- through@2.3.8: {}
-
- tmp@0.2.7: {}
-
- tsconfig-paths@4.2.0:
- dependencies:
-      json5: 2.2.3
-      minimist: 1.2.8
-      strip-bom: 3.0.0
-
- tslib@2.8.1: {}
-
- typescript@5.9.3: {}
-
- undici-types@6.21.0: {}
-
- util-deprecate@1.0.2: {}
-
- wcwidth@1.0.1:
- dependencies:
-      defaults: 1.0.4
-
- wrap-ansi@7.0.0:
- dependencies:
-      ansi-styles: 4.3.0
-      string-width: 4.2.3
-      strip-ansi: 6.0.1
-
- wrappy@1.0.2: {}
-
- y18n@5.0.8: {}
-
- yargs-parser@21.1.1: {}
-
- yargs@17.7.3:
- dependencies:
-      cliui: 8.0.1
-      escalade: 3.2.0
-      get-caller-file: 2.0.5
-      require-directory: 2.1.1
-      string-width: 4.2.3
-      y18n: 5.0.8
-      yargs-parser: 21.1.1

diff --git a/pnpm-workspace.yaml b/pnpm-workspace.yaml
new file mode 100644
index 0000000..c53e539
--- /dev/null
+++ b/pnpm-workspace.yaml
@@ -0,0 +1,3 @@
+packages:

- - 'apps/*'
- - 'packages/*'
    \ No newline at end of file

=== tracked files ===
.claude/skills/kidscare-architecture/SKILL.md
.claude/skills/kidscare-multi-tenancy/SKILL.md
.claude/skills/kidscare-naming-rules/SKILL.md
.claude/skills/kidscare-prisma-database/SKILL.md
.claude/skills/kidscare-shared-packages/SKILL.md
.claude/skills/kidscare-solid-modules/SKILL.md
.claude/skills/kidscare-testing/SKILL.md
.gitattributes
.gitignore
.superpowers/sdd/2026-09-13-infrastructure-layer/briefs/task-1-brief.md
.superpowers/sdd/2026-09-13-infrastructure-layer/progress.md
.superpowers/sdd/2026-09-13-infrastructure-layer/reports/task-1-report.md
CLAUDE.md
docs/superpowers/plans/2026-09-13-infrastructure-layer.md
docs/superpowers/specs/2026-09-13-infrastructure-layer-design.md
docs/superpowers/specs/2026-09-13-infrastructure-layer-design.tr.md
kres-uygulamasi-teknoloji-karar-raporu.md
nx.json
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
