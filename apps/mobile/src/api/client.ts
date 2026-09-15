import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'kidscare.token';

/**
 * API base URL. Android emulator routes 10.0.2.2 → host machine's
 * localhost. iOS simulator can reach localhost directly. Real devices
 * need the LAN IP of the dev machine — set EXPO_PUBLIC_API_URL via
 * `expo start --env EXPO_PUBLIC_API_URL=http://192.168.x.x:3000`.
 */
declare const process: { env: Record<string, string | undefined> };

function resolveBaseUrl(): string {
  // React Native doesn't ship @types/node, so declare `process` locally
  // with the narrow shape we need. EXPO_PUBLIC_* vars are inlined at
  // bundle time by Metro.
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
}

const BASE_URL = resolveBaseUrl();

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
  const headers = new Headers(init.headers);
  const token = await getStoredToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const text = await res.text();
  const body: unknown = text.length > 0 ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, body, `API ${res.status} on ${path}`);
  }
  return body as T;
}

export function getBaseUrl(): string {
  return BASE_URL;
}
