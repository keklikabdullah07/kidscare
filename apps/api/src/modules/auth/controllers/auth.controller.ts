import { Body, Controller, Get, HttpCode, Inject, Patch, Post, Query } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import {
  userProfileUpdateSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type ResetPasswordInput,
  type SignupInput,
  type UserProfileUpdate,
} from '@kidscare/shared-schemas';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser, type CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { tenantContext } from '@kidscare/tenant-context';
import { Public } from '../../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../../common/pipes/zod-validation.pipe';
import type {
  AuthResponse,
  AuthenticatedUser,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  VerifyResetTokenResponse,
} from '@kidscare/shared-types';
import { loginSchema } from '../dto/login.dto';
import { signupSchema } from '../dto/signup.dto';
import { forgotPasswordSchema } from '../dto/forgot-password.dto';
import { resetPasswordSchema } from '../dto/reset-password.dto';
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
  @Throttle({ short: { limit: 30, ttl: 60_000 }, long: { limit: 120, ttl: 600_000 } })
  @Post('signup')
  @HttpCode(201)
  async signup(
    @Body(new ZodValidationPipe(signupSchema)) body: SignupInput,
  ): Promise<AuthResponse> {
    return this.authService.signup(body);
  }

  @Public()
  @Throttle({ short: { limit: 30, ttl: 60_000 }, long: { limit: 120, ttl: 600_000 } })
  @Post('login')
  @HttpCode(200)
  async login(@Body(new ZodValidationPipe(loginSchema)) body: LoginInput): Promise<AuthResponse> {
    return this.authService.login(body);
  }

  @Public()
  @Throttle({ short: { limit: 5, ttl: 60_000 }, long: { limit: 20, ttl: 600_000 } })
  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(
    @Body(new ZodValidationPipe(forgotPasswordSchema)) body: ForgotPasswordInput,
  ): Promise<ForgotPasswordResponse> {
    return this.authService.forgotPassword(body);
  }

  @Public()
  @Get('verify-reset-token')
  async verifyResetToken(@Query('token') token: string): Promise<VerifyResetTokenResponse> {
    return this.authService.verifyResetToken(token);
  }

  @Public()
  @Throttle({ short: { limit: 5, ttl: 60_000 }, long: { limit: 20, ttl: 600_000 } })
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordSchema)) body: ResetPasswordInput,
  ): Promise<ResetPasswordResponse> {
    return this.authService.resetPassword(body);
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

  @Patch('profile')
  @HttpCode(200)
  async updateProfile(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(userProfileUpdateSchema)) body: UserProfileUpdate,
  ): Promise<AuthenticatedUser> {
    return this.authService.updateProfile(user.userId, user.tenantId, body);
  }
}

