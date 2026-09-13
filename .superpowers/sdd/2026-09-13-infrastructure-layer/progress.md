# SDD ledger — plan: docs/superpowers/plans/2026-09-13-infrastructure-layer.md

## Identity

- Plan: `docs/superpowers/plans/2026-09-13-infrastructure-layer.md`
- Spec: `docs/superpowers/specs/2026-09-13-infrastructure-layer-design.md`
- Workspace: `.superpowers/sdd/2026-09-13-infrastructure-layer/`
- Branch: main (no worktree — project is not yet a git repo; Task 1 of the plan inits git)

## Pre-flight scan

| Pair / Item                                                 | Checked                                                                                                            | Notes                                                                                                                                                                                                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tasks 1 ↔ 2                                                 | package.json scripts added by Task 1 used by Task 2 (`pnpm exec prettier`, `pnpm exec eslint`)                     | Clean — Task 1 installs only Nx + TS; Task 2 installs lint deps.                                                                                                                                                                        |
| Task 4 docker init vs Task 6 migration grants               | Init script creates the three roles; migration grants `GRANT SELECT ... ON tenants/users TO kidscare_auth_lookup`. | Clean — grants are column-level on existing tables; roles exist by then.                                                                                                                                                                |
| Task 6 `prisma migrate dev` regenerates SQL                 | Risk: re-running `prisma migrate dev` creates new migrations and loses hand-edited RLS SQL.                        | Mitigation: only run `prisma migrate dev` once for the initial migration. Future schema changes use `prisma migrate dev --name <change>` which adds new migrations; the init migration's RLS is preserved because it's a separate file. |
| Task 8 `tenant.middleware.ts` has stub-then-replace pattern | Plan text shows a stub implementation followed by a "replace with the cleaner, real implementation" block.         | Conflict — implementer could write both blocks or skip the replacement. See R1.                                                                                                                                                         |
| Task 9 `nest start --watch` vs `@nx/node:node` executor     | Plan defines both `start:dev` script (NestJS CLI) and `serve` target (Nx).                                         | Both work; NestJS CLI owns watch mode. See R2.                                                                                                                                                                                          |
| Task 11 `slug=a` / `slug=b` uniqueness                      | `@@unique([slug])` on `Tenant`. Two distinct slugs — no collision.                                                 | Clean.                                                                                                                                                                                                                                  |
| Task 12 Vite + Vitest, `jsx: react-jsx` and TS noEmit       | Vitest needs Node test environment OR jsdom. Plan uses jsdom.                                                      | Clean.                                                                                                                                                                                                                                  |
| Task 15 `jest.config.ts` referenced but not created         | Plan says "mirror Task 3 Step 9's jest.config.ts" without writing it.                                              | Gap. See R3.                                                                                                                                                                                                                            |
| Global constraints coverage                                 | Three-role separation, FORCE RLS, generated client committed, `DATABASE_AUTH_LOOKUP_URL` import restriction        | All covered in tasks. Clean.                                                                                                                                                                                                            |

## Rulings

**R1** — Task 8 ships only the final `withTenantContext` implementation. The throwaway stub block in the plan text is removed from the brief handed to the implementer. Cost if wrong: implementer writes the stub but never replaces it; middleware would be a no-op. Catchable in review.

**R2** — Task 9 uses the NestJS CLI for dev (`nest start --watch`) and Nx for build/lint/test. `dev:api` script in the workspace `package.json` calls `pnpm --filter @kidscare/api start:dev`. The Nx `serve` target delegates to `start:dev`. Cost if wrong: dev server fails to start with confusing Nx/NestJS interaction. Catchable on first `pnpm dev:api`.

**R3** — Task 15 explicitly creates `packages/shared-schemas/jest.config.ts` (and matching `project.json` if needed) using the same shape as Task 3 Step 9. The brief for Task 15 includes the file content verbatim. Cost if wrong: tests in shared-schemas fail to run or don't get picked up by the package-level test command. Catchable on test run.

---

## Task ledger

### Task 1: Initialize Nx Workspace + pnpm

- Status: complete
- Commits: `0000000..716e83a` (initial commit)
- Review verdict: Spec PASS, Quality Approved
- Notes: pnpm was missing from PATH on first attempt (BLOCKED); installed globally via `npm install -g pnpm@9.15.0`; implementer retried successfully. Reviewer verdict on retry: clean.
- Minors (deferred to final review):
  - **M1.1** — `.superpowers/sdd/.../briefs/, reports/, progress.md, reviews/` were pulled into the initial commit because `.gitignore` was written before SDD workspace existed. Should be added to `.gitignore` and removed from the index. Out of scope for Task 1; defer to final review.
  - **M1.2** — Brief's Step 1 `pnpm add -Dw` commands are self-inconsistent for an empty workspace; implementer correctly dropped `-w` from individual adds (used `pnpm add -D` instead, equivalent). Plan text should be patched.
  - **M1.3** — `packageManager: "pnpm@9.0.0"` is a minimum-version pin; actual installed runtime is 9.15.0. Verbatim from the brief; left as-is.

### Task 2: Base TypeScript, ESLint, Prettier, Husky

- Status: complete
- Commits: `716e83a..8041ce9`
- Review verdict: Spec PASS, Quality Approved
- Notes: First implementer attempt stopped mid-task before commit; resumed with continuation message and finished cleanly.
- Rulings during execution:
  - **R4** — Branch was initialised as `master` (Git default on the controller's environment) instead of `main` (per the plan and Nx default). Renamed `master` → `main` immediately after Task 2 review. This affects `affected.defaultBase` in `nx.json` (already set to `main`); no other changes needed.
- Minors (deferred to final review):
  - **M2.1** — `@eslint/js` was not pinned and resolved to v10.x against eslint v9.x. Not a peer-dep blocker (eslint 9 accepts @eslint/js 9+), but should be pinned in the plan for reproducibility.
  - **M2.2** — Implementer added a root `tsconfig.json` extending `tsconfig.base.json` (not specified in plan). Required by `typescript-eslint` flat config `projectService: true`. Acceptable as deviation; plan should be patched for future reference.
  - **M2.3** — `pnpm add -D` (without `-w`) at workspace root was used; equivalent to `-Dw` in pnpm 9 since the root package.json is the workspace root. Brief text should clarify.
  - **M2.4** — `pnpm-lock.yaml` and `package.json` were modified to include all five new dev deps; verified.
  - **M2.5** — Husky `pre-commit` correctly invokes `pnpm exec lint-staged`; verified by lint-staged running during the commit itself.
  - **M2.6** — Reviewer flagged `.husky/_/` should remain tracked (Husky convention); verified present and tracked.

### Task 3: Create `packages/tenant-context`

- Status: complete
- Commits: `8041ce9..5c5a1fc` (Task 3 implementation + workspace Nx version fix)
- Review verdict: Spec PASS (with documented step reordering), Quality Approved
- Notes: Implementer correctly reordered TDD steps (installed Jest before running failing test) because the brief's `scripts.test: "echo 'no test runner yet'"` would have masked the real failure. Reviewer judged this correct engineering, not a deviation. Workspace Nx version mismatch surfaced and fixed in the same review scope.
- Rulings during execution:
  - **R5** — Workspace fix commit `5c5a1fc` is part of Task 3's deliverable scope (without it, the executor-driven tests would be broken). Pin `@nx/jest@^19.8.14` and `@nx/eslint@^19.0.0` at the root.
- Minors (deferred to final review):
  - **M3.1** — `ts-jest@29.x` resolved but `jest@30.x` is installed (caret ranges allowed both). Both work but minor version skew. Pin together or accept.
  - **M3.2** — `tenantContext` is exported as a bare `AsyncLocalStorage` instance; could be wrapped in a module-private getter to prevent direct mutation. Judgment call — keep as-is.
  - **M3.3** — `runWithTenant(null, ...)` branch is not covered by a unit test. Spec doesn't require it but it is the documented behaviour for the middleware. Add when convenient.
  - **M3.4** — `@nx/eslint@^19.0.0` (caret) but `@nx/jest@^19.8.14` (pinned) — mixed precision. Pin both for reproducibility.
- Info / forward-looking:
  - **M3.5** (lint config gap) — `packages/tenant-context/eslint.config.mjs` is missing; `pnpm exec nx lint tenant-context` fails on missing config. Same gap will affect every future package. Fix: include per-package `eslint.config.mjs` in Task 5 (database), Task 15 (shared-types, shared-schemas), Task 12 (admin-web), Task 13 (marketing), Task 14 (mobile), Task 9 (api). Remediation brief needed before Task 5 OR each task creates its own config.

### Task 4: Docker Compose for Postgres + Redis — in progress

- Status: BLOCKED twice; retrying with port change
- Notes: First BLOCKED was Docker Desktop not running (user fixed). Second BLOCKED was host port 5432 held by another project's `scarlett-postgres` container. Per user direction, scarlett stays running; host port shifted from 5432 → 5433 in `docker-compose.yml` and all three `DATABASE_*_URL` values in `.env.example`. Postgres inside the container still listens on 5432; only the host mapping changed.
- Rulings:
  - **R6** — Host port changed to 5433 to avoid clashing with `scarlett-postgres`. Container port stays 5432 (default for `postgres:16-alpine`). All `.env.example` URLs updated to `localhost:5433`. Plan text says `5432`; this is a documented deviation and will be reflected in the final review.

### Task 4: Docker Compose for Postgres + Redis

- Status: complete
- Commits: `5c5a1fc..3811032`
- Review verdict: Spec PASS, Quality Approved
- Notes: Two prior BLOCKED attempts (Docker Desktop down, then port 5432 conflict) resolved via user action (Docker Desktop started) + controller ruling (port shifted to 5433). Task 4 deliverable unchanged in spirit; only host-port differs from plan.
- Minors (deferred to final review):
  - **M4.1** — `ALTER DEFAULT PRIVILEGES` not set in init script; per-table GRANTs in Task 6 migration will cover this for now. Park for final review.
  - **M4.2** — Host port deviation (5433 vs plan's 5432) documented in R6.

### Task 5: Create `packages/database` (Prisma Schema Skeleton)

- Status: complete
- Commits: `3811032..9d2ce7d`
- Review verdict: Spec PASS, Quality Approved
- Notes: Two workspace tooling fixes were required to make the pre-commit hook accept the commit. Implementer correctly identified root causes and applied minimal fixes in the same commit.
- Rulings:
  - **R7** — Tooling fixes (`.lintstagedrc.json` removes `.prisma`, root `eslint.config.mjs` adds `ignores` for generated/migration dirs) are part of Task 5's deliverable scope because they unblock all future Prisma commits. Both are minimal, defensible changes; the root `.prettierrc`'s unused `.prisma` override is harmless dead config and stays for now.
- Minors (deferred to final review):
  - **M5.1** — Root `.prettierrc` retains an unused `overrides: [{ files: "*.prisma", ... }]` block now that `.lintstagedrc.json` no longer runs Prettier on `.prisma` files. Dead config; remove or repurpose in a future cleanup.
  - **M5.2** — `prisma` resolved to `5.22.0` (caret allowed; brief floor was `^5.10.0`). Normal pnpm behaviour; not blocking.

### Task 6: Initial Migration with RLS, FORCE RLS, and Grants

- Status: complete
- Commits: `9d2ce7d..48057fb..6b2a2b3` (Task 6 + Important fix R1)
- Review verdict: Spec PASS, Quality Approved (with 1 Important follow-up)
- Notes: Implementer granted `CREATEDB` + `CREATE ON SCHEMA public` to `kidscare_migrator` at runtime during Task 6; that worked but didn't persist in the init script. Reviewer flagged as Important (deployment hazard). Follow-up fix `6b2a2b3` updated `docker/init/01-roles.sql` and verified via `docker compose down -v && up` (init scripts re-run from scratch) + `pnpm db:reset`.
- Minors (deferred to final review):
  - **M6.1** — `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ... ON TABLES TO kidscare_app` was NOT added in the init script. Per-table GRANTs in the migration cover current tables; future tables created by the migrator will not automatically be accessible to `kidscare_app` until either ALTER DEFAULT PRIVILEGES is set or a manual GRANT is added per table. Out of scope for now; flag for the upgrade sprint.

### Task 7: Seed Script — BLOCKED, fixed via combined Task 6/7 fix `58d843c`

- Status: complete (after fix)
- Commits: `48057fb` (Task 6 attempt) → `6b2a2b3` (R1 fix) → `58d843c` (Task 6/7 fix)
- Review verdict: N/A (BLOCKED before review)
- Notes: Task 7 surfaced a real Postgres 16 behaviour: with `FORCE ROW LEVEL SECURITY` and a policy using `FOR ALL` with only `USING` (no explicit `WITH CHECK`), INSERT operations are still evaluated against the `USING` expression as a WITH CHECK, returning `42501 new row violates row-level security policy`. Verified by raw INSERT as `kidscare_migrator`. Fix is two coupled changes:
  1. Migration: explicit `FOR ALL` + `USING` + `WITH CHECK` on both policies
  2. Seed: fixed demo tenant id (`demo-tenant-seed-001`), wrapped upserts in `prisma.$transaction` so `SET LOCAL app.tenant_id` actually persists across the queries
- Rulings:
  - **R8** — Migration policies must include explicit `WITH CHECK` clauses (matching `USING`). Without them, even seed-time INSERT fails under FORCE RLS + FOR ALL. This is a Postgres 16 behaviour the original plan did not account for.
  - **R9** — Seed uses a fixed demo tenant id `demo-tenant-seed-001` (rather than auto-generated cuid) so the seed can `SET LOCAL app.tenant_id` to that exact value before inserts. Production tenants (created via onboarding, sub-project #3) will still use auto-generated cuids.
  - **R10** — Seed wrapped in `prisma.$transaction` because `SET LOCAL` only scopes to the current transaction; without the wrapper, `SET LOCAL` would have no effect on subsequent upserts. Plan's verbatim seed code missed this; implementer caught and fixed.
