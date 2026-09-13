import { useState, type ReactNode } from 'react';
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navigate = (path: string) => {
    setMobileNavOpen(false);
    onNavigate(path);
  };

  return (
    <div className="shell">
      <button
        type="button"
        className={`mobile-menu-backdrop${mobileNavOpen ? ' open' : ''}`}
        aria-label="Close navigation"
        onClick={() => setMobileNavOpen(false)}
      />

      <aside className={`sidebar${mobileNavOpen ? ' mobile-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">OCR</div>
          <div>
            <div className="brand-name">Open Clinical Record</div>
            <div className="brand-sub">Outpatient EMR</div>
          </div>
          <button
            type="button"
            className="mobile-close"
            aria-label="Close navigation"
            onClick={() => setMobileNavOpen(false)}
          >
            ×
          </button>
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
                  onClick={() => navigate(item.path)}
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
        <header className="mobile-header">
          <button
            type="button"
            className="mobile-menu-btn"
            aria-label="Open navigation"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="mobile-brand">
            <div className="brand-mark">OCR</div>
            <div>
              <div className="brand-name">Open Clinical Record</div>
              <div className="brand-sub">Outpatient EMR</div>
            </div>
          </div>
          <div className="mobile-user-av">{initials(userName) || 'U'}</div>
        </header>

        <div className="shell-content">{children}</div>
      </div>
    </div>
  );
}
