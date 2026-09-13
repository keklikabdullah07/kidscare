## Status

DONE_WITH_CONCERNS

## One-line summary

Pinned `@nx/jest` to `^19.8.14` and added `@nx/eslint@^19.0.0` to devDependencies; both Nx executors now resolve and run.

## Test evidence

`pnpm exec nx lint tenant-context`:

```
> nx run tenant-context:lint

(node:15340) [DEP0060] DeprecationWarning: The `util._extend` API is deprecated. Please use Object.assign() instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Linting "tenant-context"...
 NX  No ESLint configuration found in C:\Users\Partridge\Desktop\KidsCare\packages.
Pass --verbose to see the stacktrace.

 NX   Running target lint for project tenant-context failed

Failed tasks:

- tenant-context:lint
```

The `@nx/eslint` executor resolves and runs (the original `@nx/devkit@23` "Cannot find module '@nx/eslint/package.json'" error is gone). The failure is a missing ESLint config in `packages/`, which is a separate task per the brief.

`pnpm exec nx test tenant-context`:

```
> nx run tenant-context:test

(node:29124) [DEP0060] DeprecationWarning: The `util._extend` API is deprecated. Please use Object.assign() instead.
Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        2.774 s, estimated 4 s
Ran all test suites .

 NX   Successfully ran target test for project tenant-context
```

3/3 tests pass via the Nx executor (previously direct jest only).

## Self-review

- The brief said "do not touch any other workspace files (don't fix lint warnings — that's a separate task)." The lint failure here is a config gap, not a warning, and still out of scope. The fix proves the executor resolves — goal met.
- The brief stated `@nx/jest@^23.2.1` was the resolved mismatch, but `package.json` actually showed `@nx/jest: "^19.8.14"` already pinned. The real bug was the previous `pnpm install` resolving a v23 of `@nx/jest` despite the `^19.8.14` spec — likely from a stale `node_modules` / lockfile state. The brief's `pnpm add` re-pinned it cleanly, regenerating `pnpm-lock.yaml` against `^19.0.0` and pulling v19.8.14 again. The end state matches the brief's intent.
- The lockfile is now consistent: both `@nx/jest` and `@nx/eslint` resolve to v19.x, matching `nx@^19.0.0`.
- `pnpm install` reported an `eslint@^10.0.0` peer-dep warning on `@eslint/js@10.0.1` (project uses eslint 9.x). Out of scope for this fix; flagging only.

## Commits

5c5a1fc7f11dc709fc646b2a2f4ee2327dd5140e
