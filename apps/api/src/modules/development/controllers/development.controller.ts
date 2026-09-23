import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { DevelopmentDomain } from '@kidscare/database';
import {
  createDevelopmentObservationSchema,
  createPortfolioItemSchema,
  createHomeActivitySuggestionSchema,
} from '../dto/development.dto';
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
    @Body() body: CreateDevelopmentObservationDto,
  ): Promise<DevelopmentObservationDto> {
    const parsed = createDevelopmentObservationSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid request payload',
        issues: parsed.error.issues,
      });
    }
    return this.service.createObservation(
      tenantId,
      user.userId,
      parsed.data as CreateDevelopmentObservationDto,
    );
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
    @Body() body: CreatePortfolioItemDto,
  ): Promise<PortfolioItemDto> {
    const parsed = createPortfolioItemSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid request payload',
        issues: parsed.error.issues,
      });
    }
    return this.service.createPortfolioItem(tenantId, parsed.data as CreatePortfolioItemDto);
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
    @Body() body: CreateHomeActivitySuggestionDto,
  ): Promise<HomeActivitySuggestionDto> {
    const parsed = createHomeActivitySuggestionSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid request payload',
        issues: parsed.error.issues,
      });
    }
    return this.service.createHomeActivity(
      tenantId,
      parsed.data as CreateHomeActivitySuggestionDto,
    );
  }
}
