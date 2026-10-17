import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
  type ReactNode,
} from 'react';
import type {
  AuthResponse,
  AuthenticatedUser,
  UserProfileUpdateInput,
} from '@kidscare/shared-types';
import * as authApi from '../../api/auth';
import { ApiError, onUnauthorized, setStoredToken } from '../../api/client';

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated'; error: string | null }
  | { status: 'authenticated'; user: AuthenticatedUser; token: string };

type AuthContextValue = {
  state: AuthState;
  login: (slug: string, email: string, password: string) => Promise<void>;
  signup: (slug: string, name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UserProfileUpdateInput) => Promise<AuthenticatedUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function persistAndSet(resp: AuthResponse): AuthenticatedUser {
  setStoredToken(resp.token);
  if (typeof window !== 'undefined') {
    if (resp.user.email) {
      localStorage.setItem('kidscare_user_email', resp.user.email);
    }
    localStorage.setItem('kidscare_user_profile', JSON.stringify(resp.user));
  }
  return resp.user;
}

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  // On mount, validate any stored token by calling /auth/me. If 401,
  // the token is gone (e.g. JWT_SECRET rotated) — drop to unauthenticated.
  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((ctx) => {
        if (cancelled) return;
        const cachedEmail =
          typeof window !== 'undefined' ? localStorage.getItem('kidscare_user_email') || '' : '';
        let cachedProfile: Partial<AuthenticatedUser> = {};
        if (typeof window !== 'undefined') {
          try {
            const raw = localStorage.getItem('kidscare_user_profile');
            if (raw) cachedProfile = JSON.parse(raw) as Partial<AuthenticatedUser>;
          } catch {
            // ignore JSON parse error
          }
        }
        setState({
          status: 'authenticated',
          user: {
            id: ctx.userId,
            tenantId: ctx.tenantId,
            email: cachedProfile.email || cachedEmail,
            role: (cachedProfile.role as AuthenticatedUser['role']) || (ctx.role as AuthenticatedUser['role']),
            firstName: cachedProfile.firstName ?? null,
            lastName: cachedProfile.lastName ?? null,
            avatarUrl: cachedProfile.avatarUrl ?? null,
            phone: cachedProfile.phone ?? null,
          },
          token: '',
        });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          setStoredToken(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('kidscare_user_email');
            localStorage.removeItem('kidscare_user_profile');
          }
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
        setState({
          status: 'authenticated',
          user: persistAndSet(resp),
          token: resp.token,
        });
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
        setState({
          status: 'authenticated',
          user: persistAndSet(resp),
          token: resp.token,
        });
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

  const logout = useCallback((): void => {
    setStoredToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kidscare_user_email');
      localStorage.removeItem('kidscare_user_profile');
    }
    setState({ status: 'unauthenticated', error: null });
  }, []);

  const updateProfile = useCallback(
    async (data: UserProfileUpdateInput): Promise<AuthenticatedUser> => {
      const updatedUser = await authApi.updateProfile(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kidscare_user_profile', JSON.stringify(updatedUser));
      }
      setState((prev) => {
        if (prev.status === 'authenticated') {
          return {
            ...prev,
            user: updatedUser,
          };
        }
        return prev;
      });
      return updatedUser;
    },
    [],
  );

  // Auto-logout when the api layer broadcasts a 401 from any fetch.
  useEffect(() => {
    return onUnauthorized(() => {
      setState({ status: 'unauthenticated', error: 'Oturum sona erdi' });
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ state, login, signup, logout, updateProfile }),
    [state, login, signup, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const DEFAULT_AUTH_FALLBACK: AuthContextValue = {
  state: { status: 'unauthenticated', error: null },
  login: () => Promise.resolve(),
  signup: () => Promise.resolve(),
  logout: () => {},
  updateProfile: () => Promise.reject(new Error('updateProfile requires <AuthProvider>')),
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.warn('⚠️ useAuth was called outside <AuthProvider>. Using defensive fallback context.');
    }
    return DEFAULT_AUTH_FALLBACK;
  }
  return ctx;
}
