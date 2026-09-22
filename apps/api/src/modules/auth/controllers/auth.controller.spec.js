import { tenantContext } from "@kidscare/tenant-context";
import { AuthController } from './auth.controller';
describe('AuthController', () => {
    let controller;
    let service;
    beforeEach(() => {
        service = {
            signup: jest.fn(),
            login: jest.fn(),
        };
        controller = new AuthController(service);
    });
    describe('signup', () => {
        it('returns the auth response on valid payload', async () => {
            const resp = {
                token: 'jwt',
                user: { id: 'u-1', tenantId: 't-1', email: 'a@b.com', role: 'ADMIN' },
            };
            service.signup.mockResolvedValue(resp);
            await expect(controller.signup({
                tenantSlug: 'yeni',
                tenantName: 'Yeni',
                email: 'a@b.com',
                password: 'longpass1',
            })).resolves.toEqual(resp);
        });
        // Validation is now enforced at the HTTP boundary by
        // ZodValidationPipe, so we don't re-test invalid shapes here.
        // The pipe has its own integration coverage via e2e tests.
    });
    describe('login', () => {
        it('returns the auth response on valid payload', async () => {
            const resp = {
                token: 'jwt',
                user: { id: 'u-1', tenantId: 't-1', email: 'a@b.com', role: 'ADMIN' },
            };
            service.login.mockResolvedValue(resp);
            await expect(controller.login({
                tenantSlug: 'demo',
                email: 'a@b.com',
                password: 'longpass1',
            })).resolves.toEqual(resp);
        });
    });
    describe('me', () => {
        it('returns the current context summary', () => {
            const ctx = { tenantId: 't-1', userId: 'u-1', role: 'ADMIN' };
            tenantContext.run(ctx, () => {
                const result = controller.me(ctx.tenantId);
                expect(result).toEqual({ tenantId: 't-1', userId: 'u-1', role: 'ADMIN' });
            });
        });
    });
});
