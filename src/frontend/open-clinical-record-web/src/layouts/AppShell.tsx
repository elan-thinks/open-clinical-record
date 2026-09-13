import type { ReactNode } from 'react';
import type { AppRole } from '../types/auth';
import { getNavForRole } from '../utils/navigation';
import './AppShell.css';

interface AppShellProps {
  role: AppRole;
  userName: string;
  userEmail?: string;
  currentPath: string;
  onNavigate: (path: string) => void;
  onRoleChange?: (role: AppRole) => void;
  backendOnline?: boolean;
  children: ReactNode;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function titleFromPath(path: string): string {
  const map: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/patients': 'Patients',
    '/chart': 'Medical Chart',
    '/records': 'Medical Records',
    '/appointments': 'Appointments',
    '/vitals': 'Record vitals',
    '/register': 'Registration',
    '/checkin': 'Check-in / Queue',
    '/reports': 'Reports',
    '/profile': 'Profile',
    '/admin/users': 'Users',
    '/admin/roles': 'Roles & Permissions',
    '/admin/audit': 'Audit Logs',
  };
  return map[path] ?? 'Open Clinical Record';
}

const DEMO_ROLES: AppRole[] = ['Doctor', 'Nurse', 'Receptionist', 'Admin'];

export function AppShell({
  role,
  userName,
  currentPath,
  onNavigate,
  onRoleChange,
  backendOnline = true,
  children,
}: AppShellProps) {
  const groups = getNavForRole(role);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">OCR</div>
          <div>
            <div className="brand-name">Open Clinical Record</div>
            <div className="brand-sub">Outpatient EMR</div>
          </div>
        </div>

        <nav className="nav" aria-label="Main">
          {groups.map((group) => (
            <div key={group.label} className="nav-group">
              <div className="nav-label">{group.label}</div>
              {group.items.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className={`nav-item${currentPath === item.path ? ' active' : ''}`}
                  onClick={() => onNavigate(item.path)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="user-row">
            <div className="user-av">{initials(userName) || 'U'}</div>
            <div className="user-meta">
              <div className="user-name">{userName}</div>
              <div className="user-role">{role}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <h1 className="topbar-title">{titleFromPath(currentPath)}</h1>
          <div className="topbar-actions">
            {onRoleChange &&
              DEMO_ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`role-pill${role === r ? ' active' : ''}`}
                  onClick={() => onRoleChange(r)}
                >
                  {r}
                </button>
              ))}
            <span className="status-chip">
              <span className={`status-dot${backendOnline ? '' : ' off'}`} />
              {backendOnline ? 'API online' : 'API offline'}
            </span>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
