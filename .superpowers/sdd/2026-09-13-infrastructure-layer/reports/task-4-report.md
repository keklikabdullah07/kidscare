## Status

DONE

## One-line summary

Verified pre-existing files (port 5433 applied per user override), booted Postgres 16 + Redis 7 stack with `pnpm db:up`, confirmed both services healthy, the three KidsCare roles were created by `01-roles.sql`, and granted `USAGE ON SCHEMA public` to `kidscare_app` and `kidscare_auth_lookup`, then committed the four files with the brief's exact message.

## Test evidence

### Pre-existing files verified (Steps 1-4)

- `.env.example` — 9 lines. All three DATABASE_*_URLs use `localhost:5433` (port change applied per user override; scarlett-postgres holds host 5432). REDIS_URL, JWT_SECRET, NODE_ENV, PORT all present.
- `docker/init/02-extensions.sql` — 2 lines (`uuid-ossp`, `pgcrypto`). Matches brief verbatim.
- `docker/init/01-roles.sql` — 7 lines (3 CREATE ROLE + 3 GRANT CONNECT + leading comment). Matches brief verbatim.
- `docker-compose.yml` — `postgres:16-alpine` + `redis:7-alpine`, healthchecks (`pg_isready` / `redis-cli ping`), host port `5433:5432` (port change applied per user override).

### Step 5 — PASS

Command: `pnpm db:up`

```
> kidscare@0.0.0 db:up C:\Users\Partridge\Desktop\KidsCare
> docker compose up -d

 Network kidscare_default Creating
 Network kidscare_default Created
 Container kidscare-redis Creating
 Container kidscare-postgres Creating
 Container kidscare-redis Created
 Container kidscare-postgres Created
 Container kidscare-redis Starting
 Container kidscare-postgres Starting
 Container kidscare-redis Started
 Container kidscare-postgres Started
```

Command: `docker compose ps` (after 10s settle)

```
NAME                IMAGE                COMMAND                  SERVICE    CREATED          STATUS                    PORTS
kidscare-postgres   postgres:16-alpine   "docker-entrypoint.s…"   postgres   20 seconds ago   Up 19 seconds (healthy)   0.0.0.0:5433->5432/tcp, [::]:5433->5432/tcp
kidscare-redis      redis:7-alpine       "docker-entrypoint.s…"   redis      20 seconds ago   Up 19 seconds (healthy)   0.0.0.0:6379->6379/tcp, [::]:6379->6379/tcp
```

Both containers healthy. Host port mapping confirms `5433->5432` for Postgres (scarlett's 5432 is untouched).

### Step 6 — PASS

Command: `docker exec kidscare-postgres psql -U postgres -d kidscare -c "\du"`
(Note: `-it` from the brief was dropped because Git Bash on Windows can't allocate a TTY; behaviour identical — `-t` is cosmetic.)

```
                                   List of roles
      Role name       |                         Attributes
----------------------+------------------------------------------------------------
 kidscare_app         |
 kidscare_auth_lookup |
 kidscare_migrator    |
 postgres             | Superuser, Create role, Create DB, Replication, Bypass RLS
```

All three KidsCare roles present.

### Step 7 — PASS

Command: `docker exec kidscare-postgres psql -U postgres -d kidscare -c "GRANT USAGE ON SCHEMA public TO kidscare_app, kidscare_auth_lookup;"`

```
GRANT
```

Output is `GRANT` as expected.

### Step 8 — PASS

```
$ git add .env.example docker docker-compose.yml
$ git status
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        new file:   .env.example
        new file:   docker-compose.yml
        new file:   docker/init/01-roles.sql
        new file:   docker/init/02-extensions.sql
```

Only the four expected files staged. `.env`, `.superpowers/...`, and the unrelated modified reports/progress were correctly left out.

## Self-review

- **Port 5432 conflict from previous attempt is resolved.** User directed kidscare to host port 5433 to coexist with scarlett-postgres. `docker compose ps` confirms `kidscare-postgres` binds `0.0.0.0:5433` (not 5432). scarlett's container is untouched. The three DATABASE_*_URLs and the compose `ports:` mapping are internally consistent at 5433.

- **Init-script ordering honoured.** `01-roles.sql` runs before `02-extensions.sql` alphabetically. Postgres's `docker-entrypoint-initdb.d` runs them in lexical order, but Postgres ignores `CREATE EXTENSION` when called as a role other than a superuser only if the extension isn't already there — and `02-extensions.sql` is run by the superuser `postgres`, so GRANTs on extensions are not needed in this script. No issue observed.

- **Role creation confirms init volume mount works.** The brief's failure mode ("if you see only the postgres superuser, the init script didn't run — check that `docker/init/` is mounted") is not applicable: all three roles are present, so the `volumes: - ./docker/init:/docker-entrypoint-initdb.d:ro` bind is functioning correctly.

- **TTY workaround is benign.** The brief's commands use `docker exec -it ...`. On Git Bash under Windows, `docker exec -t` (allocate pseudo-TTY) fails with "cannot attach stdin to a TTY-enabled container because stdin is not a terminal" when stdin isn't a pipe. Output is identical to the `-it` form for non-interactive `psql -c` invocations, and the brief specifies `\du` and a `GRANT` statement whose success/failure does not depend on TTY behaviour. No re-run needed.

- **`.env` was not created and `.env.example` was the only env file touched.** `.env` is gitignored per the brief; `git status` confirms it is not staged.

- **`pnpm-lock.yaml` unchanged.** No dependencies were installed in this task. `git add` did not touch it.

- **`lint-staged` warning on commit is informational, not a failure.** The four staged files are `.yml`, `.sql`, and `.env.example` — none match lint-staged's `*.{ts,tsx,js,jsx}` (or similar) glob, so the hook reports "could not find any staged files matching configured tasks" and exits 0. Commit succeeded (4 files, 56 insertions).

- **Working tree at report time:** 4 files committed, 1 prior commit intact on `main`. Pre-existing modified reports (`task-1-report.md`, `progress.md`) and other untracked briefs/reviews/reports from earlier tasks were correctly left alone — out of scope for Task 4.

## Commits

`3811032` — `feat(infra): docker-compose with Postgres + Redis and three-role separation`
