import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import {
  createEventConsentInputSchema,
  respondEventConsentInputSchema,
  type CreateEventConsentInput,
  type RespondEventConsentInput,
} from '@kidscare/shared-schemas';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { ConsentsService, type ConsentListItem } from '../services/consents.service';
import type {
  ConsentCreatedWithRelations,
  ConsentResponseWithStudent,
  ConsentWithRelations,
} from '../repositories/consents.repository';

@Controller('events/consents')
@UseGuards(TenantGuard)
export class ConsentsController {
  constructor(@Inject(ConsentsService) private readonly consentsService: ConsentsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @HttpCode(201)
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(createEventConsentInputSchema)) body: CreateEventConsentInput,
  ): Promise<ConsentCreatedWithRelations> {
    return this.consentsService.create(tenantId, user.userId, body);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async findAll(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Query('classroomId') classroomId?: string,
    @Query('status') status?: string,
  ): Promise<ConsentListItem[]> {
    const filters: { classroomId?: string; status?: string } = {};
    if (classroomId) filters.classroomId = classroomId;
    if (status) filters.status = status;
    return this.consentsService.findAll(
      tenantId,
      { userId: user.userId, role: user.role },
      filters,
    );
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async findOne(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<ConsentWithRelations> {
    return this.consentsService.findOne(tenantId, { userId: user.userId, role: user.role }, id);
  }

  @Post(':id/respond')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  @HttpCode(200)
  async respond(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(respondEventConsentInputSchema)) body: RespondEventConsentInput,
  ): Promise<ConsentResponseWithStudent> {
    return this.consentsService.respond(
      tenantId,
      { userId: user.userId, role: user.role },
      id,
      body,
    );
  }

  @Post(':id/cancel')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @HttpCode(200)
  async cancel(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body() body?: { reason?: string },
  ): Promise<ConsentWithRelations> {
    return this.consentsService.cancel(
      tenantId,
      { userId: user.userId, role: user.role },
      id,
      body?.reason,
    );
  }
}
