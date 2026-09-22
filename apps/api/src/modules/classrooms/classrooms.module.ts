import { Module } from '@nestjs/common';
import { ClassroomsController } from './controllers/classrooms.controller';
import { ClassroomsRepository } from './repositories/classrooms.repository';
import { ClassroomsService } from './services/classrooms.service';

@Module({
  controllers: [ClassroomsController],
  providers: [ClassroomsService, ClassroomsRepository],
  exports: [ClassroomsService, ClassroomsRepository],
})
export class ClassroomsModule {}
