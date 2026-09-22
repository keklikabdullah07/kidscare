import { Body, Controller, Get, HttpCode, Inject, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import { userInviteSchema, userRoleSchema, type UserInvite } from '@kidscare/shared-schemas';
import type { UserRole } from '@kidscare/shared-types';
import type { UserResponseDto } from '../dto/user-response.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
@UseGuards(TenantGuard)
@Roles('SUPER_ADMIN', 'ADMIN')
export class UsersController {
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get()
  async list(
    @CurrentTenantId() tenantId: string,
    @Query('role') roleQuery?: string,
  ): Promise<UserResponseDto[]> {
    const role = roleQuery ? userRoleSchema.parse(roleQuery) : undefined;
    return this.usersService.list(tenantId, role as UserRole | undefined);
  }

  @Post()
  @HttpCode(201)
  async invite(
    @CurrentTenantId() tenantId: string,
    @Body(new ZodValidationPipe(userInviteSchema)) body: UserInvite,
  ): Promise<UserResponseDto> {
    return this.usersService.invite(tenantId, body);
  }
}
