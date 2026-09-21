import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader, useHoldLoading } from '../components/PageLoader';
import type { AppRole } from '../types/auth';

interface ProtectedRouteProps {
  /** If set, user must have at least one of these roles. */
  roles?: AppRole[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  // Only this “Restoring your session…” screen stays longer (~3.2s)
  const showLoader = useHoldLoading(isLoading, 3200);

  if (showLoader) {
    return (
      <PageLoader variant="session" label="Restoring your session…" />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const has = roles.some((r) => user.roles.includes(r));
    if (!has) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  if (user.mustChangePassword && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}
