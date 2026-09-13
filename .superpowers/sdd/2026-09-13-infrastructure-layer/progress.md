# SDD ledger — plan: docs/superpowers/plans/2026-09-13-infrastructure-layer.md

## Identity
- Plan: `docs/superpowers/plans/2026-09-13-infrastructure-layer.md`
- Spec: `docs/superpowers/specs/2026-09-13-infrastructure-layer-design.md`
- Workspace: `.superpowers/sdd/2026-09-13-infrastructure-layer/`
- Branch: main (no worktree — project is not yet a git repo; Task 1 of the plan inits git)

## Pre-flight scan

| Pair / Item | Checked | Notes |
|---|---|---|
| Tasks 1 ↔ 2 | package.json scripts added by Task 1 used by Task 2 (`pnpm exec prettier`, `pnpm exec eslint`) | Clean — Task 1 installs only Nx + TS; Task 2 installs lint deps. |
| Task 4 docker init vs Task 6 migration grants | Init script creates the three roles; migration grants `GRANT SELECT ... ON tenants/users TO kidscare_auth_lookup`. | Clean — grants are column-level on existing tables; roles exist by then. |
| Task 6 `prisma migrate dev` regenerates SQL | Risk: re-running `prisma migrate dev` creates new migrations and loses hand-edited RLS SQL. | Mitigation: only run `prisma migrate dev` once for the initial migration. Future schema changes use `prisma migrate dev --name <change>` which adds new migrations; the init migration's RLS is preserved because it's a separate file. |
| Task 8 `tenant.middleware.ts` has stub-then-replace pattern | Plan text shows a stub implementation followed by a "replace with the cleaner, real implementation" block. | Conflict — implementer could write both blocks or skip the replacement. See R1. |
| Task 9 `nest start --watch` vs `@nx/node:node` executor | Plan defines both `start:dev` script (NestJS CLI) and `serve` target (Nx). | Both work; NestJS CLI owns watch mode. See R2. |
| Task 11 `slug=a` / `slug=b` uniqueness | `@@unique([slug])` on `Tenant`. Two distinct slugs — no collision. | Clean. |
| Task 12 Vite + Vitest, `jsx: react-jsx` and TS noEmit | Vitest needs Node test environment OR jsdom. Plan uses jsdom. | Clean. |
| Task 15 `jest.config.ts` referenced but not created | Plan says "mirror Task 3 Step 9's jest.config.ts" without writing it. | Gap. See R3. |
| Global constraints coverage | Three-role separation, FORCE RLS, generated client committed, `DATABASE_AUTH_LOOKUP_URL` import restriction | All covered in tasks. Clean. |

## Rulings

**R1** — Task 8 ships only the final `withTenantContext` implementation. The throwaway stub block in the plan text is removed from the brief handed to the implementer. Cost if wrong: implementer writes the stub but never replaces it; middleware would be a no-op. Catchable in review.

**R2** — Task 9 uses the NestJS CLI for dev (`nest start --watch`) and Nx for build/lint/test. `dev:api` script in the workspace `package.json` calls `pnpm --filter @kidscare/api start:dev`. The Nx `serve` target delegates to `start:dev`. Cost if wrong: dev server fails to start with confusing Nx/NestJS interaction. Catchable on first `pnpm dev:api`.

**R3** — Task 15 explicitly creates `packages/shared-schemas/jest.config.ts` (and matching `project.json` if needed) using the same shape as Task 3 Step 9. The brief for Task 15 includes the file content verbatim. Cost if wrong: tests in shared-schemas fail to run or don't get picked up by the package-level test command. Catchable on test run.
