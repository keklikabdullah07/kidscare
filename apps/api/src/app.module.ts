import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { TenantContextModule } from './common/context/tenant-context.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantGuard } from './common/guards/tenant.guard';
import { TenantsModule } from './modules/tenants/tenants.module';
import { AuthModule } from './modules/auth/auth.module';
import { DailyReportsModule } from './modules/daily-reports/daily-reports.module';
import { StudentsModule } from './modules/students/students.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TenantContextModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    TenantsModule,
    StudentsModule,
    DailyReportsModule,
  ],
  providers: [Reflector, { provide: APP_GUARD, useClass: TenantGuard }],
})
export class AppModule {}
