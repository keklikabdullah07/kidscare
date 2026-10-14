import { Module } from '@nestjs/common';
import { ConsentsController } from './controllers/consents.controller';
import { ConsentsService } from './services/consents.service';
import { ConsentsRepository } from './repositories/consents.repository';
import { StudentsModule } from '../students/students.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [StudentsModule, NotificationsModule],
  controllers: [ConsentsController],
  providers: [ConsentsService, ConsentsRepository],
  exports: [ConsentsService, ConsentsRepository],
})
export class ConsentsModule {}
