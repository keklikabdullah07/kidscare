import type { JSX } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Wraps the protected layout. Redirects unauthenticated users to /login
 * while preserving the originally requested URL so the login page can
 * send them back after success. While the auth state is still loading
 * (token revalidation in flight), shows a tiny splash so the protected
 * routes don't flash before redirect kicks in.
 */
export function AuthGuard(): JSX.Element {
  const { state } = useAuth();
  const location = useLocation();

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">Yükleniyor…</div>
    );
  }

  if (state.status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}