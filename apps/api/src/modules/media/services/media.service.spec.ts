import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MediaService, type UploadFileInput } from './media.service';
import type { MediaRepository } from '../repositories/media.repository';
import type { IStorageDriver } from '../drivers/storage-driver.interface';

describe('MediaService', () => {
  let service: MediaService;
  let repoMock: jest.Mocked<MediaRepository>;
  let driverMock: jest.Mocked<IStorageDriver>;

  const mockTenantId = 'tenant-test-1';
  const mockUserId = 'user-test-1';

  beforeEach(() => {
    repoMock = {
      createMediaFile: jest.fn().mockImplementation((_tenantId, data) =>
        Promise.resolve({
          id: 'media-1',
          tenantId: mockTenantId,
          uploadedById: mockUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        }),
      ),
      findMediaFileById: jest.fn().mockResolvedValue({
        id: 'media-1',
        tenantId: mockTenantId,
        uploadedById: mockUserId,
        category: 'STUDENT_AVATAR',
        fileName: 'avatar.png',
        fileKey: 'tenants/tenant-test-1/student_avatar/uuid-avatar.png',
        mimeType: 'image/png',
        fileSize: 1024,
        url: 'http://localhost:3000/uploads/tenants/tenant-test-1/student_avatar/uuid-avatar.png',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      findMediaFilesByTenant: jest.fn().mockResolvedValue([]),
      deleteMediaFile: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<MediaRepository>;

    driverMock = {
      upload: jest.fn().mockResolvedValue({
        key: 'tenants/tenant-test-1/student_avatar/uuid-avatar.png',
        url: 'http://localhost:3000/uploads/tenants/tenant-test-1/student_avatar/uuid-avatar.png',
        size: 1024,
        mimeType: 'image/png',
      }),
      delete: jest.fn().mockResolvedValue(undefined),
      getUrl: jest.fn().mockReturnValue('http://localhost:3000/uploads/test.png'),
    };

    service = new MediaService(repoMock, driverMock);
  });

  describe('uploadFile', () => {
    it('should successfully upload a valid image file', async () => {
      const input: UploadFileInput = {
        buffer: Buffer.from('fake-image-bytes'),
        originalname: 'my avatar.png',
        mimetype: 'image/png',
        size: 1024,
      };

      const result = await service.uploadFile(mockTenantId, mockUserId, input, 'STUDENT_AVATAR');

      expect(result.success).toBe(true);
      expect(result.file.fileName).toBe('my avatar.png');
      expect(driverMock.upload).toHaveBeenCalledTimes(1);
      expect(repoMock.createMediaFile).toHaveBeenCalledTimes(1);
    });

    it('should reject unsupported MIME types', async () => {
      const input: UploadFileInput = {
        buffer: Buffer.from('malicious-script'),
        originalname: 'script.sh',
        mimetype: 'application/x-sh',
        size: 500,
      };

      await expect(service.uploadFile(mockTenantId, mockUserId, input, 'GENERAL')).rejects.toThrow(
        BadRequestException,
      );

      expect(driverMock.upload).not.toHaveBeenCalled();
    });

    it('should reject file exceeding avatar max size (2MB)', async () => {
      const input: UploadFileInput = {
        buffer: Buffer.alloc(3 * 1024 * 1024), // 3 MB
        originalname: 'big-avatar.jpg',
        mimetype: 'image/jpeg',
        size: 3 * 1024 * 1024,
      };

      await expect(
        service.uploadFile(mockTenantId, mockUserId, input, 'STUDENT_AVATAR'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should sanitize unsafe characters in original filename', async () => {
      const input: UploadFileInput = {
        buffer: Buffer.from('safe-bytes'),
        originalname: 'my photo #1 @kreş.jpg',
        mimetype: 'image/jpeg',
        size: 2048,
      };

      await service.uploadFile(mockTenantId, mockUserId, input, 'ACTIVITY');

      expect(driverMock.upload).toHaveBeenCalledWith(
        input.buffer,
        expect.stringMatching(
          /^tenants\/tenant-test-1\/activity\/[a-f0-9-]+-my_photo__1__kre_\.jpg$/,
        ),
        'image/jpeg',
      );
    });
  });

  describe('listFiles', () => {
    it('should query tenant media files and format response', async () => {
      await service.listFiles(mockTenantId, 'ACTIVITY', 20);

      expect(repoMock.findMediaFilesByTenant).toHaveBeenCalledWith(mockTenantId, 'ACTIVITY', 20);
    });
  });

  describe('deleteFile', () => {
    it('should remove file from both driver and repository', async () => {
      await service.deleteFile(mockTenantId, 'media-1');

      expect(driverMock.delete).toHaveBeenCalledWith(
        'tenants/tenant-test-1/student_avatar/uuid-avatar.png',
      );
      expect(repoMock.deleteMediaFile).toHaveBeenCalledWith(mockTenantId, 'media-1');
    });

    it('should throw NotFoundException if media not found', async () => {
      repoMock.findMediaFileById.mockResolvedValueOnce(null);

      await expect(service.deleteFile(mockTenantId, 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
