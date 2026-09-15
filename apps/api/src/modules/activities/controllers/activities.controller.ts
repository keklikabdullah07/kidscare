import {
  BadRequestException,
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
import { createActivityPostSchema, activityFilterQuerySchema } from '@kidscare/shared-schemas';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { ActivitiesService } from '../services/activities.service';

@Controller('activities')
@UseGuards(TenantGuard)
export class ActivitiesController {
  constructor(@Inject(ActivitiesService) private readonly activitiesService: ActivitiesService) {}

  @Get()
  async list(
    @CurrentTenantId() tenantId: string,
    @Query() query: Record<string, unknown>,
  ): Promise<ActivityPost[]> {
    const parsed = activityFilterQuerySchema.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid query parameters',
        issues: parsed.error.issues,
      });
    }
    return this.activitiesService.list(tenantId, parsed.data);
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
    @Body() body: unknown,
  ): Promise<ActivityPost> {
    if (
      user.role !== 'ADMIN' &&
      user.role !== 'TEACHER' &&
      (user.role as string) !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException('Only teachers and admins can post activities');
    }
    const parsed = createActivityPostSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid activity payload',
        issues: parsed.error.issues,
      });
    }
    return this.activitiesService.create(user.tenantId, user.userId, parsed.data);
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
