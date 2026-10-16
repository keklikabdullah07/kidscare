import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { runWithTenant } from '@kidscare/tenant-context';
import type {
  AuthResponse,
  ForgotPasswordInput,
  ForgotPasswordResponse,
  JwtClaims,
  ResetPasswordInput,
  ResetPasswordResponse,
  UserRole,
  VerifyResetTokenResponse,
} from '@kidscare/shared-types';
import type { LoginInput, SignupInput } from '@kidscare/shared-schemas';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthLookupRepository } from '../repositories/auth-lookup.repository';
import { PasswordResetRepository } from '../repositories/password-reset.repository';
import { MailService } from '../../mail/mail.service';
import { JwtService } from './jwt.service';
import { PasswordService } from './password.service';

/**
 * Generates a cuid-shaped id without bringing in the `@paralleldrive/cuid2`
 * dependency just for two callsites. Format matches Prisma's `cuid()`:
 * 25 chars, lowercase + digits, timestamp prefix for sortability.
 */
function cuid(): string {
  const ts = Date.now().toString(36);
  const rand = randomBytes(12)
    .toString('base64')
    .replace(/[+/=]/g, '')
    .toLowerCase()
    .slice(0, 25 - ts.length);
  return `${ts}${rand}`;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(AuthLookupRepository) private readonly lookupRepo: AuthLookupRepository,
    @Inject(PasswordResetRepository) private readonly passwordResetRepo: PasswordResetRepository,
    @Inject(PasswordService) private readonly password: PasswordService,
    @Inject(JwtService) private readonly jwt: JwtService,
    @Inject(MailService) private readonly mailService: MailService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async signup(input: SignupInput): Promise<AuthResponse> {
    const existing = await this.lookupRepo.findTenantBySlug(input.tenantSlug);
    if (existing) throw new ConflictException('Tenant slug already taken');

    const tenantId = cuid();
    const userId = cuid();
    const passwordHash = await this.password.hash(input.password);

    // Run the two inserts under a synthetic tenant context. The
    // 'system' userId is a sentinel used only for the SET LOCAL session
    // variable inside the transaction; both INSERTs are RLS-constrained
    // by `tenantId = current_setting('app.tenant_id')`.
    await runWithTenant({ tenantId, userId: 'system', role: 'ADMIN' }, async () =>
      this.prisma.withTenant(async (client) => {
        await client.tenant.create({
          data: {
            id: tenantId,
            slug: input.tenantSlug,
            name: input.tenantName,
          },
        });
        await client.user.create({
          data: {
            id: userId,
            tenantId,
            email: input.email,
            passwordHash,
            role: 'ADMIN',
          },
        });
      }),
    );

    const claims: JwtClaims = {
      sub: userId,
      tenantId,
      role: 'ADMIN',
    };
    return {
      token: this.jwt.sign(claims),
      user: { id: userId, tenantId, email: input.email, role: 'ADMIN' },
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const tenant = await this.lookupRepo.findTenantBySlug(input.tenantSlug);
    if (!tenant) throw new UnauthorizedException('Invalid credentials');

    const lookupUser = await this.lookupRepo.findUserByEmail(tenant.id, input.email);
    if (!lookupUser) throw new UnauthorizedException('Invalid credentials');

    const valid = await this.password.verify(input.password, lookupUser.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // `kidscare_auth_lookup` cannot SELECT `role` / `isActive` (column-
    // level GRANT). Fetch the remaining fields under a synthetic app
    // context scoped to the resolved tenant — still RLS-constrained.
    const fullUser = await runWithTenant(
      { tenantId: tenant.id, userId: 'system', role: 'ADMIN' },
      async () =>
        this.prisma.withTenant((client) =>
          client.user.findUnique({
            where: { id: lookupUser.id },
            select: {
              id: true,
              tenantId: true,
              email: true,
              role: true,
              isActive: true,
            },
          }),
        ),
    );

    if (!fullUser || !fullUser.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const role: UserRole = fullUser.role;
    const claims: JwtClaims = {
      sub: fullUser.id,
      tenantId: fullUser.tenantId,
      role,
    };
    return {
      token: this.jwt.sign(claims),
      user: {
        id: fullUser.id,
        tenantId: fullUser.tenantId,
        email: fullUser.email,
        role,
      },
    };
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<ForgotPasswordResponse> {
    const genericSuccess: ForgotPasswordResponse = {
      success: true,
      message:
        'Eğer bilgileriniz kayıtlarımızla eşleşiyorsa şifre sıfırlama bağlantısı iletilmiştir.',
    };

    try {
      const tenant = await this.lookupRepo.findTenantBySlug(input.tenantSlug);
      if (!tenant) {
        return genericSuccess;
      }

      const user = await this.lookupRepo.findUserByEmail(tenant.id, input.email);
      if (!user) {
        return genericSuccess;
      }

      // Generate 256-bit cryptographic token
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = this.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await this.passwordResetRepo.createToken(tenant.id, user.id, tokenHash, expiresAt);

      const webBaseUrl = process.env.WEB_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${webBaseUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`;

      await this.mailService.sendPasswordResetMail({
        recipientEmail: input.email,
        resetUrl,
        expiresInMinutes: 15,
        tenantName: input.tenantSlug,
      });

      return genericSuccess;
    } catch (err) {
      this.logger.error(`Error in forgotPassword flow: ${String(err)}`);
      // Never reveal backend errors that could leak tenant or user existence
      return genericSuccess;
    }
  }

  async verifyResetToken(token: string): Promise<VerifyResetTokenResponse> {
    if (!token || token.length < 16) {
      return { valid: false, reason: 'NOT_FOUND' };
    }

    const tokenHash = this.hashToken(token);
    const record = await this.passwordResetRepo.findByTokenHash(tokenHash);

    if (!record) {
      return { valid: false, reason: 'NOT_FOUND' };
    }

    if (record.usedAt) {
      return { valid: false, reason: 'ALREADY_USED' };
    }

    if (new Date() > record.expiresAt) {
      return { valid: false, reason: 'EXPIRED' };
    }

    const response: VerifyResetTokenResponse = {
      valid: true,
    };
    if (record.user?.email) {
      response.email = record.user.email;
    }
    return response;
  }

  async resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResponse> {
    if (!input.token || input.token.length < 16) {
      throw new BadRequestException('Sıfırlama bağlantısı geçersiz veya süresi dolmuş.');
    }

    const tokenHash = this.hashToken(input.token);
    const record = await this.passwordResetRepo.findByTokenHash(tokenHash);

    if (!record || record.usedAt || new Date() > record.expiresAt) {
      throw new BadRequestException('Sıfırlama bağlantısı geçersiz veya süresi dolmuş.');
    }

    const passwordHash = await this.password.hash(input.newPassword);

    await this.passwordResetRepo.updateUserPassword(record.userId, passwordHash);
    await this.passwordResetRepo.markAsUsed(record.id);
    await this.passwordResetRepo.invalidateUserTokens(record.userId);

    this.logger.log(`Password reset successfully for user ${record.userId}`);

    return {
      success: true,
      message: 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
    };
  }
}
