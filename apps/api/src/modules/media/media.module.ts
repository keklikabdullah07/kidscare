import { Module } from '@nestjs/common';
import { MediaController } from './controllers/media.controller';
import { MediaService } from './services/media.service';
import { MediaRepository } from './repositories/media.repository';
import { LocalStorageDriver } from './drivers/local-storage.driver';
import { S3StorageDriver } from './drivers/s3-storage.driver';
import { STORAGE_DRIVER } from './drivers/storage-driver.interface';

@Module({
  controllers: [MediaController],
  providers: [
    MediaRepository,
    MediaService,
    LocalStorageDriver,
    S3StorageDriver,
    {
      provide: STORAGE_DRIVER,
      useClass: process.env['STORAGE_DRIVER'] === 's3' ? S3StorageDriver : LocalStorageDriver,
    },
  ],
  exports: [MediaService, MediaRepository],
})
export class MediaModule {}
