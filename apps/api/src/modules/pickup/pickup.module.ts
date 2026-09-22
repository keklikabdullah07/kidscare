import { Module } from '@nestjs/common';
import { PickupController } from './controllers/pickup.controller';
import { PickupRepository } from './repositories/pickup.repository';
import { PickupService } from './services/pickup.service';

@Module({
  controllers: [PickupController],
  providers: [
    PickupService,
    PickupRepository,
    {
      provide: 'IPickupRepository',
      useClass: PickupRepository,
    },
  ],
  exports: [PickupService, PickupRepository],
})
export class PickupModule {}
