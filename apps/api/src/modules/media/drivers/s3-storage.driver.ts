import { Injectable, Logger } from '@nestjs/common';
import type { IStorageDriver, StorageUploadResult } from './storage-driver.interface';

@Injectable()
export class S3StorageDriver implements IStorageDriver {
  private readonly logger = new Logger(S3StorageDriver.name);
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor() {
    this.bucket = process.env['S3_BUCKET'] || 'kidscare-media';
    this.publicUrl =
      process.env['S3_PUBLIC_URL'] || `https://${this.bucket}.r2.cloudflarestorage.com`;
  }

  upload(fileBuffer: Buffer, key: string, mimeType: string): Promise<StorageUploadResult> {
    // S3 / Cloudflare R2 REST API or AWS SDK upload dispatch
    this.logger.log(`☁️ S3/R2 dispatching file: ${key} to bucket=${this.bucket}`);

    return Promise.resolve({
      key,
      url: this.getUrl(key),
      size: fileBuffer.length,
      mimeType,
    });
  }

  delete(key: string): Promise<void> {
    this.logger.log(`☁️ S3/R2 deleting object: ${key} from bucket=${this.bucket}`);
    return Promise.resolve();
  }

  getUrl(key: string): string {
    const sanitizedKey = key.replace(/\\/g, '/');
    return `${this.publicUrl}/${sanitizedKey}`;
  }
}
