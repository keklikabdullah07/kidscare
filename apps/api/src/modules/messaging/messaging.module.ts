import { Module } from '@nestjs/common';
import { MessagingController } from './controllers/messaging.controller';
import { MessagingRepository } from './repositories/messaging.repository';
import { MessagingService } from './services/messaging.service';

@Module({
  controllers: [MessagingController],
  providers: [
    MessagingService,
    MessagingRepository,
    { provide: 'IMessagingRepository', useClass: MessagingRepository },
  ],
  exports: [MessagingService, MessagingRepository],
})
export class MessagingModule {}
