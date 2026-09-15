import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { AppRole } from '../types/auth';

interface ProtectedRouteProps {
  /** If set, user must have at least one of these roles. */
  roles?: AppRole[];
}

export function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, isLoading, primaryRole } = useAuth();

  if (isLoading) {
    return (
      <div style={{ padding: 40, color: 'var(--text-dim)', textAlign: 'center' }}>
        Loading session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const allowed = user.roles.some((r) => roles.includes(r as AppRole));
    if (!allowed) {
      return (
        <div style={{ padding: 40, maxWidth: 480 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', marginBottom: 8 }}>Access denied</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, lineHeight: 1.5 }}>
            Your role ({primaryRole ?? (user.roles.join(', ') || 'none')}) cannot open this page.
            Contact an administrator if you need access.
          </p>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/dashboard';
            }}
            style={{
              marginTop: 16,
              background: 'var(--teal)',
              color: '#04140c',
              border: 'none',
              padding: '10px 14px',
              borderRadius: 9,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Back to dashboard
          </button>
        </div>
      );
    }
  }

  return <Outlet />;
}
