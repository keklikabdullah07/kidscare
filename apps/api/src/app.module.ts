import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { HealthModule } from './health/health.module';
import { TenantContextModule } from './common/context/tenant-context.module';
import { PrismaModule } from './prisma/prisma.module';
import { TenantGuard } from './common/guards/tenant.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TenantsModule } from './modules/tenants/tenants.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AuthModule } from './modules/auth/auth.module';
import { DailyMenusModule } from './modules/daily-menus/daily-menus.module';
import { DailyReportsModule } from './modules/daily-reports/daily-reports.module';
import { ParentModule } from './modules/parent/parent.module';
import { StudentsModule } from './modules/students/students.module';
import { ActivitiesModule } from './modules/activities/activities.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1_000, limit: 10 },
      { name: 'long', ttl: 60_000, limit: 200 },
    ]),
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
    ActivitiesModule,
  ],
  providers: [
    Reflector,
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new TenantGuard(reflector),
      inject: [Reflector],
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
