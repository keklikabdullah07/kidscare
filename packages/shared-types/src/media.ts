export type MediaCategory =
  'STUDENT_AVATAR' | 'DAILY_REPORT' | 'ACTIVITY' | 'PORTFOLIO' | 'HEALTH_RECORD' | 'GENERAL';

export interface MediaFileItem {
  id: string;
  tenantId: string;
  uploadedById: string;
  category: MediaCategory;
  fileName: string;
  fileKey: string;
  mimeType: string;
  fileSize: number;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadMediaResponse {
  success: boolean;
  file: MediaFileItem;
}

export interface UploadMediaOptions {
  category?: MediaCategory | undefined;
}
