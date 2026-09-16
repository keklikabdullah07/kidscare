import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
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
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { ActivitiesService } from '../services/activities.service';

@Controller('activities')
@UseGuards(TenantGuard)
export class ActivitiesController {
  constructor(@Inject(ActivitiesService) private readonly activitiesService: ActivitiesService) {}

  @Get()
  async list(
    @CurrentTenantId() tenantId: string,
    @Query(new ZodValidationPipe(activityFilterQuerySchema)) query: ActivityFilterQueryInput,
  ): Promise<ActivityPost[]> {
    return this.activitiesService.list(tenantId, query);
  }

  @Get(':id')
  async getById(
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ): Promise<ActivityPost> {
    return this.activitiesService.getById(tenantId, id);
  }

  @Post()
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(createActivityPostSchema)) body: CreateActivityPostInput,
  ): Promise<ActivityPost> {
    if (
      user.role !== 'ADMIN' &&
      user.role !== 'TEACHER' &&
      (user.role as string) !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException('Only teachers and admins can post activities');
    }
    return this.activitiesService.create(user.tenantId, user.userId, body);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: CurrentUserPayload,
    @CurrentTenantId() tenantId: string,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    if (
      user.role !== 'ADMIN' &&
      user.role !== 'TEACHER' &&
      (user.role as string) !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException('Only teachers and admins can delete activities');
    }
    return this.activitiesService.delete(tenantId, id);
  }
}
