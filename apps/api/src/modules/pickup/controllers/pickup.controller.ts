import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  pickupAuthorizationCreateSchema,
  pickupAuthorizationReviewSchema,
  pickupContactCreateSchema,
  pickupContactUpdateSchema,
  pickupEventCreateSchema,
  type PickupAuthorizationCreate,
  type PickupAuthorizationReview,
  type PickupContactCreate,
  type PickupContactUpdate,
  type PickupEventCreate,
} from '@kidscare/shared-schemas';
import type {
  PickupAuthorization,
  PickupAuthorizationStatus,
  PickupContact,
  PickupEvent,
} from '@kidscare/shared-types';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { PickupService } from '../services/pickup.service';

@Controller('pickup')
@UseGuards(TenantGuard)
export class PickupController {
  constructor(@Inject(PickupService) private readonly service: PickupService) {}

  // ===== Contacts =====
  @Get('contacts')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async listContacts(
    @CurrentTenantId() tenantId: string,
    @Query('studentId') studentId: string,
  ): Promise<PickupContact[]> {
    return this.service.listContacts(tenantId, studentId);
  }

  @Post('contacts')
  @Roles('SUPER_ADMIN', 'ADMIN', 'PARENT')
  @HttpCode(201)
  async createContact(
    @CurrentTenantId() tenantId: string,
    @Body(new ZodValidationPipe(pickupContactCreateSchema)) body: PickupContactCreate,
  ): Promise<PickupContact> {
    return this.service.createContact(tenantId, body);
  }

  @Patch('contacts/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'PARENT')
  async updateContact(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(pickupContactUpdateSchema)) body: PickupContactUpdate,
  ): Promise<PickupContact> {
    return this.service.updateContact(tenantId, id, body);
  }

  @Delete('contacts/:id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'PARENT')
  @HttpCode(204)
  async deleteContact(@CurrentTenantId() tenantId: string, @Param('id') id: string): Promise<void> {
    await this.service.deleteContact(tenantId, id);
  }

  // ===== Authorizations =====
  @Get('authorizations')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async listAuthorizations(
    @CurrentTenantId() tenantId: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: PickupAuthorizationStatus,
  ): Promise<PickupAuthorization[]> {
    const filters: { studentId?: string; status?: PickupAuthorizationStatus } = {};
    if (studentId) filters.studentId = studentId;
    if (status) filters.status = status;
    return this.service.listAuthorizations(tenantId, filters);
  }

  @Post('authorizations')
  @Roles('SUPER_ADMIN', 'ADMIN', 'PARENT')
  @HttpCode(201)
  async createAuthorization(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(pickupAuthorizationCreateSchema)) body: PickupAuthorizationCreate,
  ): Promise<PickupAuthorization> {
    return this.service.createAuthorization(tenantId, user.userId, body);
  }

  @Patch('authorizations/:id/review')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async reviewAuthorization(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(pickupAuthorizationReviewSchema)) body: PickupAuthorizationReview,
  ): Promise<PickupAuthorization> {
    return this.service.reviewAuthorization(tenantId, id, user.userId, body);
  }

  // ===== Events =====
  @Get('events')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async listEvents(
    @CurrentTenantId() tenantId: string,
    @Query('studentId') studentId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<PickupEvent[]> {
    const filters: { studentId?: string; from?: Date; to?: Date } = {};
    if (studentId) filters.studentId = studentId;
    if (from) filters.from = new Date(from);
    if (to) filters.to = new Date(to);
    return this.service.listEvents(tenantId, filters);
  }

  @Post('events')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @HttpCode(201)
  async createEvent(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(pickupEventCreateSchema)) body: PickupEventCreate,
  ): Promise<PickupEvent> {
    return this.service.createEvent(tenantId, user.userId, body);
  }
}
