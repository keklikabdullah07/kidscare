import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import type { ParentChildOverview } from '@kidscare/shared-types';
import { ParentService } from '../services/parent.service';

@Controller('parent')
@UseGuards(TenantGuard)
export class ParentController {
  constructor(@Inject(ParentService) private readonly service: ParentService) {}

  @Get('children')
  @Roles('PARENT')
  async getChildren(
    @CurrentUser() user: CurrentUserPayload,
    @Query('date') dateQuery?: string,
  ): Promise<ParentChildOverview[]> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dateStr = dateQuery || todayStr;
    return this.service.getChildrenOverview(user.tenantId, user.userId, user.role, dateStr);
  }
}
