import { Module } from '@nestjs/common';
import { AttendanceModule } from '../attendance/attendance.module';
import { DailyReportsModule } from '../daily-reports/daily-reports.module';
import { StudentsModule } from '../students/students.module';
import { ParentController } from './controllers/parent.controller';
import { ParentService } from './services/parent.service';

@Module({
  imports: [StudentsModule, AttendanceModule, DailyReportsModule],
  controllers: [ParentController],
  providers: [ParentService],
  exports: [ParentService],
})
export class ParentModule {}
