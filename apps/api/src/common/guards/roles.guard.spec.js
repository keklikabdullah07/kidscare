import { ForbiddenException } from '@nestjs/common';
import { runWithTenant } from "@kidscare/tenant-context";
import { RolesGuard } from './roles.guard';
describe('RolesGuard', () => {
    const context = {
        getHandler: () => undefined,
        getClass: () => undefined,
    };
    it('allows a role included in endpoint metadata', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(['ADMIN']),
        };
        const guard = new RolesGuard(reflector);
        runWithTenant({ tenantId: 't-1', userId: 'u-1', role: 'ADMIN' }, () => {
            expect(guard.canActivate(context)).toBe(true);
        });
    });
    it('rejects a role excluded from endpoint metadata', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(['ADMIN']),
        };
        const guard = new RolesGuard(reflector);
        runWithTenant({ tenantId: 't-1', userId: 'u-1', role: 'PARENT' }, () => {
            expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
        });
    });
    it('does not restrict authenticated endpoints without role metadata', () => {
        const reflector = {
            getAllAndOverride: jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(undefined),
        };
        const guard = new RolesGuard(reflector);
        expect(guard.canActivate(context)).toBe(true);
    });
});
