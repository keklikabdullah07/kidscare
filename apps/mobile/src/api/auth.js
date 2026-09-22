import { apiFetch } from './client';
export function login(payload) {
    return apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}
export function signup(payload) {
    return apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}
export function me() {
    return apiFetch('/auth/me');
}
