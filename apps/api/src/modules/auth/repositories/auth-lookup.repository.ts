import { Inject, Injectable, Logger, OnModuleDestroy, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AUTH_LOOKUP_TENANT_COLUMNS,
  AUTH_LOOKUP_USER_COLUMNS,
  createAuthLookupClient,
  type PrismaClient,
} from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Repository that queries the DB via the `kidscare_auth_lookup` role,
 * which has column-level SELECT on `users` and `tenants` only. Used
 * exclusively by the auth module's login + signup flows.
 * Falls back to PrismaService if the dedicated lookup role is unavailable.
 */
@Injectable()
export class AuthLookupRepository implements OnModuleDestroy {
  private readonly logger = new Logger(AuthLookupRepository.name);
  private readonly client?: PrismaClient;

  constructor(
    @Optional() @Inject(ConfigService) config?: ConfigService,
    @Optional() @Inject(PrismaService) private readonly prisma?: PrismaService,
  ) {
    const url =
      config?.get<string>('DATABASE_AUTH_LOOKUP_URL') ??
      process.env.DATABASE_AUTH_LOOKUP_URL ??
      config?.get<string>('DATABASE_URL') ??
      process.env.DATABASE_URL;

    if (url) {
      try {
        this.client = createAuthLookupClient(url);
      } catch (err) {
        this.logger.warn(
          `Failed to initialize auth-lookup client, will use primary prisma service: ${String(err)}`,
        );
      }
    }
  }

  async findTenantBySlug(slug: string): Promise<{ id: string; slug: string } | null> {
    if (this.client) {
      try {
        return await this.client.tenant.findFirst({
          where: { slug },
          select: AUTH_LOOKUP_TENANT_COLUMNS,
        });
      } catch (err) {
        this.logger.warn(
          `Auth lookup client failed for findTenantBySlug, trying primary prisma: ${String(err)}`,
        );
      }
    }

    if (this.prisma) {
      return this.prisma.tenant.findFirst({
        where: { slug },
        select: AUTH_LOOKUP_TENANT_COLUMNS,
      });
    }

    return null;
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
    if (this.client) {
      try {
        return await this.client.user.findFirst({
          where: { tenantId, email },
          select: AUTH_LOOKUP_USER_COLUMNS,
        });
      } catch (err) {
        this.logger.warn(
          `Auth lookup client failed for findUserByEmail, trying primary prisma: ${String(err)}`,
        );
      }
    }

    if (this.prisma) {
      return this.prisma.user.findFirst({
        where: { tenantId, email },
        select: AUTH_LOOKUP_USER_COLUMNS,
      });
    }

    return null;
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.$disconnect();
    }
  }
}
