import { apiFetch } from './client';
export function getActivities(query) {
    const params = new URLSearchParams();
    if (query?.classroom)
        params.append('classroom', query.classroom);
    if (query?.studentId)
        params.append('studentId', query.studentId);
    if (query?.tag)
        params.append('tag', query.tag);
    if (query?.limit)
        params.append('limit', String(query.limit));
    if (query?.offset)
        params.append('offset', String(query.offset));
    const qs = params.toString();
    return apiFetch(`/activities${qs ? `?${qs}` : ''}`);
}
export function createActivity(data) {
    return apiFetch('/activities', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
export function deleteActivity(id) {
    return apiFetch(`/activities/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}
