import { Module } from '@nestjs/common';
import { IncidentsController } from './controllers/incidents.controller';
import { IncidentsRepository } from './repositories/incidents.repository';
import { IncidentsService } from './services/incidents.service';

@Module({
  controllers: [IncidentsController],
  providers: [
    IncidentsService,
    IncidentsRepository,
    { provide: 'IIncidentsRepository', useClass: IncidentsRepository },
  ],
  exports: [IncidentsService, IncidentsRepository],
})
export class IncidentsModule {}
