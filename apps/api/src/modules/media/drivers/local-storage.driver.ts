import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { IStorageDriver, StorageUploadResult } from './storage-driver.interface';

@Injectable()
export class LocalStorageDriver implements IStorageDriver {
  private readonly logger = new Logger(LocalStorageDriver.name);
  private readonly baseUploadDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.baseUploadDir = path.resolve(process.cwd(), 'uploads');
    this.baseUrl = process.env['APP_URL'] || 'http://localhost:3000';

    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }
  }

  async upload(fileBuffer: Buffer, key: string, mimeType: string): Promise<StorageUploadResult> {
    const fullPath = path.resolve(this.baseUploadDir, key);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      await fs.promises.mkdir(dir, { recursive: true });
    }

    await fs.promises.writeFile(fullPath, fileBuffer);
    this.logger.debug(`💾 Local storage saved file: ${key} (${fileBuffer.length} bytes)`);

    return {
      key,
      url: this.getUrl(key),
      size: fileBuffer.length,
      mimeType,
    };
  }

  async delete(key: string): Promise<void> {
    const fullPath = path.resolve(this.baseUploadDir, key);
    try {
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        this.logger.debug(`🗑️ Local storage deleted file: ${key}`);
      }
    } catch (err: unknown) {
      this.logger.warn(
        `Failed to delete file ${key} from local storage: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  getUrl(key: string): string {
    const sanitizedKey = key.replace(/\\/g, '/');
    return `${this.baseUrl}/uploads/${sanitizedKey}`;
  }
}
