import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { TenantResponse } from '../dto/tenant-response.dto';
import { tenantUpdateSchema } from '../dto/update-tenant.dto';
import { TenantsService } from '../services/tenants.service';
import { Tenant } from '../entities/tenant.entity';

@Controller('tenants')
@UseGuards(TenantGuard)
export class TenantsController {
  constructor(@Inject(TenantsService) private readonly tenantsService: TenantsService) {}

  @Get('me')
  async getMe(@CurrentTenantId() tenantId: string): Promise<TenantResponse> {
    const tenant = await this.tenantsService.findOne(tenantId);
    return this.toResponse(tenant);
  }

  @Patch('me')
  async updateMe(
    @CurrentTenantId() tenantId: string,
    @Body() body: unknown,
  ): Promise<TenantResponse> {
    const parsed = tenantUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid update payload',
        issues: parsed.error.issues,
      });
    }
    // Strip undefined entries — Prisma's TenantUpdateInput (with
    // exactOptionalPropertyTypes) rejects explicit `undefined` values.
    const data = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== undefined),
    ) as Parameters<TenantsService['update']>[1];
    const updated = await this.tenantsService.update(tenantId, data);
    return this.toResponse(updated);
  }

  private toResponse(t: Tenant): TenantResponse {
    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    };
  }
}
