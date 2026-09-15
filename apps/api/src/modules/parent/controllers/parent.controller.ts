import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import type { ParentChildOverview } from '@kidscare/shared-types';
import { ParentService } from '../services/parent.service';

@Controller('parent')
@UseGuards(TenantGuard)
export class ParentController {
  constructor(private readonly service: ParentService) {}

  @Get('children')
  async getChildren(
    @CurrentUser() user: CurrentUserPayload,
    @Query('date') dateQuery?: string,
  ): Promise<ParentChildOverview[]> {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dateStr = dateQuery || todayStr;
    return this.service.getChildrenOverview(user.tenantId, user.userId, user.role, dateStr);
  }
}
