import type { DailyReport, DailyReportInput } from '@kidscare/shared-types';
import { apiFetch } from './client';

export async function getDailyReportsByDate(date: string): Promise<DailyReport[]> {
  return apiFetch<DailyReport[]>(`/daily-reports?date=${encodeURIComponent(date)}`);
}

export async function getStudentDailyReport(
  studentId: string,
  date: string,
): Promise<DailyReport | null> {
  return apiFetch<DailyReport | null>(
    `/students/${encodeURIComponent(studentId)}/daily-reports/${encodeURIComponent(date)}`,
  );
}

export async function saveStudentDailyReport(
  studentId: string,
  date: string,
  payload: DailyReportInput,
): Promise<DailyReport> {
  return apiFetch<DailyReport>(
    `/students/${encodeURIComponent(studentId)}/daily-reports/${encodeURIComponent(date)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
}
