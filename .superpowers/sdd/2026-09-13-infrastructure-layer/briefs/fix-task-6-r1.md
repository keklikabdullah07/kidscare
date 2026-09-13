# Fix Brief — R1 from Task 6 Review

## Context (1 line)

Task 6 reviewer flagged Important finding: `docker/init/01-roles.sql` does not grant `CREATEDB` or `CREATE ON SCHEMA public` to `kidscare_migrator`. Without these, `docker compose down -v && docker compose up -d` (which destroys the volume and re-runs init) re-introduces the Task 6 BLOCKED state. Fix is one SQL edit + one verification.

## Files to modify

- `docker/init/01-roles.sql`

## Steps

**Step 1:** Edit `docker/init/01-roles.sql` to add the two missing grants. After the existing `GRANT CONNECT ON DATABASE kidscare TO ...` lines, add:

```sql
ALTER ROLE kidscare_migrator CREATEDB;
GRANT CREATE ON SCHEMA public TO kidscare_migrator;
```

Place them in a clearly-labelled block:

```sql
-- kidscare_migrator needs CREATEDB + CREATE on schema to run prisma migrate reset
-- (drops + recreates the database) and to apply new migrations.
ALTER ROLE kidscare_migrator CREATEDB;
GRANT CREATE ON SCHEMA public TO kidscare_migrator;
```

**Step 2:** Verify by recreating the volume from scratch:

```bash
docker compose down -v
docker compose up -d
```

Wait ~10 seconds for Postgres to initialise (it runs both init scripts in alphabetical order). Then verify the role has the new privileges:

```bash
docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "\du kidscare_migrator"
```

Expected output includes `Attributes: Create DB`. Also:

```bash
docker exec -it kidscare-postgres psql -U postgres -d kidscare -c "SELECT has_schema_privilege('kidscare_migrator', 'public', 'CREATE');"
```

Expected: `t` (true).

**Step 3:** Re-apply the migration from scratch to prove the full path works (migrator role creates tables):

```bash
pnpm db:reset
```

Expected: same output as Task 6 Step 3 — drop + recreate + migration apply + no-op seed, no errors.

**Step 4:** Commit only the init script change (the volume was recreated but the init script is the durable change):

```bash
git add docker/init/01-roles.sql
git commit -m "fix(infra): grant CREATEDB + CREATE on schema to kidscare_migrator"
```

## Constraints (binding)

- Edit `docker/init/01-roles.sql` only. Do not change the migration SQL (that's already correct).
- The `ALTER ROLE ... CREATEDB` must run as a superuser (postgres user); the init script runs as superuser because that's how Postgres entrypoint scripts execute.
- The `GRANT CREATE ON SCHEMA public TO kidscare_migrator` requires the schema to exist. It does — `public` is the default schema, created by Postgres during initial bootstrap.
- Do not add the same grants to `kidscare_app` or `kidscare_auth_lookup` — they explicitly do NOT need to create or drop databases.

## Report contract

Append to `.superpowers/sdd/2026-09-13-infrastructure-layer/reports/fix-task-6-r1-report.md`:

```
## Status
DONE | BLOCKED

## One-line summary
<what you actually did>

## Test evidence
<output of \du and has_schema_privilege queries + pnpm db:reset>

## Self-review
- <anything you noticed>

## Commits
<commit hash>
```

Return ONLY: status, one-line summary, commit hash.
