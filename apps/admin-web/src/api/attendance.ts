import type {
  Attendance,
  AttendanceUpdateInput,
  CheckInInput,
  CheckOutInput,
} from '@kidscare/shared-types';
import { apiFetch } from './client';

export async function getAttendanceByDate(date: string): Promise<Attendance[]> {
  return apiFetch<Attendance[]>(`/attendance?date=${encodeURIComponent(date)}`);
}

export async function getStudentAttendance(
  studentId: string,
  date: string,
): Promise<Attendance | null> {
  return apiFetch<Attendance | null>(
    `/students/${encodeURIComponent(studentId)}/attendance/${encodeURIComponent(date)}`,
  );
}

export async function checkInStudent(
  studentId: string,
  date: string,
  payload: CheckInInput = {},
): Promise<Attendance> {
  return apiFetch<Attendance>(
    `/students/${encodeURIComponent(studentId)}/attendance/${encodeURIComponent(date)}/check-in`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export async function checkOutStudent(
  studentId: string,
  date: string,
  payload: CheckOutInput,
): Promise<Attendance> {
  return apiFetch<Attendance>(
    `/students/${encodeURIComponent(studentId)}/attendance/${encodeURIComponent(date)}/check-out`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export async function updateStudentAttendance(
  studentId: string,
  date: string,
  payload: AttendanceUpdateInput,
): Promise<Attendance> {
  return apiFetch<Attendance>(
    `/students/${encodeURIComponent(studentId)}/attendance/${encodeURIComponent(date)}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  );
}
