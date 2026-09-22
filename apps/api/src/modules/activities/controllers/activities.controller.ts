import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { ActivityPost } from '@kidscare/shared-types';
import {
  createActivityPostSchema,
  activityFilterQuerySchema,
  type ActivityFilterQueryInput,
  type CreateActivityPostInput,
} from '@kidscare/shared-schemas';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { ActivitiesService } from '../services/activities.service';

@Controller('activities')
@UseGuards(TenantGuard)
export class ActivitiesController {
  constructor(@Inject(ActivitiesService) private readonly activitiesService: ActivitiesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async list(
    @CurrentTenantId() tenantId: string,
    @Query(new ZodValidationPipe(activityFilterQuerySchema)) query: ActivityFilterQueryInput,
  ): Promise<ActivityPost[]> {
    return this.activitiesService.list(tenantId, query);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  async getById(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ): Promise<ActivityPost> {
    return this.activitiesService.getById(tenantId, id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(createActivityPostSchema)) body: CreateActivityPostInput,
  ): Promise<ActivityPost> {
    return this.activitiesService.create(user.tenantId, user.userId, body);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async delete(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.activitiesService.delete(tenantId, id);
  }
}
