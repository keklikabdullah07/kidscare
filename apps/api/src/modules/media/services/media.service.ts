import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { MediaCategory, MediaFile } from '@kidscare/database';
import type { MediaFileItem, UploadMediaResponse } from '@kidscare/shared-types';
import { MediaRepository } from '../repositories/media.repository';
import { STORAGE_DRIVER, type IStorageDriver } from '../drivers/storage-driver.interface';

export interface UploadFileInput {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'application/pdf',
]);

const MAX_SIZE_AVATAR = 2 * 1024 * 1024; // 2 MB
const MAX_SIZE_IMAGE = 10 * 1024 * 1024; // 10 MB
const MAX_SIZE_DOCUMENT = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @Inject(MediaRepository)
    private readonly repo: MediaRepository,
    @Inject(STORAGE_DRIVER)
    private readonly storageDriver: IStorageDriver,
  ) {}

  async uploadFile(
    tenantId: string,
    userId: string,
    file: UploadFileInput,
    category: MediaCategory = 'GENERAL',
  ): Promise<UploadMediaResponse> {
    // 1. MIME Type Validation
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        `Desteklenmeyen dosya türü (${file.mimetype}). Yalnızca JPEG, PNG, WEBP, GIF ve PDF kabul edilir.`,
      );
    }

    // 2. Size Limits Validation
    const maxSize =
      category === 'STUDENT_AVATAR'
        ? MAX_SIZE_AVATAR
        : file.mimetype === 'application/pdf'
          ? MAX_SIZE_DOCUMENT
          : MAX_SIZE_IMAGE;

    if (file.size > maxSize) {
      const maxMb = Math.round(maxSize / (1024 * 1024));
      throw new BadRequestException(
        `Dosya boyutu çok büyük (${Math.round(file.size / 1024)} KB). Maksimum izin verilen: ${maxMb} MB.`,
      );
    }

    // 3. Key & Path Generation (Tenant-isolated namespace)
    const sanitizedName = file.originalname.toLowerCase().replace(/[^a-z0-9.-]/g, '_');
    const fileKey = `tenants/${tenantId}/${category.toLowerCase()}/${randomUUID()}-${sanitizedName}`;

    // 4. Dispatch to storage driver (memory buffer, no tmp disk artifacts)
    const result = await this.storageDriver.upload(file.buffer, fileKey, file.mimetype);

    // 5. Save metadata in DB
    const saved = await this.repo.createMediaFile(tenantId, {
      uploadedById: userId,
      category,
      fileName: file.originalname,
      fileKey: result.key,
      mimeType: result.mimeType,
      fileSize: result.size,
      url: result.url,
    });

    this.logger.log(
      `📸 Media uploaded for tenant=${tenantId}, user=${userId}, key=${result.key} (${result.size} bytes)`,
    );

    return {
      success: true,
      file: this.mapToItem(saved),
    };
  }

  async listFiles(
    tenantId: string,
    category?: MediaCategory,
    limit = 50,
  ): Promise<MediaFileItem[]> {
    const records = await this.repo.findMediaFilesByTenant(tenantId, category, limit);
    return records.map((r) => this.mapToItem(r));
  }

  async deleteFile(tenantId: string, id: string): Promise<void> {
    const existing = await this.repo.findMediaFileById(tenantId, id);
    if (!existing) {
      throw new NotFoundException('Belirtilen medya dosyası bulunamadı.');
    }

    // Physical storage removal
    await this.storageDriver.delete(existing.fileKey);

    // DB record removal
    await this.repo.deleteMediaFile(tenantId, id);

    this.logger.log(`🗑️ Media deleted: ${existing.fileKey} (id=${id})`);
  }

  private mapToItem(record: MediaFile): MediaFileItem {
    return {
      id: record.id,
      tenantId: record.tenantId,
      uploadedById: record.uploadedById,
      category: record.category,
      fileName: record.fileName,
      fileKey: record.fileKey,
      mimeType: record.mimeType,
      fileSize: record.fileSize,
      url: record.url,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
