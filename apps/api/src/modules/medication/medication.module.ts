import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { MedicationController } from './controllers/medication.controller';
import { MedicationRepository } from './repositories/medication.repository';
import { MedicationService } from './services/medication.service';

@Module({
  imports: [NotificationsModule],
  controllers: [MedicationController],
  providers: [
    MedicationService,
    MedicationRepository,
    {
      provide: 'IMedicationRepository',
      useClass: MedicationRepository,
    },
  ],
  exports: [MedicationService, MedicationRepository],
})
export class MedicationModule {}
