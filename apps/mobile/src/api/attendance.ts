import type {
  Attendance,
  AttendanceUpdateInput,
  CheckInInput,
  CheckOutInput,
} from '@kidscare/shared-types';
import { apiFetch } from './client';

export function getAttendanceByDate(date: string): Promise<Attendance[]> {
  return apiFetch<Attendance[]>(`/attendance?date=${encodeURIComponent(date)}`);
}

export function getStudentAttendance(studentId: string, date: string): Promise<Attendance | null> {
  return apiFetch<Attendance | null>(
    `/students/${studentId}/attendance/${encodeURIComponent(date)}`,
  );
}

export function checkInStudent(
  studentId: string,
  date: string,
  input?: CheckInInput,
): Promise<Attendance> {
  return apiFetch<Attendance>(
    `/students/${studentId}/attendance/${encodeURIComponent(date)}/check-in`,
    {
      method: 'POST',
      body: JSON.stringify(input ?? {}),
    },
  );
}

export function checkOutStudent(
  studentId: string,
  date: string,
  input: CheckOutInput,
): Promise<Attendance> {
  return apiFetch<Attendance>(
    `/students/${studentId}/attendance/${encodeURIComponent(date)}/check-out`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export function updateStudentAttendance(
  studentId: string,
  date: string,
  input: AttendanceUpdateInput,
): Promise<Attendance> {
  return apiFetch<Attendance>(`/students/${studentId}/attendance/${encodeURIComponent(date)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}
