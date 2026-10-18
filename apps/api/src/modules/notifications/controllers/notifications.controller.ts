import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import {
  registerPushTokenSchema,
  createBroadcastSchema,
  type RegisterPushTokenInput,
  type CreateBroadcastInput,
} from '@kidscare/shared-schemas';
import type { NotificationItem, BroadcastLog, BroadcastStatsDto } from '@kidscare/shared-types';
import { NotificationsService } from '../services/notifications.service';

@Controller('notifications')
@UseGuards(TenantGuard)
export class NotificationsController {
  constructor(
    @Inject(NotificationsService)
    private readonly service: NotificationsService,
  ) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  async registerToken(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(registerPushTokenSchema)) dto: RegisterPushTokenInput,
  ): Promise<{ success: boolean }> {
    return this.service.registerToken(user.tenantId, user.userId, dto);
  }

  @Delete('token')
  @HttpCode(HttpStatus.OK)
  async unregisterToken(
    @CurrentUser() user: CurrentUserPayload,
    @Body('token') token: string,
  ): Promise<{ success: boolean }> {
    return this.service.unregisterToken(user.userId, token);
  }

  @Post('broadcast')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @HttpCode(HttpStatus.CREATED)
  async createBroadcast(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(createBroadcastSchema)) dto: CreateBroadcastInput,
  ): Promise<{ success: boolean; log: BroadcastLog }> {
    return this.service.sendBroadcast(user.tenantId, user.userId, dto);
  }

  @Get('broadcast/history')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async getBroadcastHistory(
    @CurrentUser() user: CurrentUserPayload,
    @Query('limit') limitQuery?: string,
  ): Promise<BroadcastLog[]> {
    const limit = limitQuery ? parseInt(limitQuery, 10) : 50;
    return this.service.getBroadcastHistory(user.tenantId, limit);
  }

  @Get('broadcast/stats')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async getBroadcastStats(@CurrentUser() user: CurrentUserPayload): Promise<BroadcastStatsDto> {
    return this.service.getBroadcastStats(user.tenantId);
  }

  @Get()
  async getNotifications(
    @CurrentUser() user: CurrentUserPayload,
    @Query('limit') limitQuery?: string,
  ): Promise<NotificationItem[]> {
    const limit = limitQuery ? parseInt(limitQuery, 10) : 50;
    return this.service.getUserNotifications(user.tenantId, user.userId, limit);
  }

  @Patch(':id/read')
  async markAsRead(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.service.markAsRead(user.tenantId, user.userId, id);
  }
}
