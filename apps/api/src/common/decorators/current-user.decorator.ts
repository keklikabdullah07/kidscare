import { createParamDecorator, ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { tenantContext } from '@kidscare/tenant-context';
import type { UserRole } from '@kidscare/shared-types';

export interface CurrentUserPayload {
  userId: string;
  tenantId: string;
  role: UserRole;
}

export const CurrentUser = createParamDecorator(
  (_: unknown, _ctx: ExecutionContext): CurrentUserPayload => {
    const store = tenantContext.getStore();
    if (!store) throw new ForbiddenException('Missing user/tenant context');
    return {
      userId: store.userId,
      tenantId: store.tenantId,
      role: store.role,
    };
  },
);
