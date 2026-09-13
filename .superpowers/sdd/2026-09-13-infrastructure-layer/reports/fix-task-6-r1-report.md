## Status

DONE

## One-line summary

Added `CREATEDB` attribute and `CREATE ON SCHEMA public` grant for `kidscare_migrator` in `docker/init/01-roles.sql`; verified via volume-recreate (`docker compose down -v && docker compose up -d`) that the fresh init runs cleanly and `pnpm db:reset` applies the migration from scratch with no errors.

## Test evidence

### Step 2a — Role attributes after fresh init

```
$ docker exec kidscare-postgres psql -U postgres -d kidscare -c "\du kidscare_migrator"
         List of roles
     Role name     | Attributes
-------------------+------------
 kidscare_migrator | Create DB
```

`Create DB` attribute is present — `ALTER ROLE ... CREATEDB` ran successfully as superuser during init.

### Step 2b — Schema CREATE privilege

```
$ docker exec kidscare-postgres psql -U postgres -d kidscare -c "SELECT has_schema_privilege('kidscare_migrator', 'public', 'CREATE');"
 has_schema_privilege
----------------------
 t
(1 row)
```

`has_schema_privilege` returns `t` — `GRANT CREATE ON SCHEMA public` applied.

### Step 3 — `pnpm db:reset` from scratch (proves migrator can drop + recreate + apply)

```
> kidscare@0.0.0 db:reset C:\Users\Partridge\Desktop\KidsCare
> pnpm --filter @kidscare/database prisma migrate reset --force

Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "kidscare", schema "public" at "localhost:5433"

Applying migration `20260913152901_init`

Database reset successful

The following migration(s) have been applied:

migrations/
  └─ 20260913152901_init/
    └─ migration.sql

Running generate... (Use --skip-generate to skip the generators)
✔ Generated Prisma Client (v5.22.0) to .\src\generated\client in 94ms

Running seed command `tsx prisma/seed.ts` ...

The seed command has been executed.
```

Prisma `migrate reset` succeeded: dropped and recreated the database (requires `CREATEDB`), applied the init migration (requires `CREATE` on schema `public`), ran the seed with no errors. This is the exact failure path that produced Task 6 BLOCKED — now passing on a clean volume.

## Self-review

- Only `docker/init/01-roles.sql` was edited; the migration SQL in `packages/database/prisma/migrations/` is untouched as instructed.
- `docker compose down -v` ran cleanly with no pre-existing containers holding volumes; `docker compose up -d` recreated the `kidscare_postgres-data` volume and ran both init scripts in alphabetical order (`01-roles.sql` then `02-extensions.sql`).
- The grants apply only to `kidscare_migrator`; `kidscare_app` and `kidscare_auth_lookup` are explicitly excluded as required.
- Working-tree generated files (`packages/database/src/generated/client/*`) were left untouched by `git add` — only `docker/init/01-roles.sql` was staged and committed.
- Future `docker compose down -v && docker compose up -d` runs will be idempotent: the init script grants persist in the fresh volume, and `pnpm db:reset` continues to succeed.

## Commits

6b2a2b3e05115732b5c9fbe5084d807a21c63c74
