import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AUTH_LOOKUP_TENANT_COLUMNS,
  AUTH_LOOKUP_USER_COLUMNS,
  createAuthLookupClient,
  type PrismaClient,
} from '@kidscare/database';

/**
 * Repository that queries the DB via the `kidscare_auth_lookup` role,
 * which has column-level SELECT on `users` and `tenants` only. Used
 * exclusively by the auth module's login + signup flows. No other module
 * may import this file or instantiate this client — see
 * `apps/api/src/common/guards/...` and the CLAUDE.md guard rails.
 */
@Injectable()
export class AuthLookupRepository implements OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor(config?: ConfigService) {
    const url =
      config?.get<string>('DATABASE_AUTH_LOOKUP_URL') ??
      process.env.DATABASE_AUTH_LOOKUP_URL ??
      'postgresql://kidscare_auth_lookup:auth_pw@localhost:5433/kidscare?schema=public';
    this.client = createAuthLookupClient(url);
  }

  async findTenantBySlug(slug: string): Promise<{ id: string; slug: string } | null> {
    return this.client.tenant.findFirst({
      where: { slug },
      select: AUTH_LOOKUP_TENANT_COLUMNS,
    });
  }

  async findUserByEmail(
    tenantId: string,
    email: string,
  ): Promise<{
    id: string;
    tenantId: string;
    email: string;
    passwordHash: string;
  } | null> {
    return this.client.user.findFirst({
      where: { tenantId, email },
      select: AUTH_LOOKUP_USER_COLUMNS,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
