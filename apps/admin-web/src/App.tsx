import { useEffect, type JSX } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { AuthGuard } from './features/auth/AuthGuard';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { StudentsPage } from './features/students/StudentsPage';
import { AttendancePage } from './features/attendance/AttendancePage';
import { DailyMenuPage } from './features/daily-menus/DailyMenuPage';
import { DailyTrackingPage } from './features/daily-reports/DailyTrackingPage';
import { ParentDashboardPage } from './features/parent/ParentDashboardPage';
import { ActivityGalleryPage } from './features/activities/ActivityGalleryPage';
import { TenantSettings } from './features/tenant/TenantSettings';
import { onUnauthorized } from './api/client';

/**
 * Listens to 401 broadcasts from the api layer and nudges the router
 * to /login. Runs once at app mount inside the AuthProvider scope so
 * the navigate() side-effect is safe to call.
 */
function UnauthorizedRedirect(): null {
  const navigate = useNavigate();
  useEffect(() => {
    return onUnauthorized(() => {
      void navigate('/login', { replace: true });
    });
  }, [navigate]);
  return null;
}

/**
 * After login/signup success, send users to a sensible landing page:
 * PARENT → /portal, everyone else → /dashboard
 */
function HomeRedirect(): JSX.Element {
  const { state } = useAuth();
  if (state.status === 'authenticated') {
    return <Navigate to={state.user.role === 'PARENT' ? '/portal' : '/dashboard'} replace />;
  }
  return <Navigate to="/login" replace />;
}

export function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <UnauthorizedRedirect />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route element={<AuthGuard />}>
              <Route element={<Layout />}>
                <Route path="/portal" element={<ParentDashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/students" element={<StudentsPage />} />
                <Route path="/tracking" element={<DailyTrackingPage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/menus" element={<DailyMenuPage />} />
                <Route path="/gallery" element={<ActivityGalleryPage />} />
                <Route path="/settings" element={<TenantSettings />} />
              </Route>
            </Route>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
