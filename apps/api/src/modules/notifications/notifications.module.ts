import { Module } from '@nestjs/common';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsRepository } from './repositories/notifications.repository';
import { NotificationsService } from './services/notifications.service';
import { ExpoPushService } from './services/expo-push.service';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    ExpoPushService,
    { provide: 'INotificationsRepository', useClass: NotificationsRepository },
  ],
  exports: [NotificationsService, NotificationsRepository, ExpoPushService],
})
export class NotificationsModule {}
