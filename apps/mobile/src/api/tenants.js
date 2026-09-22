import { apiFetch } from './client';
export function getTenantMe() {
    return apiFetch('/tenants/me');
}
export function updateTenantMe(name) {
    return apiFetch('/tenants/me', {
        method: 'PATCH',
        body: JSON.stringify({ name }),
    });
}
