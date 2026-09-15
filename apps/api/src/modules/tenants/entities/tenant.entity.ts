import type { Tenant as PrismaTenant, TenantStatus } from '@kidscare/database';

/**
 * Domain entity for a Tenant. Thin wrapper over the Prisma model with
 * a `fromPrisma` factory. Adding computed fields or invariants later
 * (e.g. `isSuspended()`, `canAcceptNewUsers()`) belongs here.
 */
export class Tenant {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly name: string,
    public readonly status: TenantStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromPrisma(p: PrismaTenant): Tenant {
    return new Tenant(p.id, p.slug, p.name, p.status, p.createdAt, p.updatedAt);
  }
}
