import { BadRequestException } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import type { AuthLookupRepository } from '../repositories/auth-lookup.repository';
import type { PasswordResetRepository } from '../repositories/password-reset.repository';
import type { PasswordService } from '../services/password.service';
import type { JwtService } from '../services/jwt.service';
import type { MailService } from '../../mail/mail.service';
import type { PrismaService } from '../../../prisma/prisma.service';

describe('AuthService — Password Reset Flow', () => {
  let authService: AuthService;
  let mockLookupRepo: jest.Mocked<AuthLookupRepository>;
  let mockPasswordResetRepo: jest.Mocked<PasswordResetRepository>;
  let mockPasswordService: jest.Mocked<PasswordService>;
  let mockJwtService: jest.Mocked<JwtService>;
  let mockMailService: jest.Mocked<MailService>;
  let mockPrisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    mockLookupRepo = {
      findTenantBySlug: jest.fn(),
      findUserByEmail: jest.fn(),
    } as unknown as jest.Mocked<AuthLookupRepository>;

    mockPasswordResetRepo = {
      createToken: jest.fn(),
      findByTokenHash: jest.fn(),
      markAsUsed: jest.fn().mockResolvedValue(undefined),
      invalidateUserTokens: jest.fn().mockResolvedValue(undefined),
      updateUserPassword: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<PasswordResetRepository>;

    mockPasswordService = {
      hash: jest.fn().mockResolvedValue('hashed_new_pass'),
    } as unknown as jest.Mocked<PasswordService>;

    mockJwtService = {
      sign: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    mockMailService = {
      sendPasswordResetMail: jest.fn().mockResolvedValue({ success: true }),
    } as unknown as jest.Mocked<MailService>;

    mockPrisma = {} as unknown as jest.Mocked<PrismaService>;

    authService = new AuthService(
      mockLookupRepo,
      mockPasswordResetRepo,
      mockPasswordService,
      mockJwtService,
      mockMailService,
      mockPrisma,
    );
  });

  describe('forgotPassword', () => {
    it('returns generic success even if tenant does not exist (prevents enumeration)', async () => {
      mockLookupRepo.findTenantBySlug.mockResolvedValue(null);

      const res = await authService.forgotPassword({
        tenantSlug: 'non-existent',
        email: 'user@test.com',
      });

      expect(res.success).toBe(true);
      expect(mockPasswordResetRepo.createToken).not.toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetMail).not.toHaveBeenCalled();
    });

    it('returns generic success even if user does not exist in tenant', async () => {
      mockLookupRepo.findTenantBySlug.mockResolvedValue({ id: 'tenant-1', slug: 'demo' });
      mockLookupRepo.findUserByEmail.mockResolvedValue(null);

      const res = await authService.forgotPassword({
        tenantSlug: 'demo',
        email: 'nobody@test.com',
      });

      expect(res.success).toBe(true);
      expect(mockPasswordResetRepo.createToken).not.toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetMail).not.toHaveBeenCalled();
    });

    it('creates token and dispatches email when user and tenant match', async () => {
      mockLookupRepo.findTenantBySlug.mockResolvedValue({ id: 'tenant-1', slug: 'demo' });
      mockLookupRepo.findUserByEmail.mockResolvedValue({
        id: 'user-1',
        tenantId: 'tenant-1',
        email: 'admin@demo.test',
        passwordHash: 'old_hash',
      });

      const res = await authService.forgotPassword({
        tenantSlug: 'demo',
        email: 'admin@demo.test',
      });

      expect(res.success).toBe(true);
      expect(mockPasswordResetRepo.createToken).toHaveBeenCalled();
      expect(mockMailService.sendPasswordResetMail).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientEmail: 'admin@demo.test',
          tenantName: 'demo',
        }),
      );
    });
  });

  describe('verifyResetToken', () => {
    it('returns invalid if token is too short', async () => {
      const res = await authService.verifyResetToken('short');
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('NOT_FOUND');
    });

    it('returns NOT_FOUND if token does not exist in DB', async () => {
      mockPasswordResetRepo.findByTokenHash.mockResolvedValue(null);

      const res = await authService.verifyResetToken('0123456789abcdef0123456789abcdef');
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('NOT_FOUND');
    });

    it('returns ALREADY_USED if usedAt is present', async () => {
      mockPasswordResetRepo.findByTokenHash.mockResolvedValue({
        id: 'tok-1',
        tenantId: 't-1',
        userId: 'u-1',
        tokenHash: 'abc',
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: new Date(),
        createdAt: new Date(),
      });

      const res = await authService.verifyResetToken('0123456789abcdef0123456789abcdef');
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('ALREADY_USED');
    });

    it('returns EXPIRED if expiresAt is in the past', async () => {
      mockPasswordResetRepo.findByTokenHash.mockResolvedValue({
        id: 'tok-1',
        tenantId: 't-1',
        userId: 'u-1',
        tokenHash: 'abc',
        expiresAt: new Date(Date.now() - 60_000),
        usedAt: null,
        createdAt: new Date(),
      });

      const res = await authService.verifyResetToken('0123456789abcdef0123456789abcdef');
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('EXPIRED');
    });

    it('returns valid true when token is valid and unexpired', async () => {
      mockPasswordResetRepo.findByTokenHash.mockResolvedValue({
        id: 'tok-1',
        tenantId: 't-1',
        userId: 'u-1',
        tokenHash: 'abc',
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: null,
        createdAt: new Date(),
        user: { id: 'u-1', email: 'valid@test.com', isActive: true },
      });

      const res = await authService.verifyResetToken('0123456789abcdef0123456789abcdef');
      expect(res.valid).toBe(true);
      expect(res.email).toBe('valid@test.com');
    });
  });

  describe('resetPassword', () => {
    it('throws BadRequestException if token is missing or invalid', async () => {
      mockPasswordResetRepo.findByTokenHash.mockResolvedValue(null);

      await expect(
        authService.resetPassword({
          token: 'invalid-token-string-123456',
          newPassword: 'BrandNewSecurePassword123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('hashes new password, updates user and marks token as used', async () => {
      mockPasswordResetRepo.findByTokenHash.mockResolvedValue({
        id: 'tok-1',
        tenantId: 't-1',
        userId: 'u-1',
        tokenHash: 'abc',
        expiresAt: new Date(Date.now() + 60_000),
        usedAt: null,
        createdAt: new Date(),
      });

      const res = await authService.resetPassword({
        token: '0123456789abcdef0123456789abcdef',
        newPassword: 'BrandNewSecurePassword123!',
      });

      expect(res.success).toBe(true);
      expect(mockPasswordService.hash).toHaveBeenCalledWith('BrandNewSecurePassword123!');
      expect(mockPasswordResetRepo.updateUserPassword).toHaveBeenCalledWith(
        'u-1',
        'hashed_new_pass',
      );
      expect(mockPasswordResetRepo.markAsUsed).toHaveBeenCalledWith('tok-1');
      expect(mockPasswordResetRepo.invalidateUserTokens).toHaveBeenCalledWith('u-1');
    });
  });
});
