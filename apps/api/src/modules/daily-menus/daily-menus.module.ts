import { Module } from '@nestjs/common';
import { StudentsModule } from '../students/students.module';
import { DailyMenusController } from './controllers/daily-menus.controller';
import { DailyMenusRepository } from './repositories/daily-menus.repository';
import { DailyMenusService } from './services/daily-menus.service';

@Module({
  imports: [StudentsModule],
  controllers: [DailyMenusController],
  providers: [
    DailyMenusService,
    DailyMenusRepository,
    {
      provide: 'IDailyMenusRepository',
      useClass: DailyMenusRepository,
    },
  ],
  exports: [DailyMenusService],
})
export class DailyMenusModule {}
