import {
  Body,
  Controller,
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
  medicationRecordApproveSchema,
  medicationRecordCreateSchema,
  medicationRecordGivenSchema,
  medicationRecordRejectSchema,
  medicationRecordSkipSchema,
  type MedicationRecordApprove,
  type MedicationRecordCreate,
  type MedicationRecordGiven,
  type MedicationRecordReject,
  type MedicationRecordSkip,
} from '@kidscare/shared-schemas';
import type { MedicationRecord, MedicationStatus } from '@kidscare/shared-types';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { MedicationService } from '../services/medication.service';

@Controller('medication')
@UseGuards(TenantGuard)
export class MedicationController {
  constructor(@Inject(MedicationService) private readonly service: MedicationService) {}

  @Get('records')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async list(
    @CurrentTenantId() tenantId: string,
    @Query('studentId') studentId?: string,
    @Query('status') status?: MedicationStatus,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<MedicationRecord[]> {
    return this.service.list(tenantId, {
      studentId,
      status,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Post('records')
  @Roles('SUPER_ADMIN', 'ADMIN', 'PARENT')
  @HttpCode(201)
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(medicationRecordCreateSchema)) body: MedicationRecordCreate,
  ): Promise<MedicationRecord> {
    return this.service.create(tenantId, user.userId, body);
  }

  @Patch('records/:id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async approve(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(medicationRecordApproveSchema)) body: MedicationRecordApprove,
  ): Promise<MedicationRecord> {
    return this.service.approve(tenantId, id, user.userId, body);
  }

  @Patch('records/:id/reject')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async reject(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(medicationRecordRejectSchema)) body: MedicationRecordReject,
  ): Promise<MedicationRecord> {
    return this.service.reject(tenantId, id, user.userId, body);
  }

  @Patch('records/:id/given')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async markGiven(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(medicationRecordGivenSchema)) body: MedicationRecordGiven,
  ): Promise<MedicationRecord> {
    return this.service.markGiven(tenantId, id, user.userId, body);
  }

  @Patch('records/:id/skip')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async markSkipped(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(medicationRecordSkipSchema)) body: MedicationRecordSkip,
  ): Promise<MedicationRecord> {
    return this.service.markSkipped(tenantId, id, user.userId, body);
  }
}
