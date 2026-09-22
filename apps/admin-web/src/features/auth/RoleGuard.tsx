import type { JSX } from 'react';
import { Navigate } from 'react-router-dom';
import type { UserRole } from '@kidscare/shared-types';
import { useAuth } from './AuthContext';
import { ShieldAlert } from 'lucide-react';

/**
 * Route-level role guard. Wraps protected routes and restricts access
 * to the specified roles. Renders an "access denied" screen for
 * unauthorized roles, with a redirect link back to their home page.
 */
export function RoleGuard({
  allowed,
  children,
}: {
  allowed: UserRole[];
  children: JSX.Element;
}): JSX.Element {
  const { state } = useAuth();

  if (state.status !== 'authenticated') {
    return <Navigate to="/login" replace />;
  }

  if (!allowed.includes(state.user.role)) {
    const homePath = state.user.role === 'PARENT' ? '/portal' : '/dashboard';
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Erişim Yetkisi Yok</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-4">
          Bu sayfayı görüntüleme yetkiniz bulunmamaktadır. Lütfen ana sayfanıza dönün.
        </p>
        <a
          href={homePath}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
        >
          Ana Sayfaya Dön
        </a>
      </div>
    );
  }

  return children;
}
