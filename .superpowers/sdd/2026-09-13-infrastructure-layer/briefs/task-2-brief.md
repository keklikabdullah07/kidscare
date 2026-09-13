# Task 2 Brief — Base TypeScript, ESLint, Prettier, Husky

## Context (1 line)

Task 2 of 16 — after Task 1 created the Nx workspace and git repo; this task sets up the linting, formatting, and pre-commit tooling that every subsequent task will use.

## Files to create

- `tsconfig.base.json`
- `eslint.config.mjs`
- `.prettierrc`
- `.husky/pre-commit`
- `.lintstagedrc.json`

## Steps (verbatim from the plan, follow exactly)

**Step 1:** Create `tsconfig.base.json` at the workspace root with the contents shown in the plan (strict, paths, target ES2022, etc.). Use the exact JSON from the plan.

**Step 2:** Install lint/format tooling at the workspace root (dev deps). NOTE: drop `-w` from `pnpm add` since the workspace root has its own `package.json` and pnpm treats it as the root by default.

```bash
cd C:\Users\Partridge\Desktop\KidsCare
pnpm add -D eslint@^9.0.0 @eslint/js typescript-eslint eslint-config-prettier prettier husky lint-staged
```

**Step 3:** Create `eslint.config.mjs` with the exact contents from the plan (flat config, typescript-eslint type-checked, custom `no-explicit-any: error`, `no-floating-promises: error`, `consistent-type-imports: error`, spec files relaxed to `warn`, plus prettier compatibility).

**Step 4:** Create `.prettierrc` with the exact contents from the plan.

**Step 5:** Initialise Husky and create the pre-commit hook.

```bash
pnpm exec husky init
```

This creates `.husky/pre-commit` (with sample content) and `.husky/_/`. Then REPLACE the contents of `.husky/pre-commit` with:

```sh
pnpm exec lint-staged
```

(Overwrite the file with `Set-Content` or `Out-File` — do not append.)

**Step 6:** Create `.lintstagedrc.json` with the exact contents from the plan.

**Step 7:** Run the formatters to confirm everything resolves.

```bash
pnpm exec prettier --check .
pnpm exec eslint .
```

Expected: prettier reports no diffs (no source files to format yet, but the config must resolve); eslint reports no errors.

If prettier complains about the `tsconfig.base.json` indentation or formatting (it's JSON, not TS, but prettier still parses it), this is fine — the `--check` only fails on diffs in files prettier would rewrite.

If eslint fails because there are no `.ts` files at the root yet, that is fine — empty file set is not an error in flat config.

**Step 8:** Commit.

```bash
git add .
git commit -m "chore: configure base TypeScript, ESLint, Prettier, Husky"
```

## Constraints (binding)

- Husky v9+ (current at install time) is required. Husky v8 used a different init flow.
- `eslint.config.mjs` must use flat config (ESM `.mjs`). Do not write `.eslintrc.cjs` or `eslintrc.json`.
- The `no-explicit-any` rule is `error` in `.ts`/`.tsx`, `warn` only in `*.spec.ts`, `*.test.ts`, `*.test.tsx`.
- `.prettierrc` overrides prettier's defaults for `.prisma` files (singleQuote: false) — do not remove this override.
- Husky's `pre-commit` must run `pnpm exec lint-staged`, not direct `eslint` / `prettier` (lint-staged orchestrates staged-file selection).
- Do not add `.husky/_/` to `.gitignore` — Husky manages that directory and it should be tracked.

## Report contract

Append to `.superpowers/sdd/2026-09-13-infrastructure-layer/reports/task-2-report.md`:

```
## Status
DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## One-line summary
<what you actually did>

## Test evidence
<command run + relevant output — for Task 2 the evidence is `prettier --check` and `eslint` outputs>

## Self-review
- <anything you noticed and fixed or that you want the reviewer to look at>

## Commits
<commit hashes>
```

Return ONLY: status, one-line summary, commit hashes.
