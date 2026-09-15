import { Module } from '@nestjs/common';
import { DailyReportsController } from './controllers/daily-reports.controller';
import { DailyReportsRepository } from './repositories/daily-reports.repository';
import { DailyReportsService } from './services/daily-reports.service';

@Module({
  controllers: [DailyReportsController],
  providers: [
    DailyReportsService,
    {
      provide: 'IDailyReportsRepository',
      useClass: DailyReportsRepository,
    },
  ],
  exports: [DailyReportsService],
})
export class DailyReportsModule {}
