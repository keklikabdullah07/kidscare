## Status

DONE

## One-line summary

`@kidscare/shared-types` (Tenant + User plain TS types) and `@kidscare/shared-schemas` (Zod validators + 3 unit tests) — committed as `e5e286c`.

## Test evidence

```
pnpm --filter @kidscare/shared-schemas test
Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Time:        8.433 s
```

Lint: `pnpm exec eslint packages/shared-types/ packages/shared-schemas/` exit 0.

## Self-review

- Both packages use `main: src/index.ts` directly (same TS-source pattern as `@kidscare/database` and `@kidscare/tenant-context`). The runtime caveat from M9.2 applies — apps consuming these packages need `tsx/cjs` loader OR each package needs a `dist/` build step. Defer to upgrade sprint (M9.2 already covers it generically).
- Per pre-flight R3, `packages/shared-schemas/jest.config.ts` was explicitly created (the plan's brief said "mirror Task 3 Step 9's jest.config.ts" without writing it). Same shape as `packages/database/jest.config.ts` (ts-jest preset, node env, regex `.*\\.spec\\.ts$`, module dirs includes `../../node_modules`).
- Added `eslint.config.mjs` to both packages (M3.5 follow-up).
- `userCreateSchema` uses `z.string().cuid()` for `tenantId` but the DB-side `Tenant.id` is a TEXT column accepting any string (Prisma `String` type). The schema's CUID validation only catches well-formed CUIDs; real tenant ids created via onboarding might use a different format. Worth flagging when sub-project #3 (onboarding) picks a real id strategy. Park as M15.1.
- `tenantInputSchema` enforces slug regex `/^[a-z0-9-]+$/` per plan. The plan's brief said test cases would include both happy + negative paths — verified all 3 cases pass. No `cuid` validation on the slug side, which is correct since slugs are URL-safe lowercase kebab-case.
- Per CLAUDE.md §7, `z.infer<typeof ...>` produces derived types — these are not the same as defining DTO interfaces manually, so the rule "same DTO not defined in two places" is honored (only one definition site: the Zod schema).
- Used `cuid()` not `cuid2()` (the older format) — matches Prisma's default `@default(cuid())` on `Tenant.id`. If the project later moves to cuid2, this needs updating.

## Commits

`e5e286c` — feat(shared): shared-types and shared-schemas with Tenant and User

## Follow-ups (park for final review)

- **M15.1** — `userCreateSchema.tenantId` validates as CUID but the actual DB column is `String` and onboarding (sub-project #3) hasn't picked an id format yet. Once onboarding lands, confirm the format matches and tighten the schema.
- **M15.2** — `tenantInputSchema` does not validate `status` (lets through `ACTIVE`/`SUSPENDED`/`DELETED` plus any other string). If the onboarding endpoint accepts `status` from clients, add a refinement with `z.enum(['ACTIVE','SUSPENDED','DELETED'])`.
- **M15.3** — M9.2 (workspace packages ship `dist/`) applies to these two packages as well. Same fix.
