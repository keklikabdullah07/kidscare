import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import type { JwtClaims } from '@kidscare/shared-types';

const EXPIRES_IN = '24h';

@Injectable()
export class JwtService {
  private readonly secret: string;

  constructor(config: ConfigService) {
    this.secret = config.getOrThrow<string>('JWT_SECRET');
  }

  sign(claims: JwtClaims): string {
    return jwt.sign(claims, this.secret, { expiresIn: EXPIRES_IN });
  }

  verify(token: string): JwtClaims {
    try {
      const decoded = jwt.verify(token, this.secret);
      if (typeof decoded === 'string' || !decoded.sub) {
        throw new UnauthorizedException('Malformed token');
      }
      return {
        sub: String(decoded.sub),
        tenantId: String(decoded.tenantId),
        role: decoded.role as JwtClaims['role'],
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
