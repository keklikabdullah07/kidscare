import type { Student, StudentPassport } from '@kidscare/shared-types';
import { apiFetch } from './client';

export function listStudents(): Promise<Student[]> {
  return apiFetch<Student[]>('/students');
}

export function getStudentPassport(id: string): Promise<StudentPassport> {
  return apiFetch<StudentPassport>(`/students/${id}/passport`);
}

export function updateStudentPassport(
  id: string,
  payload: StudentPassport,
): Promise<StudentPassport> {
  return apiFetch<StudentPassport>(`/students/${id}/passport`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function createStudent(payload: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  notes?: string;
  passport?: StudentPassport;
}): Promise<Student> {
  return apiFetch<Student>('/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteStudent(id: string): Promise<Student> {
  return apiFetch<Student>(`/students/${id}`, {
    method: 'DELETE',
  });
}
