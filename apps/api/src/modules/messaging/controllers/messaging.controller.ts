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
  conversationCreateSchema,
  conversationStatusUpdateSchema,
  messageCreateSchema,
  parentRequestCreateSchema,
  parentRequestResolveSchema,
  type ConversationCreate,
  type ConversationStatusUpdate,
  type MessageCreate,
  type ParentRequestCreate,
  type ParentRequestResolve,
} from '@kidscare/shared-schemas';
import type {
  Conversation,
  ConversationStatus,
  Message,
  ParentRequest,
  ParentRequestStatus,
} from '@kidscare/shared-types';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { MessagingService } from '../services/messaging.service';

@Controller('messaging')
@UseGuards(TenantGuard)
export class MessagingController {
  constructor(@Inject(MessagingService) private readonly service: MessagingService) {}

  // ===== Conversations =====
  @Get('conversations')
  async listConversations(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') status?: ConversationStatus,
  ): Promise<Conversation[]> {
    return this.service.listConversations(tenantId, user.userId, status);
  }

  @Post('conversations')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT')
  @HttpCode(201)
  async createConversation(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(conversationCreateSchema)) body: ConversationCreate,
  ): Promise<Conversation> {
    return this.service.createConversation(tenantId, user.userId, body);
  }

  @Patch('conversations/:id/status')
  async updateStatus(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(conversationStatusUpdateSchema)) body: ConversationStatusUpdate,
  ): Promise<Conversation> {
    return this.service.updateStatus(tenantId, user.userId, id, body);
  }

  @Get('conversations/:id/messages')
  async listMessages(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') conversationId: string,
  ): Promise<Message[]> {
    return this.service.listMessages(tenantId, user.userId, conversationId);
  }

  @Post('conversations/:id/messages')
  @HttpCode(201)
  async createMessage(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') conversationId: string,
    @Body(new ZodValidationPipe(messageCreateSchema)) body: MessageCreate,
  ): Promise<Message> {
    return this.service.createMessage(tenantId, user.userId, conversationId, body);
  }

  @Post('conversations/:id/read')
  @HttpCode(204)
  async markRead(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') conversationId: string,
  ): Promise<void> {
    await this.service.markRead(tenantId, user.userId, conversationId);
  }

  // ===== Parent Requests =====
  @Get('parent-requests')
  async listParentRequests(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') status?: ParentRequestStatus,
  ): Promise<ParentRequest[]> {
    const filters: { parentId?: string; status?: ParentRequestStatus } = {};
    if (user.role === 'PARENT') filters.parentId = user.userId;
    if (status) filters.status = status;
    return this.service.listParentRequests(tenantId, filters);
  }

  @Post('parent-requests')
  @Roles('PARENT')
  @HttpCode(201)
  async createParentRequest(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(parentRequestCreateSchema)) body: ParentRequestCreate,
  ): Promise<ParentRequest> {
    return this.service.createParentRequest(tenantId, user.userId, body);
  }

  @Patch('parent-requests/:id/resolve')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async resolveParentRequest(
    @CurrentTenantId() tenantId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(parentRequestResolveSchema)) body: ParentRequestResolve,
  ): Promise<ParentRequest> {
    return this.service.resolveParentRequest(tenantId, user.userId, id, body);
  }
}
