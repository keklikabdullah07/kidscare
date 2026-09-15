import { ForbiddenException, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, withTenantContext } from '@kidscare/database';
import { tenantContext } from '@kidscare/tenant-context';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config?: ConfigService) {
    super({
      datasources: {
        db: {
          url:
            config?.get<string>('DATABASE_APP_URL') ??
            process.env.DATABASE_APP_URL ??
            'postgresql://kidscare_app:app_pw@localhost:5433/kidscare?schema=public',
        },
      },
    });
  }

  /**
   * Run `fn` with a tenant-scoped Prisma client. The current
   * `TenantContextValue` (set by TenantContextMiddleware) is bound via
   * `withTenantContext` — every query inside `fn` runs inside a
   * transaction that sets `app.tenant_id` first, so RLS policies filter
   * to the current tenant.
   *
   * Throws ForbiddenException if no context is present. TenantGuard
   * should have rejected the request earlier; this is defence in depth
   * so a misconfigured guard cannot leak data.
   */
  async withTenant<T>(fn: (client: PrismaClient) => Promise<T>): Promise<T> {
    const ctx = tenantContext.getStore();
    if (!ctx) throw new ForbiddenException('Missing tenant context');
    // Cast: $extends returns a structurally-compatible client with all
    // PrismaClient model methods. The exact generic type is complex and
    // not worth hand-rolling for a one-line wrapper.
    const scoped = this.$extends(withTenantContext(ctx)) as unknown as PrismaClient;
    return fn(scoped);
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
