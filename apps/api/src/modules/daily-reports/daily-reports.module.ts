import { Module } from '@nestjs/common';
import { StudentsModule } from '../students/students.module';
import { ClassroomsModule } from '../classrooms/classrooms.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DailyReportsController } from './controllers/daily-reports.controller';
import { DailyReportsRepository } from './repositories/daily-reports.repository';
import { DailyReportsService } from './services/daily-reports.service';

@Module({
  imports: [StudentsModule, ClassroomsModule, NotificationsModule],
  controllers: [DailyReportsController],
  providers: [
    DailyReportsService,
    DailyReportsRepository,
    {
      provide: 'IDailyReportsRepository',
      useClass: DailyReportsRepository,
    },
  ],
  exports: [DailyReportsService, DailyReportsRepository],
})
export class DailyReportsModule {}
