import type {
  AllergenWarningSummary,
  DailyMenu,
  DailyMenuCreateInput,
  DailyMenuUpdateInput,
} from '@kidscare/shared-types';
import { apiFetch } from './client';

export interface DailyMenuResponse {
  menu: DailyMenu | null;
  allergenWarnings: AllergenWarningSummary[];
}

export function getDailyMenu(date: string): Promise<DailyMenuResponse> {
  return apiFetch<DailyMenuResponse>(`/daily-menus?date=${encodeURIComponent(date)}`);
}

export function saveDailyMenu(input: DailyMenuCreateInput): Promise<DailyMenuResponse> {
  return apiFetch<DailyMenuResponse>('/daily-menus', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateDailyMenu(
  date: string,
  input: DailyMenuUpdateInput,
): Promise<DailyMenuResponse> {
  return apiFetch<DailyMenuResponse>(`/daily-menus/${encodeURIComponent(date)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}
