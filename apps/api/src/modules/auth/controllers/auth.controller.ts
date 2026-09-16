import { Body, Controller, Get, HttpCode, Inject, Post } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import type { LoginInput, SignupInput } from '@kidscare/shared-schemas';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import { tenantContext } from '@kidscare/tenant-context';
import { Public } from '../../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import type { AuthResponse } from '@kidscare/shared-types';
import { loginSchema } from '../dto/login.dto';
import { signupSchema } from '../dto/signup.dto';
import { AuthService } from '../services/auth.service';

// Auth endpoints are an obvious brute-force target. Tighten limits:
// 10 attempts per minute, 60 per 10 minutes — generous for real users,
// punishing for bots. Uses named throttler buckets so the global limits
// still apply for other endpoint shapes.
@SkipThrottle()
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Public()
  @Throttle({ short: { limit: 5, ttl: 60_000 }, long: { limit: 30, ttl: 600_000 } })
  @Post('signup')
  @HttpCode(201)
  async signup(
    @Body(new ZodValidationPipe(signupSchema)) body: SignupInput,
  ): Promise<AuthResponse> {
    return this.authService.signup(body);
  }

  @Public()
  @Throttle({ short: { limit: 5, ttl: 60_000 }, long: { limit: 30, ttl: 600_000 } })
  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
  ): Promise<AuthResponse> {
    return this.authService.login(body);
  }

  /**
   * Echoes back the current authenticated user. Verifies that the
   * TenantContextMiddleware successfully parsed a JWT (or dev header)
   * — if it didn't, TenantGuard would have already rejected the request.
   */
  @Get('me')
  me(@CurrentTenantId() tenantId: string): {
    tenantId: string;
    userId: string;
    role: string;
  } {
    const ctx = tenantContext.getStore();
    return { tenantId, userId: ctx?.userId ?? '', role: ctx?.role ?? 'TEACHER' };
  }
}
