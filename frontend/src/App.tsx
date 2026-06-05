import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AuthProvider } from './providers/AuthProvider';
import { UserRole } from './types';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import BirthRecordsPage from './pages/registrations/BirthRecordsPage';
import NewRegistrationPage from './pages/registrations/NewRegistrationPage';
import CertificatesPage from './pages/certificates/CertificatesPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import AgentsPage from './pages/agents/AgentsPage';
import AgentWorkspacePage from './pages/agents/AgentWorkspacePage';
import SettingsPage from './pages/settings/SettingsPage';
import VerifyPage from './pages/public/VerifyPage';

// Layout
import AppLayout from './components/layout/AppLayout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to={getRoleHome(user?.role)} replace />;
}

function AuthorizedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: UserRole[];
}) {
  const { user } = useAuthStore();

  if (!user?.role || !roles.includes(user.role)) {
    return <Navigate to={getRoleHome(user?.role)} replace />;
  }

  return <>{children}</>;
}

function RoleHomeRedirect() {
  const { user } = useAuthStore();
  return <Navigate to={getRoleHome(user?.role)} replace />;
}

function AppFallback() {
  const { isAuthenticated, user } = useAuthStore();
  return <Navigate to={isAuthenticated ? getRoleHome(user?.role) : '/login'} replace />;
}

function getRoleHome(role?: UserRole | string) {
  switch (role) {
    case UserRole.FIELD_AGENT:
      return '/agent-workspace';
    case UserRole.MUNICIPAL_REGISTRAR:
      return '/registrations';
    case UserRole.REGIONAL_OFFICER:
    case UserRole.NATIONAL_ADMIN:
    case UserRole.UNICEF_MONITOR:
    case UserRole.WORLD_BANK_OBSERVER:
    default:
      return '/dashboard';
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route path="/verify/:referenceNumber" element={<VerifyPage />} />

          {/* Private Routes */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route
              path="dashboard"
              element={
                <AuthorizedRoute roles={[
                  UserRole.NATIONAL_ADMIN,
                  UserRole.REGIONAL_OFFICER,
                  UserRole.MUNICIPAL_REGISTRAR,
                  UserRole.UNICEF_MONITOR,
                  UserRole.WORLD_BANK_OBSERVER,
                ]}>
                  <DashboardPage />
                </AuthorizedRoute>
              }
            />
            <Route
              path="registrations"
              element={
                <AuthorizedRoute roles={[
                  UserRole.NATIONAL_ADMIN,
                  UserRole.REGIONAL_OFFICER,
                  UserRole.MUNICIPAL_REGISTRAR,
                  UserRole.UNICEF_MONITOR,
                ]}>
                  <BirthRecordsPage />
                </AuthorizedRoute>
              }
            />
            <Route
              path="registrations/new"
              element={
                <AuthorizedRoute roles={[
                  UserRole.NATIONAL_ADMIN,
                  UserRole.MUNICIPAL_REGISTRAR,
                  UserRole.FIELD_AGENT,
                ]}>
                  <NewRegistrationPage />
                </AuthorizedRoute>
              }
            />
            <Route
              path="certificates"
              element={
                <AuthorizedRoute roles={[
                  UserRole.NATIONAL_ADMIN,
                  UserRole.REGIONAL_OFFICER,
                  UserRole.MUNICIPAL_REGISTRAR,
                  UserRole.UNICEF_MONITOR,
                ]}>
                  <CertificatesPage />
                </AuthorizedRoute>
              }
            />
            <Route
              path="analytics"
              element={
                <AuthorizedRoute roles={[
                  UserRole.NATIONAL_ADMIN,
                  UserRole.REGIONAL_OFFICER,
                  UserRole.MUNICIPAL_REGISTRAR,
                  UserRole.UNICEF_MONITOR,
                  UserRole.WORLD_BANK_OBSERVER,
                ]}>
                  <AnalyticsPage />
                </AuthorizedRoute>
              }
            />
            <Route
              path="agents"
              element={
                <AuthorizedRoute roles={[
                  UserRole.NATIONAL_ADMIN,
                  UserRole.REGIONAL_OFFICER,
                  UserRole.MUNICIPAL_REGISTRAR,
                  UserRole.UNICEF_MONITOR,
                ]}>
                  <AgentsPage />
                </AuthorizedRoute>
              }
            />
            <Route
              path="agent-workspace"
              element={
                <AuthorizedRoute roles={[UserRole.FIELD_AGENT]}>
                  <AgentWorkspacePage />
                </AuthorizedRoute>
              }
            />
            <Route path="settings" element={
              <AuthorizedRoute roles={[UserRole.NATIONAL_ADMIN]}>
                <SettingsPage />
              </AuthorizedRoute>
            } />
            <Route index element={<RoleHomeRedirect />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<AppFallback />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
