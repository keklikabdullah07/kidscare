import { useEffect, type JSX } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { AuthGuard } from './features/auth/AuthGuard';
import { RoleGuard } from './features/auth/RoleGuard';
import { LoginPage } from './features/auth/LoginPage';
import { SignupPage } from './features/auth/SignupPage';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { ThemeProvider } from './components/ThemeContext';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { StudentsPage } from './features/students/StudentsPage';
import { AttendancePage } from './features/attendance/AttendancePage';
import { DailyMenuPage } from './features/daily-menus/DailyMenuPage';
import { DailyTrackingPage } from './features/daily-reports/DailyTrackingPage';
import { ParentDashboardPage } from './features/parent/ParentDashboardPage';
import { ActivityGalleryPage } from './features/activities/ActivityGalleryPage';
import { TenantSettings } from './features/tenant/TenantSettings';
import { TeamPage } from './features/team/TeamPage';
import { PickupPage } from './features/pickup/PickupPage';
import { MedicationPage } from './features/medication/MedicationPage';
import { MessagesPage } from './features/messages/MessagesPage';
import { ParentRequestsPage } from './features/messages/ParentRequestsPage';
import { IncidentsPage } from './features/incidents/IncidentsPage';
import { DevelopmentPage } from './features/development/DevelopmentPage';
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

/** Roles that can manage the daycare (everything except PARENT) */
const STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'TEACHER'] as const;
/** All roles — pages shared between staff and parents */
const ALL_ROLES = ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT'] as const;

export function App(): JSX.Element {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <UnauthorizedRedirect />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route element={<AuthGuard />}>
                <Route element={<Layout />}>
                  {/* Parent-only portal */}
                  <Route
                    path="/portal"
                    element={
                      <RoleGuard allowed={['PARENT']}>
                        <ParentDashboardPage />
                      </RoleGuard>
                    }
                  />

                  {/* Staff-only pages (PARENT cannot access) */}
                  <Route
                    path="/dashboard"
                    element={
                      <RoleGuard allowed={[...STAFF_ROLES]}>
                        <DashboardPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/students"
                    element={
                      <RoleGuard allowed={[...STAFF_ROLES]}>
                        <StudentsPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/tracking"
                    element={
                      <RoleGuard allowed={[...STAFF_ROLES]}>
                        <DailyTrackingPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/attendance"
                    element={
                      <RoleGuard allowed={[...STAFF_ROLES]}>
                        <AttendancePage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/team"
                    element={
                      <RoleGuard allowed={['SUPER_ADMIN', 'ADMIN']}>
                        <TeamPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <RoleGuard allowed={['SUPER_ADMIN', 'ADMIN']}>
                        <TenantSettings />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/pickup"
                    element={
                      <RoleGuard allowed={[...ALL_ROLES]}>
                        <PickupPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/medication"
                    element={
                      <RoleGuard allowed={[...ALL_ROLES]}>
                        <MedicationPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/messages"
                    element={
                      <RoleGuard allowed={[...ALL_ROLES]}>
                        <MessagesPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/requests"
                    element={
                      <RoleGuard allowed={[...ALL_ROLES]}>
                        <ParentRequestsPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/incidents"
                    element={
                      <RoleGuard allowed={[...STAFF_ROLES]}>
                        <IncidentsPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/development"
                    element={
                      <RoleGuard allowed={[...ALL_ROLES]}>
                        <DevelopmentPage />
                      </RoleGuard>
                    }
                  />

                  {/* Shared pages (all roles can view) */}
                  <Route
                    path="/menus"
                    element={
                      <RoleGuard allowed={[...ALL_ROLES]}>
                        <DailyMenuPage />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/gallery"
                    element={
                      <RoleGuard allowed={[...ALL_ROLES]}>
                        <ActivityGalleryPage />
                      </RoleGuard>
                    }
                  />
                </Route>
              </Route>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="*" element={<HomeRedirect />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
