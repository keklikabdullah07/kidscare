import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from '../../modules/auth/auth.module';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { TenantContextMiddleware } from './tenant-context.middleware';

/**
 * Wires two middlewares in order:
 *
 *   1. AuthMiddleware — parses `Authorization: Bearer <jwt>` and sets ctx.
 *   2. TenantContextMiddleware — dev fallback that reads X-Tenant-Id /
 *      X-User-Id / X-Role headers when no JWT is present. Lets local
 *      e2e tests and the admin-web slice 1 keep working until auth is
 *      shipped through the UI.
 *
 * Once the frontend is fully on JWT, drop TenantContextMiddleware.
 */
@Module({ imports: [AuthModule] })
export class TenantContextModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthMiddleware, TenantContextMiddleware).forRoutes('*');
  }
}
