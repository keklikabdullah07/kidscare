import { apiFetch } from './client';
export async function fetchParentChildrenOverview(date) {
    const query = date ? `?date=${encodeURIComponent(date)}` : '';
    const response = await apiFetch(`/parent/children${query}`);
    if (Array.isArray(response))
        return response;
    if (response && Array.isArray(response.data)) {
        return response.data;
    }
    return [];
}
