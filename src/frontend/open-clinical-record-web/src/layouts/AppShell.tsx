import type { ReactNode } from 'react';
import type { AppRole } from '../types/auth';
import { getNavForRole, navIcon } from '../utils/navigation';
import { NavIcon } from './NavIcon';
import './AppShell.css';

interface AppShellProps {
  role: AppRole;
  userName: string;
  userEmail?: string;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout?: () => void;
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

export function AppShell({
  role,
  userName,
  currentPath,
  onNavigate,
  onLogout,
  backendOnline = true,
  children,
}: AppShellProps) {
  const groups = getNavForRole(role);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
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
                  <span className="nav-ico">
                    <NavIcon name={navIcon(item.path)} />
                  </span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="user-row">
            <div className="user-av">{initials(userName) || 'U'}</div>
            <div>
              <div className="user-name">{userName}</div>
              <div className="user-role">{role === 'Doctor' ? 'Clinician' : role}</div>
            </div>
          </div>
          <span className="status-chip">
            <span className={`status-dot${backendOnline ? '' : ' off'}`} />
            {backendOnline ? 'API online' : 'API offline'}
          </span>
          {onLogout && (
            <button type="button" className="logout-btn" onClick={onLogout}>
              Sign out
            </button>
          )}
        </div>
      </aside>

      <div className="shell-main">
        <div className="shell-content">{children}</div>
      </div>
    </div>
  );
}
