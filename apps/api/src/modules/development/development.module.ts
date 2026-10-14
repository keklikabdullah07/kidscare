import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { DevelopmentController } from './controllers/development.controller';
import { DevelopmentRepository } from './repositories/development.repository';
import { DevelopmentService } from './services/development.service';

@Module({
  imports: [NotificationsModule],
  controllers: [DevelopmentController],
  providers: [
    DevelopmentService,
    DevelopmentRepository,
    { provide: 'IDevelopmentRepository', useClass: DevelopmentRepository },
  ],
  exports: [DevelopmentService, DevelopmentRepository],
})
export class DevelopmentModule {}
