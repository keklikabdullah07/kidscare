import { PrismaClient } from '../generated/client';
/**
 * Creates a Prisma client bound to the auth-lookup connection.
 *
 * SECURITY: This client connects as the `kidscare_auth_lookup` role, which has
 * column-level SELECT grants on `users` and `tenants` only. It is intended for
 * the auth module's login handler. Importing or instantiating this factory
 * outside `apps/api/src/modules/auth/login.handler.ts` is a security violation.
 */
export function createAuthLookupClient(url) {
    return new PrismaClient({ datasources: { db: { url } } });
}
