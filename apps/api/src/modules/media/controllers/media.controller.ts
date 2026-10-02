import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import type { MediaCategory } from '@kidscare/database';
import type { MediaFileItem, UploadMediaResponse } from '@kidscare/shared-types';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { MediaService, type UploadFileInput } from '../services/media.service';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    tenantId: string;
    role: string;
  };
}

interface MulterUploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('media')
@UseGuards(TenantGuard, RolesGuard)
export class MediaController {
  constructor(
    @Inject(MediaService)
    private readonly mediaService: MediaService,
  ) {}

  @Post('upload')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB hard ceiling
      },
    }),
  )
  async upload(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file: MulterUploadedFile | undefined,
    @Query('category') categoryQuery?: string,
  ): Promise<UploadMediaResponse> {
    if (!file) {
      throw new BadRequestException('Lütfen yüklenecek bir dosya seçin.');
    }

    const tenantId = req.user?.tenantId ?? '';
    const userId = req.user?.userId ?? '';

    const category = (categoryQuery ?? 'GENERAL') as MediaCategory;

    const input: UploadFileInput = {
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };

    return this.mediaService.uploadFile(tenantId, userId, input, category);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async list(
    @Req() req: AuthenticatedRequest,
    @Query('category') categoryQuery?: string,
    @Query('limit') limitQuery?: string,
  ): Promise<MediaFileItem[]> {
    const tenantId = req.user?.tenantId ?? '';
    const category = categoryQuery ? (categoryQuery as MediaCategory) : undefined;
    const limit = limitQuery ? Math.min(parseInt(limitQuery, 10), 100) : 50;

    return this.mediaService.listFiles(tenantId, category, limit);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  async delete(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    const tenantId = req.user?.tenantId ?? '';
    await this.mediaService.deleteFile(tenantId, id);

    return {
      success: true,
      message: 'Medya dosyası başarıyla silindi.',
    };
  }
}
