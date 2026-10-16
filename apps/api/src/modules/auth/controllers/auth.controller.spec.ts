import { tenantContext } from '@kidscare/tenant-context';
import { AuthController } from './auth.controller';
import type { AuthService } from '../services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  beforeEach(() => {
    service = {
      signup: jest.fn(),
      login: jest.fn(),
      forgotPassword: jest.fn(),
      verifyResetToken: jest.fn(),
      resetPassword: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;
    controller = new AuthController(service);
  });

  describe('signup', () => {
    it('returns the auth response on valid payload', async () => {
      const resp = {
        token: 'jwt',
        user: { id: 'u-1', tenantId: 't-1', email: 'a@b.com', role: 'ADMIN' as const },
      };
      service.signup.mockResolvedValue(resp);
      await expect(
        controller.signup({
          tenantSlug: 'yeni',
          tenantName: 'Yeni',
          email: 'a@b.com',
          password: 'longpass1',
        }),
      ).resolves.toEqual(resp);
    });

    // Validation is now enforced at the HTTP boundary by
    // ZodValidationPipe, so we don't re-test invalid shapes here.
    // The pipe has its own integration coverage via e2e tests.
  });

  describe('login', () => {
    it('returns the auth response on valid payload', async () => {
      const resp = {
        token: 'jwt',
        user: { id: 'u-1', tenantId: 't-1', email: 'a@b.com', role: 'ADMIN' as const },
      };
      service.login.mockResolvedValue(resp);
      await expect(
        controller.login({
          tenantSlug: 'demo',
          email: 'a@b.com',
          password: 'longpass1',
        }),
      ).resolves.toEqual(resp);
    });
  });

  describe('forgotPassword', () => {
    it('calls service.forgotPassword and returns response', async () => {
      const resp = { success: true, message: 'Mail sent' };
      service.forgotPassword.mockResolvedValue(resp);

      await expect(
        controller.forgotPassword({
          tenantSlug: 'demo',
          email: 'user@test.com',
        }),
      ).resolves.toEqual(resp);
    });
  });

  describe('verifyResetToken', () => {
    it('calls service.verifyResetToken with query token', async () => {
      const resp = { valid: true, email: 'user@test.com' };
      service.verifyResetToken.mockResolvedValue(resp);

      await expect(controller.verifyResetToken('valid-token-123456')).resolves.toEqual(resp);
      expect(service.verifyResetToken).toHaveBeenCalledWith('valid-token-123456');
    });
  });

  describe('resetPassword', () => {
    it('calls service.resetPassword and returns response', async () => {
      const resp = { success: true, message: 'Password updated' };
      service.resetPassword.mockResolvedValue(resp);

      await expect(
        controller.resetPassword({
          token: 'valid-token-123456',
          newPassword: 'MyNewPassword123!',
        }),
      ).resolves.toEqual(resp);
    });
  });

  describe('me', () => {
    it('returns the current context summary', () => {
      const ctx = { tenantId: 't-1', userId: 'u-1', role: 'ADMIN' as const };
      tenantContext.run(ctx, () => {
        const result = controller.me(ctx.tenantId);
        expect(result).toEqual({ tenantId: 't-1', userId: 'u-1', role: 'ADMIN' });
      });
    });
  });
});
