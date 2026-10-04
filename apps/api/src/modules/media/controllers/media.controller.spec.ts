import { BadRequestException } from '@nestjs/common';
import { MediaController } from './media.controller';
import type { MediaService } from '../services/media.service';

describe('MediaController', () => {
  let controller: MediaController;
  let serviceMock: jest.Mocked<MediaService>;

  beforeEach(() => {
    serviceMock = {
      uploadFile: jest.fn().mockResolvedValue({
        success: true,
        file: {
          id: 'media-1',
          tenantId: 'tenant-1',
          uploadedById: 'user-1',
          category: 'GENERAL',
          fileName: 'test.jpg',
          fileKey: 'tenants/tenant-1/general/uuid-test.jpg',
          mimeType: 'image/jpeg',
          fileSize: 1024,
          url: 'http://localhost:3000/uploads/tenants/tenant-1/general/uuid-test.jpg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),
      listFiles: jest.fn().mockResolvedValue([]),
      deleteFile: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<MediaService>;

    controller = new MediaController(serviceMock);
  });

  it('should call mediaService.uploadFile on valid file upload', async () => {
    const req = {
      user: {
        userId: 'user-1',
        tenantId: 'tenant-1',
        role: 'ADMIN',
      },
    } as unknown as Parameters<typeof controller.upload>[0];

    const file = {
      buffer: Buffer.from('test-content'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      fieldname: 'file',
      encoding: '7bit',
    };

    const res = await controller.upload(req, file, 'GENERAL');

    expect(res.success).toBe(true);
    expect(serviceMock.uploadFile).toHaveBeenCalledWith(
      'tenant-1',
      'user-1',
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      'GENERAL',
    );
  });

  it('should throw BadRequestException if file is missing in upload request', async () => {
    const req = {
      user: {
        userId: 'user-1',
        tenantId: 'tenant-1',
        role: 'ADMIN',
      },
    } as unknown as Parameters<typeof controller.upload>[0];

    await expect(controller.upload(req, undefined)).rejects.toThrow(BadRequestException);
  });

  it('should call mediaService.listFiles on GET /media for TEACHER role', async () => {
    const req = {
      user: {
        userId: 'user-1',
        tenantId: 'tenant-1',
        role: 'TEACHER',
      },
    } as unknown as Parameters<typeof controller.upload>[0];

    await controller.list(req, 'ACTIVITY', '10');

    expect(serviceMock.listFiles).toHaveBeenCalledWith('tenant-1', 'ACTIVITY', 10);
  });

  it('should call mediaService.listFiles on GET /media for PARENT role', async () => {
    const req = {
      user: {
        userId: 'parent-1',
        tenantId: 'tenant-1',
        role: 'PARENT',
      },
    } as unknown as Parameters<typeof controller.upload>[0];

    await controller.list(req, 'ACTIVITY', '20');

    expect(serviceMock.listFiles).toHaveBeenCalledWith('tenant-1', 'ACTIVITY', 20);
  });

  it('should call mediaService.deleteFile on DELETE /media/:id', async () => {
    const req = {
      user: {
        userId: 'user-1',
        tenantId: 'tenant-1',
        role: 'ADMIN',
      },
    } as unknown as Parameters<typeof controller.upload>[0];

    const res = await controller.delete(req, 'media-1');

    expect(res.success).toBe(true);
    expect(serviceMock.deleteFile).toHaveBeenCalledWith('tenant-1', 'media-1');
  });
});
