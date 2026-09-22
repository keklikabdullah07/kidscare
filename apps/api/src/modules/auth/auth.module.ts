import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtService } from './services/jwt.service';
import { PasswordService } from './services/password.service';
import { AuthLookupRepository } from './repositories/auth-lookup.repository';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService, PasswordService, AuthLookupRepository],
  // JwtService is consumed by AuthMiddleware (wired in TenantContextModule)
  // and by AuthController (via AuthService). Export so both can inject it.
  exports: [JwtService, PasswordService],
})
export class AuthModule {}
