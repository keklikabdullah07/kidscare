import { Prisma } from '../generated/client';
import type { TenantContextValue } from '@kidscare/tenant-context';

type Ctx = NonNullable<TenantContextValue>;

/**
 * Prisma `$extends` middleware that wraps every query in a transaction that
 * sets `app.tenant_id` (a Postgres session variable consumed by the RLS
 * policies installed in the initial migration).
 *
 * The `SET LOCAL` MUST run inside a transaction — Postgres only honours
 * `SET LOCAL` for the lifetime of the current transaction. If we issued it
 * outside, it would be invisible to the query that follows.
 *
 * We use `Prisma.defineExtension`'s callback form to capture the parent
 * PrismaClient in a closure. Inside `$allOperations` we open a transaction
 * on the parent client and invoke the operation through the transaction
 * client (`tx[model][operation](args)`) instead of via the extension's
 * `query(args)` callback — the latter is bound to the outer extended
 * client and would run on a different connection than the one we just
 * configured.
 *
 * SECURITY: This is the ONLY way the application runtime should touch the
 * database for tenant-scoped reads/writes. Raw `prisma.X.findMany()` on
 * tenant-scoped tables is forbidden outside login/migration contexts.
 *
 * Usage:
 *   const prisma = new PrismaClient(...).$extends(
 *     withTenantContext({ tenantId, userId, role })
 *   );
 */
export function withTenantContext(ctx: Ctx) {
  // Prisma's `$allOperations` / `defineExtension` callback types are
  // intentionally `any` in Prisma's own type definitions; the runtime shape
  // of `args`, `model`, `operation` is unknown to TypeScript. The transaction
  // client (`tx`) returned from `parent.$transaction(...)` is also typed
  // `any` because Prisma doesn't expose it generically. Lifting the `any`
  // would require hand-rolling a recursive conditional type over every
  // model — out of scope for the infrastructure layer.
  /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
  return Prisma.defineExtension((parent: any) =>
    parent.$extends({
      name: 'tenantContext',
      query: {
        $allOperations: async ({ model, operation, args }: any) => {
          return parent.$transaction(async (tx: any) => {
            await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${ctx.tenantId}'`);
            return tx[model][operation](args);
          });
        },
      },
    }),
  );
  /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/require-await */
}

// Keep the import alive for any callers that may import the symbol directly.
export { Prisma };
