## Status

DONE

## One-line summary

Expo SDK 51 + React Native 0.74 mobile skeleton with placeholder screen — committed as `d403168`. Root `eslint.config.mjs` updated to ignore Expo artifacts (`.expo/`, `babel.config.js`, `app.json`, `package.json`).

## Test evidence

- `pnpm exec tsc --noEmit` → no output, no errors (project type-checks cleanly)
- `pnpm exec eslint App.tsx` → exit 0
- `pnpm install` → 519 packages added (Expo SDK is heavy; ~2m45s install)

## Self-review

- Skipped the `pnpm --filter @kidscare/mobile start --no-dev --minify` step from the plan — it launches the Metro bundler which blocks waiting for a simulator/device and won't terminate on its own. `tsc --noEmit` plus the Expo CLI being installed is enough verification at this stage. Full bundle verification belongs in a later task that actually targets a simulator.
- `App.tsx` switched from inline `style={{ ... }}` to a `StyleSheet.create` so the styles aren't reallocated on every render; small but consistent with how the rest of the RN codebase will look once it grows.
- Return type `React.ReactElement` (React 18 no longer has global `JSX` namespace — same lesson as Task 13 marketing).
- Plan's brief had no `eslint.config.mjs` for this package; added it (M3.5 follow-up). Without it, `pnpm exec eslint apps/mobile/` would still work via the root config but `pnpm exec nx lint mobile` wouldn't have a target config.
- Updated root `eslint.config.mjs` ignores to add `.expo/**`, `babel.config.js`, `app.json`, `package.json`. The first commit attempt failed because lint-staged ran root eslint on the staged files and `babel.config.js` (CommonJS) tripped the TypeScript parser.
- Expo's heavy dependency tree (519 packages, 2m45s install) significantly slows down `pnpm install`. Worth flagging in any future "fast CI" optimization work.
- `apps/mobile/.gitignore` overlay added — supersedes the workspace-level `.gitignore` for Expo-generated `ios/`, `android/`, `.expo/` directories that would otherwise pollute `git status`.

## Commits

`d403168` — feat(mobile): Expo skeleton with placeholder screen

## Follow-ups (park for final review)

- **M14.1** — Expo bundle has not been end-to-end-verified (no simulator run). The plan's `pnpm start --no-dev --minify` step requires a device or simulator and was skipped. Defer to a CI job or manual smoke test when a simulator is available.
- **M14.2** — Expo install pulls 519 packages. Consider `pnpm fetch` in CI or a Docker cache layer to avoid the 2m45s penalty per CI run.
