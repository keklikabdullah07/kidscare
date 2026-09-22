import { tenantInputSchema } from './tenant.schema';
describe('tenantInputSchema', () => {
    it('accepts a valid slug and name', () => {
        expect(() => tenantInputSchema.parse({ slug: 'demo-kres', name: 'Demo Kreş' })).not.toThrow();
    });
    it('rejects a slug with uppercase letters', () => {
        expect(() => tenantInputSchema.parse({ slug: 'Demo-Kres', name: 'Demo Kreş' })).toThrow();
    });
    it('rejects a name shorter than 2 chars', () => {
        expect(() => tenantInputSchema.parse({ slug: 'demo', name: 'D' })).toThrow();
    });
});
