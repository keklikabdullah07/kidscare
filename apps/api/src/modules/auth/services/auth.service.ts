import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { runWithTenant } from '@kidscare/tenant-context';
import type { AuthResponse, JwtClaims, UserRole } from '@kidscare/shared-types';
import type { LoginInput, SignupInput } from '@kidscare/shared-schemas';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthLookupRepository } from '../repositories/auth-lookup.repository';
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
  constructor(
    @Inject(AuthLookupRepository) private readonly lookupRepo: AuthLookupRepository,
    @Inject(PasswordService) private readonly password: PasswordService,
    @Inject(JwtService) private readonly jwt: JwtService,
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
}
