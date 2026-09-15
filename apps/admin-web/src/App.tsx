import { useState, type JSX } from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { TenantSettings } from './features/tenant/TenantSettings';
import { StudentsPage } from './features/students/StudentsPage';

type View = 'students' | 'settings';

function AppContent(): JSX.Element {
  const { state, logout } = useAuth();
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [page, setPage] = useState<View>('students');

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">Yükleniyor…</div>
    );
  }
  if (state.status === 'unauthenticated') {
    return view === 'login' ? (
      <LoginPage onSwitchToSignup={() => setView('signup')} />
    ) : (
      <SignupPage onSwitchToLogin={() => setView('login')} />
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <nav className="flex gap-4 text-sm">
            <button
              type="button"
              onClick={() => setPage('students')}
              className={
                page === 'students'
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }
            >
              Öğrenciler
            </button>
            <button
              type="button"
              onClick={() => setPage('settings')}
              className={
                page === 'settings'
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }
            >
              Kreş ayarları
            </button>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600 hidden sm:inline">
              <strong className="text-gray-900">{state.user.email || state.user.id}</strong>
            </span>
            <button
              type="button"
              onClick={logout}
              className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded hover:bg-gray-100"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-6">
        {page === 'students' ? <StudentsPage /> : <TenantSettings />}
      </main>
    </div>
  );
}

export function App(): JSX.Element {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
