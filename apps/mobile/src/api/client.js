import AsyncStorage from '@react-native-async-storage/async-storage';
const TOKEN_KEY = 'kidscare.token';
const CUSTOM_URL_KEY = 'kidscare.custom_api_url';
let runtimeBaseUrl = null;
export async function getCustomBaseUrl() {
    const stored = await AsyncStorage.getItem(CUSTOM_URL_KEY);
    if (stored &&
        !stored.includes('loca.lt') &&
        !stored.includes('192.168.1.154') &&
        !stored.includes('192.168.68.')) {
        runtimeBaseUrl = stored;
        return stored;
    }
    await AsyncStorage.removeItem(CUSTOM_URL_KEY);
    runtimeBaseUrl = 'https://kidscare-api.onrender.com';
    return runtimeBaseUrl;
}
export async function setCustomBaseUrl(url) {
    runtimeBaseUrl = url?.trim() || null;
    if (runtimeBaseUrl)
        await AsyncStorage.setItem(CUSTOM_URL_KEY, runtimeBaseUrl);
    else
        await AsyncStorage.removeItem(CUSTOM_URL_KEY);
}
export function resolveBaseUrl() {
    if (runtimeBaseUrl)
        return runtimeBaseUrl;
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl)
        return envUrl;
    return 'https://kidscare-api.onrender.com';
}
export class ApiError extends Error {
    status;
    body;
    constructor(status, body, message) {
        super(message);
        this.status = status;
        this.body = body;
        this.name = 'ApiError';
    }
}
export async function getStoredToken() {
    return AsyncStorage.getItem(TOKEN_KEY);
}
export async function setStoredToken(token) {
    if (token)
        await AsyncStorage.setItem(TOKEN_KEY, token);
    else
        await AsyncStorage.removeItem(TOKEN_KEY);
}
export async function apiFetch(path, init = {}) {
    if (!runtimeBaseUrl) {
        const custom = await getCustomBaseUrl();
        if (custom)
            runtimeBaseUrl = custom;
    }
    const baseUrl = resolveBaseUrl();
    const headers = new Headers(init.headers);
    headers.set('Bypass-Tunnel-Reminder', 'true');
    const token = await getStoredToken();
    if (token)
        headers.set('Authorization', `Bearer ${token}`);
    if (init.body && !headers.has('content-type')) {
        headers.set('content-type', 'application/json');
    }
    const method = init.method || 'GET';
    console.log(`📡 [MOBILE -> API] ${method} ${baseUrl}${path}`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    let res;
    try {
        res = await fetch(`${baseUrl}${path}`, {
            ...init,
            headers,
            signal: controller.signal,
        });
    }
    catch (err) {
        const errorMsg = err instanceof Error && err.name === 'AbortError'
            ? `Sunucuya (${baseUrl}) bağlanırken 8sn zaman aşımı oluştu.`
            : `Sunucuya (${baseUrl}) bağlanılamadı: ${err instanceof Error ? err.message : String(err)}`;
        console.error(`❌ [MOBILE NETWORK ERROR] ${method} ${baseUrl}${path}:`, errorMsg);
        throw new Error(errorMsg, { cause: err });
    }
    finally {
        clearTimeout(timeoutId);
    }
    const text = await res.text();
    let body;
    try {
        body = text.length > 0 ? JSON.parse(text) : null;
    }
    catch {
        body = text;
    }
    if (!res.ok) {
        const errorMsg = body && typeof body === 'object' && 'message' in body
            ? String(body.message)
            : `API ${res.status} on ${path}`;
        console.error(`❌ [MOBILE API ERROR ${res.status}] ${method} ${baseUrl}${path}:`, body);
        throw new ApiError(res.status, body, errorMsg);
    }
    console.log(`✅ [MOBILE API SUCCESS] ${method} ${baseUrl}${path} (${res.status})`);
    return body;
}
export function getBaseUrl() {
    return resolveBaseUrl();
}
