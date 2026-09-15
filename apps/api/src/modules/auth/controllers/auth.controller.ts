import { BadRequestException, Body, Controller, Get, HttpCode, Inject, Post } from '@nestjs/common';
import { CurrentTenantId } from '../../../common/decorators/current-tenant.decorator';
import { tenantContext } from '@kidscare/tenant-context';
import { Public } from '../../../common/decorators/public.decorator';
import type { AuthResponse } from '@kidscare/shared-types';
import { loginSchema } from '../dto/login.dto';
import { signupSchema } from '../dto/signup.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(201)
  async signup(@Body() body: unknown): Promise<AuthResponse> {
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid signup payload',
        issues: parsed.error.issues,
      });
    }
    return this.authService.signup(parsed.data);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: unknown): Promise<AuthResponse> {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Invalid login payload',
        issues: parsed.error.issues,
      });
    }
    return this.authService.login(parsed.data);
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
