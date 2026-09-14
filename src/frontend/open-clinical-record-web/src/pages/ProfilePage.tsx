import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

export function ProfilePage() {
  const { user, primaryRole } = useAuth();

  if (!user) {
    return (
      <div className="profile-page">
        <div className="empty">Not signed in.</div>
      </div>
    );
  }

  const initials = user.fullName
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleHints: Record<string, string> = {
    Doctor: 'Clinical care — charts, consultations, diagnoses, and notes.',
    Nurse: 'Observations and vitals — support the care team at the bedside.',
    Receptionist: 'Front desk — registration, appointments, and check-in.',
    Admin: 'System administration — users, roles, and configuration.',
  };

  return (
    <div className="profile-page">
      <h1 className="page-title">Profile</h1>
      <p className="page-sub">Your account details for this session.</p>

      <div className="profile-card">
        <div className="profile-top">
          <div className="avatar">{initials || 'U'}</div>
          <div>
            <div className="name">{user.fullName}</div>
            <div className="email">{user.email}</div>
            <div className="role-badge">{primaryRole ?? user.roles[0] ?? 'User'}</div>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <label>Full name</label>
            <div className="val">{user.fullName}</div>
          </div>
          <div className="info-item">
            <label>Email</label>
            <div className="val">{user.email}</div>
          </div>
          <div className="info-item">
            <label>User ID</label>
            <div className="val mono">{user.id}</div>
          </div>
          <div className="info-item">
            <label>Roles</label>
            <div className="val">{user.roles.join(', ') || '—'}</div>
          </div>
        </div>

        {primaryRole && (
          <p className="hint">{roleHints[primaryRole] ?? 'Signed in to Open Clinical Record.'}</p>
        )}
      </div>
    </div>
  );
}
