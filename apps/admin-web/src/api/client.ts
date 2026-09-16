/// <reference types="vite/client" />
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

const TOKEN_KEY = 'kidscare.token';
const DEFAULT_TIMEOUT_MS = 10_000;
const UNAUTHORIZED_EVENT = 'kidscare:unauthorized';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/**
 * Resolves the API base URL.
 * - Dev: empty string → Vite proxy intercepts /auth, /students, … paths.
 * - Prod: VITE_API_URL injected at build time, default Render URL.
 */
function resolveBaseUrl(): string {
  if (import.meta.env.DEV) return '';
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  return envUrl && envUrl.trim().length > 0 ? envUrl.trim() : 'https://kidscare-api.onrender.com';
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getStoredToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const method = (init.method ?? 'GET').toUpperCase();
  const baseUrl = resolveBaseUrl();
  const url = `${baseUrl}${path}`;

  let lastError: unknown;
  const attempts = method === 'GET' ? 2 : 1;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const res = await fetch(url, { ...init, method, headers, signal: controller.signal });
      const text = await res.text();
      const body: unknown = text.length > 0 ? JSON.parse(text) : null;

      if (res.status === 401) {
        setStoredToken(null);
        window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
        throw new ApiError(401, body, 'Oturum sona erdi, lütfen tekrar giriş yapın');
      }

      if (!res.ok) {
        // Retry only on transient GET failures (5xx + network)
        if (method === 'GET' && res.status >= 500 && attempt < attempts) continue;
        const msg =
          body && typeof body === 'object' && 'message' in body && typeof body.message === 'string'
            ? body.message
            : `API ${res.status} on ${path}`;
        throw new ApiError(res.status, body, msg);
      }

      return body as T;
    } catch (err: unknown) {
      lastError = err;
      // Don't retry on ApiError (already a final response)
      if (err instanceof ApiError) throw err;
      // Retry network/abort errors on GET only
      if (method === 'GET' && attempt < attempts) continue;
      const msg =
        err instanceof Error && err.name === 'AbortError'
          ? `İstek zaman aşımına uğradı (${DEFAULT_TIMEOUT_MS / 1000}s)`
          : err instanceof Error
            ? err.message
            : 'Ağ hatası';
      throw new Error(msg, { cause: err });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Bilinmeyen hata');
}

export function onUnauthorized(handler: () => void): () => void {
  const listener = (): void => handler();
  window.addEventListener(UNAUTHORIZED_EVENT, listener);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, listener);
}