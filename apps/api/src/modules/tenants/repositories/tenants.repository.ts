import { Inject, Injectable } from '@nestjs/common';
import type { Tenant as PrismaTenant, Prisma } from '@kidscare/database';
import { PrismaService } from '../../../prisma/prisma.service';

export interface ITenantsRepository {
  findById(tenantId: string): Promise<PrismaTenant | null>;
  update(tenantId: string, data: Prisma.TenantUpdateInput): Promise<PrismaTenant>;
}

@Injectable()
export class TenantsRepository implements ITenantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(tenantId: string): Promise<PrismaTenant | null> {
    return this.prisma.withTenant((client) =>
      client.tenant.findUnique({ where: { id: tenantId } }),
    );
  }

  async update(tenantId: string, data: Prisma.TenantUpdateInput): Promise<PrismaTenant> {
    return this.prisma.withTenant((client) =>
      client.tenant.update({ where: { id: tenantId }, data }),
    );
  }
}

// Re-export so other modules can depend on the interface token without
// importing the concrete file directly.
export const ITenantsRepositoryToken = 'ITenantsRepository';

// Suppress unused-import warning when only the interface is referenced.
void Inject;
