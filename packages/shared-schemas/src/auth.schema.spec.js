import { loginSchema, signupSchema } from './auth.schema';
describe('loginSchema', () => {
    it('accepts a valid login payload', () => {
        expect(() => loginSchema.parse({
            tenantSlug: 'demo-kres',
            email: 'admin@demo.com',
            password: 'x',
        })).not.toThrow();
    });
    it('rejects an invalid email', () => {
        expect(() => loginSchema.parse({
            tenantSlug: 'demo-kres',
            email: 'not-an-email',
            password: 'x',
        })).toThrow();
    });
    it('rejects a slug with uppercase letters', () => {
        expect(() => loginSchema.parse({
            tenantSlug: 'Demo-Kres',
            email: 'admin@demo.com',
            password: 'x',
        })).toThrow();
    });
});
describe('signupSchema', () => {
    it('accepts a valid signup payload', () => {
        expect(() => signupSchema.parse({
            tenantSlug: 'yeni-kres',
            tenantName: 'Yeni Kreş',
            email: 'admin@yeni.com',
            password: 'strongpass1',
        })).not.toThrow();
    });
    it('rejects a password shorter than 8 chars', () => {
        expect(() => signupSchema.parse({
            tenantSlug: 'yeni-kres',
            tenantName: 'Yeni Kreş',
            email: 'admin@yeni.com',
            password: 'short',
        })).toThrow();
    });
    it('rejects a tenant name shorter than 2 chars', () => {
        expect(() => signupSchema.parse({
            tenantSlug: 'yeni-kres',
            tenantName: 'Y',
            email: 'admin@yeni.com',
            password: 'strongpass1',
        })).toThrow();
    });
});
