import { Module } from '@nestjs/common';
import { TenantsController } from './controllers/tenants.controller';
import { TenantsService } from './services/tenants.service';
import { TenantsRepository } from './repositories/tenants.repository';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService, { provide: 'ITenantsRepository', useClass: TenantsRepository }],
})
export class TenantsModule {}
