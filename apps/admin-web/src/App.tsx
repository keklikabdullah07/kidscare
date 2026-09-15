import { useState, useEffect, type JSX } from 'react';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { TenantSettings } from './features/tenant/TenantSettings';
import { StudentsPage } from './features/students/StudentsPage';

import { AttendancePage } from './features/attendance/AttendancePage';
import { DailyMenuPage } from './features/daily-menus/DailyMenuPage';
import { DailyTrackingPage } from './features/daily-reports/DailyTrackingPage';
import { ParentDashboardPage } from './features/parent/ParentDashboardPage';
import { ActivityGalleryPage } from './features/activities/ActivityGalleryPage';

type View =
  | 'parent-portal'
  | 'students'
  | 'daily-tracking'
  | 'attendance'
  | 'daily-menus'
  | 'activities'
  | 'settings';

function AppContent(): JSX.Element {
  const { state, logout } = useAuth();
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [page, setPage] = useState<View>('students');

  useEffect(() => {
    if (state.status === 'authenticated') {
      if (state.user.role === 'PARENT') {
        setPage('parent-portal');
      } else {
        setPage('students');
      }
    }
  }, [state.status, state.status === 'authenticated' ? state.user.role : null]);

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

  const isParent = state.user.role === 'PARENT';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <nav className="flex gap-5 text-sm">
            <button
              type="button"
              onClick={() => setPage('parent-portal')}
              className={
                page === 'parent-portal'
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }
            >
              🏡 Veli Portalı
            </button>

            {!isParent && (
              <>
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
                  onClick={() => setPage('daily-tracking')}
                  className={
                    page === 'daily-tracking'
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                >
                  🌟 Günlük Takip
                </button>
                <button
                  type="button"
                  onClick={() => setPage('attendance')}
                  className={
                    page === 'attendance'
                      ? 'text-blue-600 font-semibold'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                >
                  🛡️ Yoklama
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setPage('daily-menus')}
              className={
                page === 'daily-menus'
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }
            >
              🍲 Yemek Listesi
            </button>

            <button
              type="button"
              onClick={() => setPage('activities')}
              className={
                page === 'activities'
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }
            >
              📸 Galeri
            </button>

            {!isParent && (
              <button
                type="button"
                onClick={() => setPage('settings')}
                className={
                  page === 'settings'
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }
              >
                Kreş Ayarları
              </button>
            )}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600 hidden sm:inline">
              <strong className="text-gray-900">{state.user.email || state.user.id}</strong>
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
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        {page === 'parent-portal' ? (
          <ParentDashboardPage />
        ) : page === 'students' ? (
          <StudentsPage />
        ) : page === 'daily-tracking' ? (
          <DailyTrackingPage />
        ) : page === 'attendance' ? (
          <AttendancePage />
        ) : page === 'daily-menus' ? (
          <DailyMenuPage />
        ) : page === 'activities' ? (
          <ActivityGalleryPage />
        ) : (
          <TenantSettings />
        )}
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
