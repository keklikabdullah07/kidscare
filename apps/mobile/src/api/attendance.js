import { apiFetch } from './client';
export function getAttendanceByDate(date) {
    return apiFetch(`/attendance?date=${encodeURIComponent(date)}`);
}
export function getStudentAttendance(studentId, date) {
    return apiFetch(`/students/${studentId}/attendance/${encodeURIComponent(date)}`);
}
export function checkInStudent(studentId, date, input) {
    return apiFetch(`/students/${studentId}/attendance/${encodeURIComponent(date)}/check-in`, {
        method: 'POST',
        body: JSON.stringify(input ?? {}),
    });
}
export function checkOutStudent(studentId, date, input) {
    return apiFetch(`/students/${studentId}/attendance/${encodeURIComponent(date)}/check-out`, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}
export function updateStudentAttendance(studentId, date, input) {
    return apiFetch(`/students/${studentId}/attendance/${encodeURIComponent(date)}`, {
        method: 'PUT',
        body: JSON.stringify(input),
    });
}
