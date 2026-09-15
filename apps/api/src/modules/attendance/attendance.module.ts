import { Module } from '@nestjs/common';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceRepository } from './repositories/attendance.repository';
import { AttendanceService } from './services/attendance.service';

@Module({
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    {
      provide: 'IAttendanceRepository',
      useClass: AttendanceRepository,
    },
  ],
  exports: [AttendanceService],
})
export class AttendanceModule {}
