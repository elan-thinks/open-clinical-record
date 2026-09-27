import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchHealth } from '../services/api';
import { AppShell } from './AppShell';
import type { AppRole } from '../types/auth';
import { primaryRole } from '../utils/navigation';

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [backendOnline, setBackendOnline] = useState(false);

  const role: AppRole = user ? primaryRole(user.roles) : 'Doctor';

  const checkBackend = useCallback(async () => {
    try {
      const data = await fetchHealth();
      setBackendOnline(data?.status === 'ok');
    } catch {
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    void checkBackend();
  }, [checkBackend]);

  if (!user) {
    // Never paint a blank white root — ProtectedRoute should redirect, but keep a
    // visible fallback if session is mid-clear.
    return (
      <div style={{ padding: 40, color: 'var(--text-dim)', textAlign: 'center' }}>
        Loading workspace…
      </div>
    );
  }

  return (
    <AppShell
      role={role}
      userName={user.fullName}
      userEmail={user.email}
      currentPath={location.pathname}
      onNavigate={(path) => navigate(path)}
      backendOnline={backendOnline}
      onLogout={() => {
        logout();
        navigate('/login');
      }}
    >
      <Outlet />
    </AppShell>
  );
}
