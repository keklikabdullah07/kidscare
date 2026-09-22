import { createContext, useCallback, useContext, useEffect, useMemo, useState, } from 'react';
import * as authApi from '../api/auth';
import { ApiError, setStoredToken } from '../api/client';
const AuthContext = createContext(null);
async function persistAndSet(resp) {
    await setStoredToken(resp.token);
    return resp.user;
}
export function AuthProvider({ children }) {
    const [state, setState] = useState({ status: 'loading' });
    useEffect(() => {
        let cancelled = false;
        authApi
            .me()
            .then((ctx) => {
            if (cancelled)
                return;
            setState({
                status: 'authenticated',
                user: {
                    id: ctx.userId,
                    tenantId: ctx.tenantId,
                    email: '',
                    role: ctx.role,
                },
                token: '',
            });
        })
            .catch(async (err) => {
            if (cancelled)
                return;
            if (err instanceof ApiError && err.status === 401) {
                await setStoredToken(null);
            }
            setState({ status: 'unauthenticated', error: null });
        });
        return () => {
            cancelled = true;
        };
    }, []);
    const login = useCallback(async (slug, email, password) => {
        try {
            const resp = await authApi.login({
                tenantSlug: slug,
                email,
                password,
            });
            const user = await persistAndSet(resp);
            setState({ status: 'authenticated', user, token: resp.token });
        }
        catch (err) {
            const msg = err instanceof ApiError && err.status === 401
                ? 'Email, şifre veya kreş slug yanlış'
                : err instanceof Error
                    ? err.message
                    : 'Giriş başarısız';
            setState({ status: 'unauthenticated', error: msg });
            throw err;
        }
    }, []);
    const signup = useCallback(async (slug, name, email, password) => {
        try {
            const resp = await authApi.signup({
                tenantSlug: slug,
                tenantName: name,
                email,
                password,
            });
            const user = await persistAndSet(resp);
            setState({ status: 'authenticated', user, token: resp.token });
        }
        catch (err) {
            const msg = err instanceof ApiError && err.status === 409
                ? 'Bu kreş slug zaten alınmış'
                : err instanceof Error
                    ? err.message
                    : 'Kayıt başarısız';
            setState({ status: 'unauthenticated', error: msg });
            throw err;
        }
    }, []);
    const logout = useCallback(async () => {
        await setStoredToken(null);
        setState({ status: 'unauthenticated', error: null });
    }, []);
    const value = useMemo(() => ({ state, login, signup, logout }), [state, login, signup, logout]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
