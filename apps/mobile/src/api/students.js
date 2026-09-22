import { apiFetch } from './client';
export function listStudents() {
    return apiFetch('/students');
}
export function getStudentPassport(id) {
    return apiFetch(`/students/${id}/passport`);
}
export function updateStudentPassport(id, payload) {
    return apiFetch(`/students/${id}/passport`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
}
export function createStudent(payload) {
    return apiFetch('/students', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}
export function deleteStudent(id) {
    return apiFetch(`/students/${id}`, {
        method: 'DELETE',
    });
}
