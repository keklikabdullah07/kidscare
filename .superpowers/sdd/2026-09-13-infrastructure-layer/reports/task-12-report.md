## Status

DONE

## One-line summary

Vite + React 18 + Vitest skeleton for `apps/admin-web` — committed as `eb5c2ed`.

## Test evidence

- `pnpm exec vitest run` → 1 test, 1 file, passing (191 ms test, 11 s setup, 40 s jsdom env init)
- `pnpm exec vite build` → 30 modules transformed, `dist/index.html` 0.32 kB + `dist/assets/index-jkGNwzvc.js` 142.85 kB (45.90 kB gzip), 1.46 s
- `pnpm exec eslint src/` → exit 0

## Self-review

- `project.json` references `@nx/vite:*` executors that aren't installed (`@nx/vite` wasn't in the dependency tree). Running `pnpm exec nx build admin-web` would fail with "Unable to resolve @nx/vite:build". Scripts in `package.json` use plain `vite` / `vitest run` directly and work; Nx executor paths parked as M12.1.
- Added `eslint.config.mjs` (M3.5 follow-up from Task 3) so the package participates in the workspace lint.
- `main.tsx` throws if `#root` is missing instead of using `!` non-null assertion — safer runtime check.
- No backend integration yet; the App component is a placeholder. Real auth/tenant data wiring lives in sub-project #2 (JWT) and beyond.

## Commits

`eb5c2ed` — feat(admin-web): Vite + React skeleton with Vitest

## Follow-ups (park for final review)

- **M12.1** — `apps/admin-web/project.json` references `@nx/vite:dev-server`, `@nx/vite:build`, `@nx/vite:test` executors; only `@nx/eslint`, `@nx/jest`, `@nx/nest` are installed. Either install `@nx/vite` or drop the Nx targets and rely on the `package.json` scripts (current behavior).
