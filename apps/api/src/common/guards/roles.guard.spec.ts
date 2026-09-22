import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { runWithTenant } from '@kidscare/tenant-context';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;

  it('allows a role included in endpoint metadata', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(['ADMIN']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    runWithTenant({ tenantId: 't-1', userId: 'u-1', role: 'ADMIN' }, () => {
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  it('rejects a role excluded from endpoint metadata', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(['ADMIN']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    runWithTenant({ tenantId: 't-1', userId: 'u-1', role: 'PARENT' }, () => {
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  it('does not restrict authenticated endpoints without role metadata', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(context)).toBe(true);
  });
});
