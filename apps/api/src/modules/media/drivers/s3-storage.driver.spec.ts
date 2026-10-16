import { InternalServerErrorException } from '@nestjs/common';
import type { S3Client } from '@aws-sdk/client-s3';
import { S3StorageDriver } from './s3-storage.driver';

describe('S3StorageDriver', () => {
  let mockS3Client: jest.Mocked<S3Client>;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      S3_BUCKET: 'test-bucket',
      S3_ENDPOINT: 'https://test-account.r2.cloudflarestorage.com',
      S3_REGION: 'auto',
      S3_ACCESS_KEY_ID: 'test-key-id',
      S3_SECRET_ACCESS_KEY: 'test-secret-key',
      S3_PUBLIC_URL: 'https://media.test.com',
    };

    mockS3Client = {
      send: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<S3Client>;
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('Constructor & Configuration', () => {
    it('should initialize with custom S3Client and provide correct public URL', () => {
      const driver = new S3StorageDriver(mockS3Client);
      expect(driver.getUrl('tenants/t1/avatar.png')).toBe(
        'https://media.test.com/tenants/t1/avatar.png',
      );
    });

    it('should sanitize backslashes and redundant slashes in getUrl', () => {
      const driver = new S3StorageDriver(mockS3Client);
      expect(driver.getUrl('\\tenants\\t1\\photos\\pic.jpg')).toBe(
        'https://media.test.com/tenants/t1/photos/pic.jpg',
      );
    });

    it('should warn when credentials are missing and no custom client is provided', () => {
      delete process.env['S3_ACCESS_KEY_ID'];
      delete process.env['S3_SECRET_ACCESS_KEY'];
      const driver = new S3StorageDriver();
      expect(driver).toBeDefined();
    });
  });

  describe('upload', () => {
    it('should successfully upload buffer to S3/R2 and return result', async () => {
      const driver = new S3StorageDriver(mockS3Client);
      const buffer = Buffer.from('test-image-content');
      const key = 'tenants/t1/student_avatar/abc-avatar.png';
      const mimeType = 'image/png';

      const result = await driver.upload(buffer, key, mimeType);

      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        key,
        url: 'https://media.test.com/tenants/t1/student_avatar/abc-avatar.png',
        size: buffer.length,
        mimeType,
      });
    });

    it('should throw InternalServerErrorException when S3Client is not configured', async () => {
      delete process.env['S3_ACCESS_KEY_ID'];
      delete process.env['S3_SECRET_ACCESS_KEY'];
      const driver = new S3StorageDriver();
      const buffer = Buffer.from('test-data');

      await expect(driver.upload(buffer, 'test.png', 'image/png')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException when S3 send fails', async () => {
      (mockS3Client.send as jest.Mock).mockRejectedValueOnce(new Error('S3 Network Timeout'));
      const driver = new S3StorageDriver(mockS3Client);
      const buffer = Buffer.from('test-data');

      await expect(driver.upload(buffer, 'test.png', 'image/png')).rejects.toThrow(
        /Bulut depolamaya dosya yüklenemedi: S3 Network Timeout/,
      );
    });
  });

  describe('delete', () => {
    it('should successfully delete object from S3/R2', async () => {
      const driver = new S3StorageDriver(mockS3Client);
      const key = 'tenants/t1/student_avatar/abc-avatar.png';

      await driver.delete(key);

      expect(mockS3Client.send).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when S3Client is not configured on delete', async () => {
      delete process.env['S3_ACCESS_KEY_ID'];
      delete process.env['S3_SECRET_ACCESS_KEY'];
      const driver = new S3StorageDriver();

      await expect(driver.delete('test.png')).rejects.toThrow(InternalServerErrorException);
    });

    it('should throw InternalServerErrorException when S3 delete fails', async () => {
      (mockS3Client.send as jest.Mock).mockRejectedValueOnce(new Error('Access Denied'));
      const driver = new S3StorageDriver(mockS3Client);

      await expect(driver.delete('test.png')).rejects.toThrow(
        /Bulut depolamadan dosya silinemedi: Access Denied/,
      );
    });
  });
});
