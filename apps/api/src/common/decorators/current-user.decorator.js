import { createParamDecorator, ForbiddenException } from '@nestjs/common';
import { tenantContext } from "@kidscare/tenant-context";
export const CurrentUser = createParamDecorator((_, _ctx) => {
    const store = tenantContext.getStore();
    if (!store)
        throw new ForbiddenException('Missing user/tenant context');
    return {
        userId: store.userId,
        tenantId: store.tenantId,
        role: store.role,
    };
});
