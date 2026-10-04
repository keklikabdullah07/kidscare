import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { MediaFile, MediaCategory } from '@kidscare/database';

export interface CreateMediaFileInput {
  uploadedById: string;
  category: MediaCategory;
  fileName: string;
  fileKey: string;
  mimeType: string;
  fileSize: number;
  url: string;
}

@Injectable()
export class MediaRepository {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async createMediaFile(tenantId: string, data: CreateMediaFileInput): Promise<MediaFile> {
    return this.prisma.withTenant((client) =>
      client.mediaFile.create({
        data: {
          tenantId,
          uploadedById: data.uploadedById,
          category: data.category,
          fileName: data.fileName,
          fileKey: data.fileKey,
          mimeType: data.mimeType,
          fileSize: data.fileSize,
          url: data.url,
        },
      }),
    );
  }

  async findMediaFileById(tenantId: string, id: string): Promise<MediaFile | null> {
    return this.prisma.withTenant((client) =>
      client.mediaFile.findFirst({
        where: {
          id,
          tenantId,
        },
      }),
    );
  }

  async findMediaFilesByTenant(
    tenantId: string,
    category?: MediaCategory,
    limit = 50,
  ): Promise<MediaFile[]> {
    return this.prisma.withTenant((client) =>
      client.mediaFile.findMany({
        where: {
          tenantId,
          ...(category ? { category } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
    );
  }

  async deleteMediaFile(tenantId: string, id: string): Promise<void> {
    await this.prisma.withTenant((client) =>
      client.mediaFile.deleteMany({
        where: {
          id,
          tenantId,
        },
      }),
    );
  }
}
