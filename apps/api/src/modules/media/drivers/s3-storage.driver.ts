import { Injectable, InternalServerErrorException, Logger, Optional } from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { IStorageDriver, StorageUploadResult } from './storage-driver.interface';

@Injectable()
export class S3StorageDriver implements IStorageDriver {
  private readonly logger = new Logger(S3StorageDriver.name);
  private readonly client: S3Client | null = null;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(@Optional() customClient?: S3Client) {
    this.bucket = process.env['S3_BUCKET'] || 'kidscare-media';
    const endpoint = process.env['S3_ENDPOINT'];
    const region = process.env['S3_REGION'] || 'auto';
    const accessKeyId = process.env['S3_ACCESS_KEY_ID'];
    const secretAccessKey = process.env['S3_SECRET_ACCESS_KEY'];

    this.publicUrl =
      process.env['S3_PUBLIC_URL'] ||
      (endpoint ? `${endpoint}/${this.bucket}` : `https://${this.bucket}.r2.cloudflarestorage.com`);

    if (customClient) {
      this.client = customClient;
    } else if (accessKeyId && secretAccessKey) {
      this.client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        ...(endpoint ? { endpoint } : {}),
      });
      this.logger.log(
        `☁️ S3StorageDriver initialized for bucket=${this.bucket} (region=${region})`,
      );
    } else {
      this.logger.warn(
        '⚠️ S3/R2 credentials missing (S3_ACCESS_KEY_ID or S3_SECRET_ACCESS_KEY). Uploads will fail unless configured.',
      );
    }
  }

  async upload(fileBuffer: Buffer, key: string, mimeType: string): Promise<StorageUploadResult> {
    if (!this.client) {
      throw new InternalServerErrorException(
        'Bulut depolama kimlik bilgileri (S3/R2) sunucu üzerinde yapılandırılmamış.',
      );
    }

    const sanitizedKey = key.replace(/\\/g, '/').replace(/^\/+/, '');
    this.logger.log(
      `☁️ S3/R2 uploading file: ${sanitizedKey} to bucket=${this.bucket} (${fileBuffer.length} bytes)`,
    );

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: sanitizedKey,
        Body: fileBuffer,
        ContentType: mimeType,
      });

      await this.client.send(command);

      return {
        key: sanitizedKey,
        url: this.getUrl(sanitizedKey),
        size: fileBuffer.length,
        mimeType,
      };
    } catch (error) {
      this.logger.error(
        `❌ S3 upload failed for ${sanitizedKey}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        `Bulut depolamaya dosya yüklenemedi: ${(error as Error).message}`,
      );
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.client) {
      throw new InternalServerErrorException(
        'Bulut depolama kimlik bilgileri (S3/R2) sunucu üzerinde yapılandırılmamış.',
      );
    }

    const sanitizedKey = key.replace(/\\/g, '/').replace(/^\/+/, '');
    this.logger.log(`☁️ S3/R2 deleting object: ${sanitizedKey} from bucket=${this.bucket}`);

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: sanitizedKey,
      });

      await this.client.send(command);
    } catch (error) {
      this.logger.error(
        `❌ S3 delete failed for ${sanitizedKey}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        `Bulut depolamadan dosya silinemedi: ${(error as Error).message}`,
      );
    }
  }

  getUrl(key: string): string {
    const sanitizedKey = key.replace(/\\/g, '/').replace(/^\/+/, '');
    const baseUrl = this.publicUrl.replace(/\/+$/, '');
    return `${baseUrl}/${sanitizedKey}`;
  }
}
