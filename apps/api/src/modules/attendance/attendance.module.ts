import { Module } from '@nestjs/common';
import { StudentsModule } from '../students/students.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceRepository } from './repositories/attendance.repository';
import { AttendanceService } from './services/attendance.service';

@Module({
  imports: [StudentsModule, NotificationsModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceRepository,
    {
      provide: 'IAttendanceRepository',
      useClass: AttendanceRepository,
    },
  ],
  exports: [AttendanceService, AttendanceRepository],
})
export class AttendanceModule {}
