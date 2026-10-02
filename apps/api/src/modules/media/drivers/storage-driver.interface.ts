export interface StorageUploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface IStorageDriver {
  upload(fileBuffer: Buffer, key: string, mimeType: string): Promise<StorageUploadResult>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

export const STORAGE_DRIVER = 'STORAGE_DRIVER';
