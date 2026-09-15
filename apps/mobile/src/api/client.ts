import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'kidscare.token';
const CUSTOM_URL_KEY = 'kidscare.custom_api_url';
let runtimeBaseUrl: string | null = null;

declare const process: { env: Record<string, string | undefined> };

export async function getCustomBaseUrl(): Promise<string | null> {
  const stored = await AsyncStorage.getItem(CUSTOM_URL_KEY);
  if (
    stored &&
    !stored.includes('loca.lt') &&
    !stored.includes('192.168.1.154') &&
    !stored.includes('192.168.68.')
  ) {
    runtimeBaseUrl = stored;
    return stored;
  }
  await AsyncStorage.removeItem(CUSTOM_URL_KEY);
  runtimeBaseUrl = 'https://kidscare-api.onrender.com';
  return runtimeBaseUrl;
}

export async function setCustomBaseUrl(url: string | null): Promise<void> {
  runtimeBaseUrl = url?.trim() || null;
  if (runtimeBaseUrl) await AsyncStorage.setItem(CUSTOM_URL_KEY, runtimeBaseUrl);
  else await AsyncStorage.removeItem(CUSTOM_URL_KEY);
}

export function resolveBaseUrl(): string {
  if (runtimeBaseUrl) return runtimeBaseUrl;
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  return 'https://kidscare-api.onrender.com';
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setStoredToken(token: string | null): Promise<void> {
  if (token) await AsyncStorage.setItem(TOKEN_KEY, token);
  else await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!runtimeBaseUrl) {
    const custom = await getCustomBaseUrl();
    if (custom) runtimeBaseUrl = custom;
  }
  const baseUrl = resolveBaseUrl();
  const headers = new Headers(init.headers);
  headers.set('Bypass-Tunnel-Reminder', 'true');
  const token = await getStoredToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const method = init.method || 'GET';
  console.log(`📡 [MOBILE -> API] ${method} ${baseUrl}${path}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error && err.name === 'AbortError'
        ? `Sunucuya (${baseUrl}) bağlanırken 8sn zaman aşımı oluştu.`
        : `Sunucuya (${baseUrl}) bağlanılamadı: ${err instanceof Error ? err.message : String(err)}`;
    console.error(`❌ [MOBILE NETWORK ERROR] ${method} ${baseUrl}${path}:`, errorMsg);
    throw new Error(errorMsg, { cause: err });
  } finally {
    clearTimeout(timeoutId);
  }

  const text = await res.text();
  let body: unknown;
  try {
    body = text.length > 0 ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!res.ok) {
    const errorMsg =
      body && typeof body === 'object' && 'message' in body
        ? String(body.message)
        : `API ${res.status} on ${path}`;
    console.error(`❌ [MOBILE API ERROR ${res.status}] ${method} ${baseUrl}${path}:`, body);
    throw new ApiError(res.status, body, errorMsg);
  }
  console.log(`✅ [MOBILE API SUCCESS] ${method} ${baseUrl}${path} (${res.status})`);
  return body as T;
}

export function getBaseUrl(): string {
  return resolveBaseUrl();
}
