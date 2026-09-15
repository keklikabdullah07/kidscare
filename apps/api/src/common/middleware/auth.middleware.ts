import { Inject, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { runWithTenant, type TenantContextValue } from '@kidscare/tenant-context';
import type { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../modules/auth/services/jwt.service';

/**
 * Parses the `Authorization: Bearer <token>` header into a
 * TenantContextValue and wraps the rest of the request inside it.
 *
 * Precedence over the dev-header fallback (TenantContextMiddleware):
 * if a Bearer token is present, this middleware wins. The dev headers
 * remain a fallback so local e2e tests can keep working before sub-
 * project #2 ships — see TenantContextMiddleware.
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(@Inject(JwtService) private readonly jwt: JwtService) {}

  use(req: Request, _res: Response, next: NextFunction): void {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      next();
      return;
    }
    const token = auth.slice('Bearer '.length).trim();
    let value: TenantContextValue;
    try {
      const claims = this.jwt.verify(token);
      value = { tenantId: claims.tenantId, userId: claims.sub, role: claims.role };
    } catch {
      // Surface a 401 so clients with a stale/malformed token know
      // to re-login rather than silently falling back to dev headers.
      throw new UnauthorizedException('Invalid token');
    }
    runWithTenant(value, () => next());
  }
}
