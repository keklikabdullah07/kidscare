import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Tenant } from '../entities/tenant.entity';
import type { Prisma } from '@kidscare/database';
import type { ITenantsRepository } from '../repositories/tenants.repository';
import { PrismaService } from '../../../prisma/prisma.service';
import type { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { getScopedStudentIdsForUser } from '../../../common/utils/student-access';

@Injectable()
export class TenantsService {
  constructor(
    @Inject('ITenantsRepository') private readonly repo: ITenantsRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async findOne(tenantId: string): Promise<Tenant> {
    const found = await this.repo.findById(tenantId);
    if (!found) throw new NotFoundException(`Tenant ${tenantId} not found`);
    return Tenant.fromPrisma(found);
  }

  async update(tenantId: string, data: Prisma.TenantUpdateInput): Promise<Tenant> {
    // Two-step: verify exists so we can map Prisma's P2025 to a
    // NotFoundException with the same shape as findOne.
    const existing = await this.repo.findById(tenantId);
    if (!existing) throw new NotFoundException(`Tenant ${tenantId} not found`);
    const updated = await this.repo.update(tenantId, data);
    return Tenant.fromPrisma(updated);
  }

  async getOperationalAlerts(tenantId: string, user?: CurrentUserPayload) {
    const studentIds = user
      ? await getScopedStudentIdsForUser(this.prisma, tenantId, user)
      : null;
    return this.repo.getOperationalAlerts(tenantId, studentIds ?? undefined);
  }
}
