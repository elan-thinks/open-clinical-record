import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/PageLoader';

interface ProtectedRouteProps {
  /** If set, user must have at least one of these roles. */
  roles?: string[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, isLoading, primaryRole } = useAuth();

  if (isLoading) {
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

  // Force password change flow if required
  if (user.mustChangePassword && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
}
