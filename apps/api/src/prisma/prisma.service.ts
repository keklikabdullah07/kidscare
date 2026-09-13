import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@kidscare/database';
import { tenantContext } from '@kidscare/tenant-context';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: { url: config.getOrThrow<string>('DATABASE_APP_URL') },
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  /**
   * Returns a Prisma client extended with the current tenant context.
   * Use this from services; never call `this.user.findMany()` directly.
   *
   * Note: prefer importing `withTenantContext` from `@kidscare/database`
   * and `$extends`-ing locally in the service that needs it — this method
   * is provided for legacy / convenience callers only.
   */
  forTenant(): PrismaClient {
    const ctx = tenantContext.getStore();
    if (!ctx) {
      throw new Error('No tenant context — call from inside a tenant-scoped request');
    }
    const tenantId = ctx.tenantId;
    // `any` is unavoidable: Prisma's $transaction callback return type is
    // unknown to TypeScript. See packages/database/src/middleware/tenant.middleware.ts
    // for the same rationale.
    /* eslint-disable @typescript-eslint/no-unsafe-return */
    return this.$extends({
      query: {
        $allOperations: async ({ args, query }) => {
          return this.$transaction(async (tx) => {
            await tx.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
            return query(args);
          });
        },
      },
    }) as unknown as PrismaClient;
    /* eslint-enable @typescript-eslint/no-unsafe-return */
  }
}
