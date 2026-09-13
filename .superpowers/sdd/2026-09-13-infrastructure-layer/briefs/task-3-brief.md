# Task 3 Brief — Create `packages/tenant-context`

## Context (1 line)

Task 3 of 16 — after Tasks 1-2 created the Nx workspace and lint/format tooling; this task creates the foundational `packages/tenant-context` library that exports an `AsyncLocalStorage` wrapper, which the Prisma middleware (Task 8) and the NestJS middleware (Task 9) will both consume.

## Files to create

- `packages/tenant-context/package.json`
- `packages/tenant-context/tsconfig.json`
- `packages/tenant-context/project.json`
- `packages/tenant-context/jest.config.ts`
- `packages/tenant-context/src/tenant-context.ts`
- `packages/tenant-context/src/run-with-tenant.ts`
- `packages/tenant-context/src/index.ts`
- `packages/tenant-context/src/tenant-context.spec.ts`

## Steps (verbatim from the plan, follow exactly)

**Step 1:** Create `packages/tenant-context/package.json`:

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

**Step 2:** Create `packages/tenant-context/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist" },
  "include": ["src/**/*.ts"]
}
```

**Step 3:** Create `packages/tenant-context/project.json`:

```json
{
  "name": "tenant-context",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "packages/tenant-context/src",
  "projectType": "library",
  "targets": {
    "lint": { "executor": "@nx/eslint:lint" },
    "test": {
      "executor": "@nx/jest:jest",
      "options": { "jestConfig": "packages/tenant-context/jest.config.ts" }
    }
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

Expected: FAIL — module `./index` not found (or similar). This is the failing-test step. Capture the failure output for the report.

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

**Step 9:** Set up Jest for the package.

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
pnpm add -D jest ts-jest @types/jest @nx/jest
```

**Step 10:** Update `packages/tenant-context/package.json`'s `scripts.test` to call jest directly. Replace the `echo` line with `"test": "jest"`. The `@nx/jest:jest` executor from the project.json will pick this up.

**Step 11:** Run the test. Expected: PASS.

```bash
pnpm --filter @kidscare/tenant-context test
```

**Step 12:** Commit.

```bash
git add packages/tenant-context package.json pnpm-lock.yaml
git commit -m "feat(tenant-context): AsyncLocalStorage wrapper with runWithTenant helper"
```

Only stage the new package files and the root `package.json` / `pnpm-lock.yaml` if they changed (they will, due to Step 9's install).

## Constraints (binding)

- Use Node's built-in `node:async_hooks` (not `async_hooks` without prefix).
- `TenantContextValue` is a union of `{ ... } | null`, NOT `{ ... } | undefined`. The `null` is the deliberate signal that no context was set.
- `runWithTenant` must accept `null` as `value` (so callers can run code "outside" any tenant context — the middleware uses this).
- Do not add a barrel export `src/index.ts` that re-exports anything other than what's listed in Step 8.
- The test file uses `*.spec.ts` suffix; Jest config picks this up via `testMatch`.
- `ts-jest` is the Jest preset for this project. Do not use `@swc/jest` or `babel-jest`.
- Jest deps go at the workspace root, not in the package's `package.json`. Nx convention.

## Report contract

Append to `.superpowers/sdd/2026-09-13-infrastructure-layer/reports/task-3-report.md`:

```
## Status
DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## One-line summary
<what you actually did>

## Test evidence
<command run + relevant output — for Task 3 the evidence is the FAIL output from Step 5 and the PASS output from Step 11>

## Self-review
- <anything you noticed and fixed or that you want the reviewer to look at>

## Commits
<commit hashes>
```

Return ONLY: status, one-line summary, commit hashes.
