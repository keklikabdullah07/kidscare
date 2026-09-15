import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { AuthResponse, AuthenticatedUser } from '@kidscare/shared-types';
import * as authApi from '../api/auth';
import { ApiError, setStoredToken } from '../api/client';

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated'; error: string | null }
  | { status: 'authenticated'; user: AuthenticatedUser; token: string };

type AuthContextValue = {
  state: AuthState;
  login: (slug: string, email: string, password: string) => Promise<void>;
  signup: (slug: string, name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function persistAndSet(resp: AuthResponse): Promise<AuthenticatedUser> {
  await setStoredToken(resp.token);
  return resp.user;
}

export function AuthProvider({ children }: { children: ReactNode }): ReactElement {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((ctx) => {
        if (cancelled) return;
        setState({
          status: 'authenticated',
          user: {
            id: ctx.userId,
            tenantId: ctx.tenantId,
            email: '',
            role: ctx.role as AuthenticatedUser['role'],
          },
          token: '',
        });
      })
      .catch(async (err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          await setStoredToken(null);
        }
        setState({ status: 'unauthenticated', error: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (slug: string, email: string, password: string): Promise<void> => {
      try {
        const resp = await authApi.login({
          tenantSlug: slug,
          email,
          password,
        });
        const user = await persistAndSet(resp);
        setState({ status: 'authenticated', user, token: resp.token });
      } catch (err) {
        const msg =
          err instanceof ApiError && err.status === 401
            ? 'Email, şifre veya kreş slug yanlış'
            : err instanceof Error
              ? err.message
              : 'Giriş başarısız';
        setState({ status: 'unauthenticated', error: msg });
        throw err;
      }
    },
    [],
  );

  const signup = useCallback(
    async (slug: string, name: string, email: string, password: string): Promise<void> => {
      try {
        const resp = await authApi.signup({
          tenantSlug: slug,
          tenantName: name,
          email,
          password,
        });
        const user = await persistAndSet(resp);
        setState({ status: 'authenticated', user, token: resp.token });
      } catch (err) {
        const msg =
          err instanceof ApiError && err.status === 409
            ? 'Bu kreş slug zaten alınmış'
            : err instanceof Error
              ? err.message
              : 'Kayıt başarısız';
        setState({ status: 'unauthenticated', error: msg });
        throw err;
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    await setStoredToken(null);
    setState({ status: 'unauthenticated', error: null });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ state, login, signup, logout }),
    [state, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
