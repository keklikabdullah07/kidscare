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
  incidentRecordCreateSchema,
  incidentRecordUpdateSchema,
  type IncidentRecordCreate,
  type IncidentRecordUpdate,
} from '@kidscare/shared-schemas';
import type { IncidentCategory, IncidentRecord } from '@kidscare/shared-types';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { IncidentsService } from '../services/incidents.service';

@Controller('incidents')
@UseGuards(TenantGuard)
@Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
export class IncidentsController {
  constructor(@Inject(IncidentsService) private readonly service: IncidentsService) {}

  @Get()
  async list(
    @CurrentTenantId() tenantId: string,
    @Query('studentId') studentId?: string,
    @Query('category') category?: IncidentCategory,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<IncidentRecord[]> {
    return this.service.list(tenantId, {
      studentId,
      category,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });
  }

  @Post()
  @HttpCode(201)
  async create(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(incidentRecordCreateSchema)) body: IncidentRecordCreate,
  ): Promise<IncidentRecord> {
    return this.service.create(tenantId, user.userId, body);
  }

  @Patch(':id')
  async update(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(incidentRecordUpdateSchema)) body: IncidentRecordUpdate,
  ): Promise<IncidentRecord> {
    return this.service.update(tenantId, id, user.userId, body);
  }
}
