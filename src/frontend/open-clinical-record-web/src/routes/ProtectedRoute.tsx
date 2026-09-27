import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader, useHoldLoading } from '../components/PageLoader';
import type { AppRole } from '../types/auth';

interface ProtectedRouteProps {
  /** If set, user must have at least one of these roles. */
  roles?: AppRole[];
}

/**
 * Temporary-password users must change credentials before using the app.
 * Route is /profile (Security section) — there is no separate /change-password page.
 * Redirecting to a missing path previously caused Navigate → * → dashboard → loop.
 */
const PASSWORD_CHANGE_PATH = '/profile';

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
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

  if (user.mustChangePassword && location.pathname !== PASSWORD_CHANGE_PATH) {
    return <Navigate to={PASSWORD_CHANGE_PATH} replace />;
  }

  return <Outlet />;
}
