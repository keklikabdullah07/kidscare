import { Injectable, NestMiddleware } from '@nestjs/common';
import { runWithTenant, type TenantContextValue } from '@kidscare/tenant-context';
import type { Request, Response, NextFunction } from 'express';

/**
 * Parses the request headers into a TenantContextValue and runs the rest of
 * the request inside that context.
 *
 * Sub-project #1 placeholder: in dev (NODE_ENV !== 'production') we accept
 * `x-tenant-id` and `x-user-id` and `x-role` headers directly. Sub-project #2
 * replaces this with a JWT parser.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const value: TenantContextValue =
      process.env.NODE_ENV === 'production'
        ? null
        : {
            tenantId: (req.headers['x-tenant-id'] as string | undefined) ?? '',
            userId: (req.headers['x-user-id'] as string | undefined) ?? '',
            role: ((req.headers['x-role'] as string | undefined) ?? 'TEACHER') as
              'ADMIN' | 'TEACHER' | 'PARENT',
          };

    if (!value || !value.tenantId || !value.userId) {
      next();
      return;
    }
    runWithTenant(value, () => next());
  }
}
