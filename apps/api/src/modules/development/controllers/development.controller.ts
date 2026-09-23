import { Body, Controller, Get, HttpCode, Inject, Post, Query, UseGuards } from '@nestjs/common';
import type { DevelopmentDomain } from '@kidscare/database';
import {
  createDevelopmentObservationSchema,
  createPortfolioItemSchema,
  createHomeActivitySuggestionSchema,
} from '@kidscare/shared-schemas';
import type {
  CreateDevelopmentObservationDto,
  CreateHomeActivitySuggestionDto,
  CreatePortfolioItemDto,
  DevelopmentObservationDto,
  HomeActivitySuggestionDto,
  PortfolioItemDto,
} from '@kidscare/shared-types';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { DevelopmentService } from '../services/development.service';

@Controller('development')
@UseGuards(TenantGuard)
export class DevelopmentController {
  constructor(@Inject(DevelopmentService) private readonly service: DevelopmentService) {}

  @Get('observations')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async listObservations(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Query('studentId') studentId?: string,
    @Query('domain') domain?: DevelopmentDomain,
  ): Promise<DevelopmentObservationDto[]> {
    const parentVisibleOnly = user.role === 'PARENT';
    const filters: { studentId?: string; domain?: DevelopmentDomain; parentVisibleOnly?: boolean } =
      {};
    if (studentId) filters.studentId = studentId;
    if (domain) filters.domain = domain;
    if (parentVisibleOnly) filters.parentVisibleOnly = true;

    return this.service.listObservations(tenantId, filters);
  }

  @Post('observations')
  @HttpCode(201)
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async createObservation(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(createDevelopmentObservationSchema))
    body: CreateDevelopmentObservationDto,
  ): Promise<DevelopmentObservationDto> {
    return this.service.createObservation(tenantId, user.userId, body);
  }

  @Get('portfolio')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async listPortfolio(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Query('studentId') studentId?: string,
  ): Promise<PortfolioItemDto[]> {
    const parentVisibleOnly = user.role === 'PARENT';
    const filters: { studentId?: string; parentVisibleOnly?: boolean } = {};
    if (studentId) filters.studentId = studentId;
    if (parentVisibleOnly) filters.parentVisibleOnly = true;

    return this.service.listPortfolioItems(tenantId, filters);
  }

  @Post('portfolio')
  @HttpCode(201)
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async createPortfolio(
    @CurrentTenantId() tenantId: string,
    @Body(new ZodValidationPipe(createPortfolioItemSchema))
    body: CreatePortfolioItemDto,
  ): Promise<PortfolioItemDto> {
    return this.service.createPortfolioItem(tenantId, body);
  }

  @Get('activities')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async listActivities(
    @CurrentTenantId() tenantId: string,
    @Query('domain') domain?: DevelopmentDomain,
  ): Promise<HomeActivitySuggestionDto[]> {
    return this.service.listHomeActivities(tenantId, domain);
  }

  @Post('activities')
  @HttpCode(201)
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async createActivity(
    @CurrentTenantId() tenantId: string,
    @Body(new ZodValidationPipe(createHomeActivitySuggestionSchema))
    body: CreateHomeActivitySuggestionDto,
  ): Promise<HomeActivitySuggestionDto> {
    return this.service.createHomeActivity(tenantId, body);
  }
}
