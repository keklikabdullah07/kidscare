import { createParamDecorator, ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { tenantContext } from '@kidscare/tenant-context';

/**
 * Extracts `tenantId` from the current AsyncLocalStorage tenant context
 * and passes it as a controller method argument. Pairs with TenantGuard,
 * which verifies the context is present before the handler runs.
 */
export const CurrentTenantId = createParamDecorator(
  (_: unknown, _ctx: ExecutionContext): string => {
    const store = tenantContext.getStore();
    if (!store) throw new ForbiddenException('Missing tenant context');
    return store.tenantId;
  },
);
