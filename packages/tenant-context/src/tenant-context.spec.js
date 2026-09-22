import { AsyncLocalStorage } from 'node:async_hooks';
import { tenantContext, runWithTenant } from './index';
describe('tenant-context', () => {
    it('exposes an AsyncLocalStorage instance', () => {
        expect(tenantContext).toBeInstanceOf(AsyncLocalStorage);
    });
    it('propagates the context value through runWithTenant', () => {
        const value = { tenantId: 't1', userId: 'u1', role: 'ADMIN' };
        let observed = null;
        runWithTenant(value, () => {
            observed = tenantContext.getStore();
        });
        expect(observed).toEqual(value);
    });
    it('returns undefined outside any runWithTenant call', () => {
        expect(tenantContext.getStore()).toBeUndefined();
    });
});
