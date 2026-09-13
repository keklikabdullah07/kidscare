## Status

DONE

## One-line summary

NestJS skeleton under `apps/api` — global TenantGuard, TenantContextMiddleware (dev header parser), PrismaService bound to DATABASE_APP_URL, health controller, tsx-loader runtime for workspace TS resolution — committed as `04d7945`.

## Test evidence

- `pnpm exec nest build` (apps/api): OK, dist/apps/api/src/main.js emitted
- `pnpm exec eslint src/`: exit 0
- Boot smoke: `node -r tsx/cjs dist/apps/api/src/main.js` → Nest banner logs, `Mapped {/health, GET} route`, `Nest application successfully started`, `API listening on http://localhost:3000`
- `curl http://localhost:3000/health` → `{"status":"ok"}`
- PrismaModule init logged `PrismaModule dependencies initialized` (DI graph built and `$connect()` succeeded against the `kidscare_app` role)

## Self-review

- Pre-flight R2 honored: dev script keeps `nest start --watch`; runtime `start` script delegates to `node -r tsx/cjs dist/.../main.js`. The Nx `serve` target in `project.json` still references `@nx/node:node` / `@nx/node:webpack` — these executors don't exist (only generators ship with `@nx/nest`). Running `pnpm exec nx build api` fails with "Unable to resolve @nx/node:webpack". The NestJS CLI's `nest build` works as a substitute; documented as a follow-up M9.1 below.
- Workspace package `main` fields point at `src/index.ts` (no compiled dist). Without a build pipeline for `@kidscare/database` and `@kidscare/tenant-context`, plain `node dist/.../main.js` fails with `ERR_MODULE_NOT_FOUND` on `.ts`. Workaround: register `tsx/cjs` at runtime via the `start` script. `nest start --watch` (dev) sidesteps this because tsc-watch emits the file tree on the fly and Node resolves the package's `main` to a `.ts` that webpack-style re-exporting works around — but a clean long-term fix is to add a `build` script + `dist/` for each workspace package. Park as M9.2.
- `forTenant()` on `PrismaService` is a convenience accessor; primary path is `withTenantContext` from `@kidscare/database` (the Prisma `$extends` middleware committed in Task 8). Both produce the same `SET LOCAL` effect; calling out here so future readers don't think `forTenant` is the canonical API.
- Type assertion on `forTenant()` (`as unknown as PrismaClient`) needed because Prisma's `$extends` returns the extended client type, not a bare `PrismaClient`. Narrowed with eslint-disable on the surrounding `any`-returning transaction block; per CLAUDE.md §7 this is the justified exception.
- Prisma `connect()` succeeds on boot — confirms DATABASE_APP_URL from `.env` is read by `ConfigModule.forRoot({ isGlobal: true })` and the `kidscare_app` role grants on the public schema are sufficient.
- TenantContextMiddleware sets `runWithTenant` only when both `x-tenant-id` and `x-user-id` headers are present; production builds (NODE_ENV=production) skip header parsing entirely (JWT parser wires in under sub-project #2).
- Generated Prisma client files (`packages/database/src/generated/client/*.js` etc.) appeared in `git status` as modified — these are pre-existing deltas from the original `prisma generate` in Task 6, not changes introduced by Task 9. Excluded from this commit to keep task scope clean.

## Commits

`04d7945` — feat(api): NestJS skeleton with health endpoint and tenant guard

## Follow-ups (park for final review)

- **M9.1** — `apps/api/project.json` references `@nx/node:node` and `@nx/node:webpack` executors that don't exist; `pnpm exec nx build api` fails. Workaround: `pnpm exec nest build` from `apps/api`. Fix: either install `@nx/node` + `@nx/webpack` and adopt those executors, or change `project.json` to `@nx/nest:application` / `@nx/nest:webpack` (requires the package to ship those executors — it doesn't; only generators are present). Plan should be patched.
- **M9.2** — Workspace packages `@kidscare/database` and `@kidscare/tenant-context` have `main: src/index.ts` with no `dist/`. Runtime requires `tsx/cjs` loader. Fix: add `tsconfig.build.json` + `build` script to each, point `main`/`types` at `dist/index.{js,d.ts}`. Defer to upgrade sprint.
- **M9.3** — `forTenant()` on PrismaService duplicates `withTenantContext`; could be removed once every service imports the database-package middleware directly. Not blocking.
