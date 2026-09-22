import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { tenantContext } from '@kidscare/tenant-context';
import type { UserRole } from '@kidscare/shared-types';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

/** Enforces endpoint role metadata after tenant authentication has completed. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const allowedRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!allowedRoles) return true;

    const role = tenantContext.getStore()?.role;
    if (!role || !allowedRoles.includes(role)) {
      throw new ForbiddenException('Insufficient role permissions');
    }
    return true;
  }
}
