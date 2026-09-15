import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { TenantContextModule } from './common/context/tenant-context.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantGuard } from './common/guards/tenant.guard';
import { TenantsModule } from './modules/tenants/tenants.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AuthModule } from './modules/auth/auth.module';
import { DailyMenusModule } from './modules/daily-menus/daily-menus.module';
import { DailyReportsModule } from './modules/daily-reports/daily-reports.module';
import { ParentModule } from './modules/parent/parent.module';
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
    AttendanceModule,
    DailyMenusModule,
    ParentModule,
  ],
  providers: [
    Reflector,
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new TenantGuard(reflector),
      inject: [Reflector],
    },
  ],
})
export class AppModule {}
