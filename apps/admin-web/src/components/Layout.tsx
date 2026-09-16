import type { JSX } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

type NavItem = { to: string; label: string; icon?: string };

const baseNav: NavItem[] = [
  { to: '/portal', label: 'Veli Portalı', icon: '🏡' },
  { to: '/students', label: 'Öğrenciler' },
  { to: '/tracking', label: 'Günlük Takip', icon: '🌟' },
  { to: '/attendance', label: 'Yoklama', icon: '🛡️' },
  { to: '/menus', label: 'Yemek Listesi', icon: '🍲' },
  { to: '/gallery', label: 'Galeri', icon: '📸' },
  { to: '/settings', label: 'Kreş Ayarları' },
];

function navClass(isActive: boolean): string {
  return isActive
    ? 'text-blue-600 font-semibold'
    : 'text-gray-600 hover:text-gray-900';
}

export function Layout(): JSX.Element {
  const { state, logout } = useAuth();
  const isParent = state.status === 'authenticated' && state.user.role === 'PARENT';

  // /portal is parent-only. Admin/teacher should not see it (and would
  // 403 on the underlying /parent/children endpoint if they tried).
  const items = isParent
    ? baseNav.filter((n) => n.to === '/portal' || n.to === '/menus' || n.to === '/gallery')
    : baseNav.filter((n) => n.to !== '/portal');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <nav className="flex gap-5 text-sm flex-wrap">
            {items.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => navClass(isActive)}>
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {state.status === 'authenticated' && (
              <>
                <span className="text-gray-600 hidden sm:inline">
                  <strong className="text-gray-900">
                    {state.user.email || state.user.id}
                  </strong>
                  <span className="ml-1.5 px-2 py-0.5 text-xs rounded bg-blue-50 text-blue-700 font-medium">
                    {state.user.role}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100"
                >
                  Çıkış
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}