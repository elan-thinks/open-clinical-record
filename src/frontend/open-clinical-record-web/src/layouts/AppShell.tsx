import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { AppRole } from '../types/auth';
import { getNavForRole, navIcon } from '../utils/navigation';
import { NavIcon } from './NavIcon';
import { useTheme } from '../context/ThemeContext';
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

const FLASH_SELECTOR =
  '.error-banner, .success-banner, .notice-banner, .dash-error, .login-error, .flash-banner, [role="alert"][data-flash], [data-flash="true"]';

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function scrollFlashIntoView(root: ParentNode) {
  const el = root.querySelector(FLASH_SELECTOR) as HTMLElement | null;
  if (!el) return;
  window.requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  });
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
  const contentRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => {
    if (path === '/dashboard') return currentPath === '/dashboard';
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  const navigate = (path: string) => {
    setMobileNavOpen(false);
    onNavigate(path);
  };

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    scrollFlashIntoView(root);

    const observer = new MutationObserver(() => {
      scrollFlashIntoView(root);
    });
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    return () => observer.disconnect();
  }, [currentPath, children]);

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
                  className={`nav-item${isActive(item.path) ? ' active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="nav-ico">
                    <NavIcon name={navIcon(item.path)} />
                  </span>
                  <span className="nav-text">{item.label}</span>
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
              <div className="user-role">{role === 'Doctor' ? 'Clinician' : role}</div>
            </div>
          </div>
          <div className="sidebar-foot-meta">
            <span className="status-chip">
              <span className={`status-dot${backendOnline ? '' : ' off'}`} />
              {backendOnline ? 'API online' : 'API offline'}
            </span>
            <div className="sidebar-icon-actions">
              <button
                type="button"
                className="sidebar-icon-btn"
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
              >
                {theme === 'dark' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3a7 7 0 0 0 11.5 11.5z" />
                  </svg>
                )}
              </button>
              {onLogout && (
                <button
                  type="button"
                  className="sidebar-icon-btn"
                  onClick={onLogout}
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
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
        <div className="shell-content" ref={contentRef}>
          {children}
        </div>
      </div>
    </div>
  );
}
