# Task 1 Brief — Initialize Nx Workspace + pnpm

## Context (1 line)
First of 16 tasks in the KidsCare infrastructure bootstrap; the directory `C:\Users\Partridge\Desktop\KidsCare` currently holds only `CLAUDE.md`, `kres-uygulamasi-teknoloji-karar-raporu.md`, `docs/`, and `.claude/`. We start from an empty package.

## Files to create
- `package.json` (overwrite the one `pnpm init` creates)
- `pnpm-workspace.yaml`
- `nx.json`
- `.gitignore`
- `.gitattributes`

## Steps (verbatim from the plan, follow exactly)

**Step 1:** Open a terminal in `C:\Users\Partridge\Desktop\KidsCare`. Initialise an empty package and install Nx + pnpm tooling.

```bash
cd C:\Users\Partridge\Desktop\KidsCare
pnpm init
pnpm add -Dw nx@^19.0.0
pnpm add -Dw typescript@^5.4.0 @types/node@^20.0.0
```

**Step 2:** Replace the generated `package.json` with the workspace root manifest.

```json
{
  "name": "kidscare",
  "version": "0.0.0",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "engines": { "node": ">=20" },
  "scripts": {
    "db:up": "docker compose up -d",
    "db:down": "docker compose down",
    "db:migrate": "pnpm --filter @kidscare/database prisma migrate deploy",
    "db:migrate:dev": "pnpm --filter @kidscare/database prisma migrate dev",
    "db:seed": "pnpm --filter @kidscare/database prisma db seed",
    "db:reset": "pnpm --filter @kidscare/database prisma migrate reset --force",
    "dev:api": "pnpm --filter @kidscare/api start:dev",
    "dev:admin": "pnpm --filter @kidscare/admin-web dev",
    "dev:marketing": "pnpm --filter @kidscare/marketing dev",
    "dev:mobile": "pnpm --filter @kidscare/mobile start",
    "test": "pnpm exec nx run-many --target=test",
    "test:integration": "pnpm --filter @kidscare/api test:integration",
    "lint": "pnpm exec nx run-many --target=lint",
    "format": "pnpm exec nx format:write"
  },
  "devDependencies": {
    "nx": "^19.0.0",
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0"
  }
}
```

**Step 3:** Create `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Step 4:** Create `nx.json`:

```json
{
  "npmScope": "kidscare",
  "affected": { "defaultBase": "main" },
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": { "cacheableOperations": ["build", "test", "lint"] }
    }
  },
  "workspaceLayout": { "appsDir": "apps", "libsDir": "packages" }
}
```

**Step 5:** Create `.gitignore`:

```
node_modules/
dist/
.nx/
.turbo/
*.log
.env
.env.local
apps/mobile/.expo/
apps/mobile/node_modules/
coverage/
.next/
```

**Step 6:** Create `.gitattributes` to keep line endings consistent across OSes:

```
* text=auto eol=lf
*.png binary
*.jpg binary
*.ico binary
```

**Step 7:** Initialise git and create the first commit.

```bash
git init
git add .
git commit -m "chore: initialise Nx workspace with pnpm"
```

## Constraints (binding)
- Node 20+ must be installed. If `node --version` is below 20, report it as a blocker; do not attempt to upgrade Node.
- pnpm 9+ must be installed. If `pnpm --version` is below 9, report it as a blocker.
- The workspace is Windows. All commands use forward-slash paths in scripts but Windows-native paths for filesystem operations.
- Do not run `pnpm install` against any apps/packages that don't exist yet — there are no workspaces yet, so `pnpm install` will warn or error. Just install the dev deps at the root.
- The `pnpm init` command creates a default `package.json`; you must overwrite it in Step 2 with the manifest above (do not `pnpm init` again).

## Report contract

Append the following to `.superpowers/sdd/2026-09-13-infrastructure-layer/reports/task-1-report.md`:

```
## Status
DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## One-line summary
<what you actually did>

## Test evidence
<command run + relevant output — for Task 1 the only "test" is `pnpm --version` and the existence of the committed files; record both>

## Self-review
- <anything you noticed and fixed or that you want the reviewer to look at>

## Commits
<commit hashes, e.g. 7-char short form>
```

Then return ONLY: status, one-line summary, commit hashes. Nothing else.
