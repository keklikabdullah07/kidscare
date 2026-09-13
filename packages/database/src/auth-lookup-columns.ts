/**
 * Allow-list of columns the `kidscare_auth_lookup` role may SELECT on the
 * `users` table. Per the initial migration's GRANT, only these four
 * columns are accessible. Anything else in a `findFirst` / `findMany`
 * causes PG to reject the query with `42501 permission denied for
 * table users` because Prisma's full-row SELECT fetches all columns.
 *
 * Import from `@kidscare/database` and pass to `select` so the test, the
 * login handler, and any future auth-lookup client share the same list.
 * When sub-project #2 (auth) adds more readable columns, update both
 * the migration GRANT and this constant in the same change.
 */
export const AUTH_LOOKUP_USER_COLUMNS = {
  id: true,
  tenantId: true,
  email: true,
  passwordHash: true,
} as const;

export const AUTH_LOOKUP_TENANT_COLUMNS = {
  id: true,
  slug: true,
} as const;
