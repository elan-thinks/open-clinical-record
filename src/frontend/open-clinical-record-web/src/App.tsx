import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell } from './layouts/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { fetchHealth } from './services/api';
import { demoUser, getStoredUser } from './services/authStorage';
import type { AppRole } from './types/auth';
import { primaryRole } from './utils/navigation';

function pathFromLocation(): string {
  const path = window.location.pathname.replace(/\/$/, '') || '/dashboard';
  return path === '/' ? '/dashboard' : path;
}

function pageMeta(path: string): { title: string; description: string } {
  const pages: Record<string, { title: string; description: string }> = {
    '/patients': {
      title: 'Patients',
      description: 'Search, register, and open patient records.',
    },
    '/chart': {
      title: 'Medical Chart',
      description: 'Allergies, medications, alerts, and visit history.',
    },
    '/records': {
      title: 'Medical Records',
      description: 'Clinical documentation and encounter notes.',
    },
    '/appointments': {
      title: 'Appointments',
      description: 'Schedule, reschedule, cancel, and view appointment status.',
    },
    '/vitals': {
      title: 'Record vitals',
      description: 'Capture vital signs for the current visit.',
    },
    '/register': {
      title: 'Registration',
      description: 'Register a new patient at the front desk.',
    },
    '/checkin': {
      title: 'Check-in / Queue',
      description: 'Check in arrivals and manage the walk-in queue.',
    },
    '/reports': {
      title: 'Reports',
      description: 'Operational and clinical summary reports.',
    },
    '/profile': {
      title: 'Profile',
      description: 'Your account details and preferences.',
    },
    '/admin/users': {
      title: 'Users',
      description: 'Manage application users and access.',
    },
    '/admin/roles': {
      title: 'Roles & Permissions',
      description: 'Configure role-based access for the clinic.',
    },
    '/admin/audit': {
      title: 'Audit Logs',
      description: 'Review security and clinical audit events.',
    },
  };
  return (
    pages[path] ?? {
      title: 'Page',
      description: 'This area will be implemented in a later milestone.',
    }
  );
}

function App() {
  const stored = getStoredUser();
  const [role, setRole] = useState<AppRole>(
    stored ? primaryRole(stored.roles) : 'Doctor',
  );
  const [path, setPath] = useState(pathFromLocation);
  const [backendOnline, setBackendOnline] = useState(false);

  const user = useMemo(() => stored ?? demoUser(role), [stored, role]);

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
    const onPop = () => setPath(pathFromLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [checkBackend]);

  const navigate = (next: string) => {
    window.history.pushState({}, '', next);
    setPath(next);
  };

  const handleRoleChange = (next: AppRole) => {
    setRole(next);
    navigate('/dashboard');
  };

  let body;
  if (path === '/dashboard') {
    body = <DashboardPage role={role} userName={user.fullName} />;
  } else {
    const meta = pageMeta(path);
    body = <PlaceholderPage title={meta.title} description={meta.description} />;
  }

  return (
    <AppShell
      role={role}
      userName={user.fullName}
      userEmail={user.email}
      currentPath={path}
      onNavigate={navigate}
      onRoleChange={handleRoleChange}
      backendOnline={backendOnline}
    >
      {body}
    </AppShell>
  );
}

export default App;
