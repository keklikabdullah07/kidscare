import { apiFetch } from './client';
export function getDailyMenu(date) {
    return apiFetch(`/daily-menus?date=${encodeURIComponent(date)}`);
}
export function saveDailyMenu(input) {
    return apiFetch('/daily-menus', {
        method: 'POST',
        body: JSON.stringify(input),
    });
}
export function updateDailyMenu(date, input) {
    return apiFetch(`/daily-menus/${encodeURIComponent(date)}`, {
        method: 'PUT',
        body: JSON.stringify(input),
    });
}
