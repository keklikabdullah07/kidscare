import type { MediaCategory, MediaFileItem, UploadMediaResponse } from '@kidscare/shared-types';
import { apiFetch } from './client';

export function listMediaFiles(category?: MediaCategory, limit = 50): Promise<MediaFileItem[]> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (limit) params.set('limit', String(limit));

  const query = params.toString();
  return apiFetch<MediaFileItem[]>(`/media${query ? `?${query}` : ''}`);
}

export function uploadMediaFile(
  file: File,
  category: MediaCategory = 'ACTIVITY',
): Promise<UploadMediaResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const query = `?category=${encodeURIComponent(category)}`;
  return apiFetch<UploadMediaResponse>(`/media/upload${query}`, {
    method: 'POST',
    body: formData,
  });
}

export function deleteMediaFile(id: string): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>(`/media/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
