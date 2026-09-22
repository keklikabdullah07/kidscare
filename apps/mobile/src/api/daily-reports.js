import { apiFetch } from './client';
export async function getDailyReportsByDate(date) {
    return apiFetch(`/daily-reports?date=${encodeURIComponent(date)}`);
}
export async function getStudentDailyReport(studentId, date) {
    return apiFetch(`/students/${encodeURIComponent(studentId)}/daily-reports/${encodeURIComponent(date)}`);
}
export async function saveStudentDailyReport(studentId, date, payload) {
    return apiFetch(`/students/${encodeURIComponent(studentId)}/daily-reports/${encodeURIComponent(date)}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}
