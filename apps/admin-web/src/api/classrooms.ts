import type {
  BulkDailyReportsInput,
  Classroom,
  ClassroomDailyFlow,
  DailyReport,
} from '@kidscare/shared-types';
import { apiFetch } from './client';

export async function listClassrooms(): Promise<Classroom[]> {
  return apiFetch<Classroom[]>('/classrooms');
}

export async function getClassroomDailyFlow(
  classroomId: string,
  date: string,
): Promise<ClassroomDailyFlow> {
  return apiFetch<ClassroomDailyFlow>(
    `/classrooms/${encodeURIComponent(classroomId)}/daily-flow?date=${encodeURIComponent(date)}`,
  );
}

export async function bulkSaveClassroomDailyReports(
  classroomId: string,
  date: string,
  payload: BulkDailyReportsInput,
): Promise<DailyReport[]> {
  return apiFetch<DailyReport[]>(
    `/classrooms/${encodeURIComponent(classroomId)}/daily-reports/bulk?date=${encodeURIComponent(date)}`,
    { method: 'PUT', body: JSON.stringify(payload) },
  );
}
