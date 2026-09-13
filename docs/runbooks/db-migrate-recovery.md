# DB Migration Recovery

If `pnpm db:migrate` fails because a migration is marked as `failed` in
`_prisma_migrations` (typically because the migration partially applied
and was then interrupted, or because the role running it lacked the
privilege to complete the SQL), recover as follows.

## 1. Confirm the migration actually applied

Connect to the database and check whether the migration's effects are
present. For a migration that adds a table:

```bash
docker exec kidscare-postgres psql -U postgres -d kidscare \
  -c '\dt public.*'
```

For a migration that adds a policy / grant:

```bash
docker exec kidscare-postgres psql -U postgres -d kidscare \
  -c '\dp public.users'
```

If the migration's effects are there, mark it as applied so Prisma stops
re-trying it:

```bash
cd packages/database
pnpm exec prisma migrate resolve --applied <migration_name>
# example:
# pnpm exec prisma migrate resolve --applied 20260913154500_auth_lookup_bypassrls
```

If the migration's effects are NOT there, mark it as rolled-back so
Prisma re-runs it from scratch:

```bash
pnpm exec prisma migrate resolve --rolled-back <migration_name>
```

Then fix whatever blocked the original run (usually a missing privilege
on the migrator role — see "Privilege issues" below) and re-run:

```bash
pnpm db:migrate
```

## 2. Privilege issues

The `kidscare_migrator` role is intentionally narrow. If a migration
needs to `ALTER ROLE`, `GRANT`, or otherwise touch another role, the
migrator needs the `ADMIN OPTION` on that role. Add the grant to
`docker/init/01-roles.sql` so fresh databases get it automatically:

```sql
GRANT <target_role> TO kidscare_migrator WITH ADMIN OPTION;
```

Then on the running DB:

```bash
docker exec kidscare-postgres psql -U postgres -d kidscare \
  -c "GRANT <target_role> TO kidscare_migrator WITH ADMIN OPTION;"
```

If a migration needs to create / drop / alter the database itself
(e.g. `prisma migrate reset`), the migrator also needs `CREATEDB`.
That grant is already in `docker/init/01-roles.sql`.

## 3. Re-seeding after `db:reset`

`pnpm db:reset` wipes the database, re-applies migrations, then runs the
seed script. If the seed fails after a reset:

```bash
pnpm db:seed
```

The seed is idempotent (uses `upsert` keyed on the demo tenant id
`demo-tenant-seed-001`), so it can be re-run any number of times.

## 4. Fresh-DB test for the init script

After editing `docker/init/01-roles.sql` (or any init script in
`docker/init/`), verify the changes work on a clean database:

```bash
docker compose down -v   # destroys volumes (irreversible — all data gone)
docker compose up -d     # re-runs all init scripts from scratch
pnpm db:migrate          # applies all pending migrations
pnpm db:seed             # verifies seed runs against fresh DB
```

This is the same procedure CI should run on every change to the init
scripts.
