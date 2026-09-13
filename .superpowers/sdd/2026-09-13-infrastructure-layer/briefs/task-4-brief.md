# Task 4 Brief — Docker Compose for Postgres + Redis

## Context (1 line)

Task 4 of 16 — after Tasks 1-3 set up the workspace, lint/format tooling, and the tenant-context library; this task provisions the local Postgres 16 + Redis 7 stack and creates the three Postgres roles (`kidscare_migrator`, `kidscare_app`, `kidscare_auth_lookup`) via a Postgres init script.

## Files to create

- `.env.example` (workspace root)
- `docker/init/02-extensions.sql`
- `docker/init/01-roles.sql`
- `docker-compose.yml`

## Steps (verbatim from the plan, follow exactly)

**Step 1:** Create `.env.example` at the workspace root with the exact contents from the plan (three DATABASE_*_URLs plus REDIS_URL, JWT_SECRET, NODE_ENV, PORT).

**Step 2:** Create `docker/init/02-extensions.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

**Step 3:** Create `docker/init/01-roles.sql` (verbatim from plan):

```sql
-- 02-extensions.sql runs first; roles must exist before grants apply.

CREATE ROLE kidscare_migrator LOGIN PASSWORD 'migrator_pw';
CREATE ROLE kidscare_app LOGIN PASSWORD 'app_pw';
CREATE ROLE kidscare_auth_lookup LOGIN PASSWORD 'auth_pw';

GRANT CONNECT ON DATABASE kidscare TO kidscare_migrator;
GRANT CONNECT ON DATABASE kidscare TO kidscare_app;
GRANT CONNECT ON DATABASE kidscare TO kidscare_auth_lookup;
```

**Step 4:** Create `docker-compose.yml` (verbatim from plan; Postgres 16 + Redis 7 with healthchecks).

**Step 5:** Boot the stack and verify Postgres is healthy.

```bash
pnpm db:up
docker compose ps
```

Expected: both `kidscare-postgres` and `kidscare-redis` show `healthy`. If `docker compose ps` shows `starting` or `unhealthy`, wait a few seconds and re-run; Postgres can take 5-10 seconds to initialize.

**Step 6:** Verify the three roles exist.

```bash
docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "\du"
```

Expected output includes `kidscare_migrator`, `kidscare_app`, `kidscare_auth_lookup`. If you see only the postgres superuser, the init script didn't run — check that `docker/init/` is mounted (the compose file's `volumes:` block binds `./docker/init:/docker-entrypoint-initdb.d:ro`). Re-check the compose file content.

**Step 7:** Grant `USAGE` on the public schema to the three roles so future tables inherit access. (Step 7 in the plan.)

```bash
docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "GRANT USAGE ON SCHEMA public TO kidscare_app, kidscare_auth_lookup;"
```

Expected: `GRANT`.

**Step 8:** Commit.

```bash
git add .env.example docker docker-compose.yml
git commit -m "feat(infra): docker-compose with Postgres + Redis and three-role separation"
```

Only stage `.env.example`, `docker/`, and `docker-compose.yml`. Do NOT stage `.env` (it's gitignored). Do NOT stage `pnpm-lock.yaml` unless it changed (it shouldn't for this task).

## Constraints (binding)

- Postgres image: `postgres:16-alpine`. Do not bump to 17 — out of scope for sub-project #1; tracked for later upgrade sprint.
- Redis image: `redis:7-alpine`. Same constraint.
- Init scripts run ALPHABETICALLY by Postgres. The naming `01-roles.sql` and `02-extensions.sql` matters: extensions must exist before any role uses them. Keep the naming.
- The three roles must be created on FIRST container start only. If `docker compose down -v` (which removes the volume) is run, the roles will be recreated. If `docker compose down` (without `-v`) is run, the roles persist.
- Healthchecks: Postgres uses `pg_isready`, Redis uses `redis-cli ping`. Do not change these.
- Docker Desktop must be running on Windows. If it's not, `docker compose ps` will hang or error with "Cannot connect to Docker daemon". Report `BLOCKED` in that case.
- `pnpm db:up` script is at workspace root and maps to `docker compose up -d`. Already present from Task 1.
- All passwords in the init script are dev-only placeholders (`migrator_pw`, `app_pw`, `auth_pw`). They match `.env.example`. Production deployment uses Docker secrets — out of scope here.

## Report contract

Append to `.superpowers/sdd/2026-09-13-infrastructure-layer/reports/task-4-report.md`:

```
## Status
DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED

## One-line summary
<what you actually did>

## Test evidence
<output of `docker compose ps`, `\du`, and the schema GRANT — paste the relevant lines>

## Self-review
- <anything you noticed>

## Commits
<commit hash>
```

Return ONLY: status, one-line summary, commit hash.
