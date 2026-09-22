import { Module } from '@nestjs/common';
import { MedicationController } from './controllers/medication.controller';
import { MedicationRepository } from './repositories/medication.repository';
import { MedicationService } from './services/medication.service';

@Module({
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
