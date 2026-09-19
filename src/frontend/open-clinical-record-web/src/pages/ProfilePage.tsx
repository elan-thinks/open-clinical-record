import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePasswordRequest } from '../services/authApi';
import './ProfilePage.css';

export function ProfilePage() {
  const { user, primaryRole, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  async function onChangePassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    try {
      await changePasswordRequest(currentPassword, newPassword, confirmPassword);
      setSuccess('Password updated. Use your new password the next time you sign in.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await refreshUser?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <h1 className="page-title">Profile</h1>
      <p className="page-sub">Account details and security settings for this session.</p>

      {user.mustChangePassword && (
        <div className="profile-banner" role="status">
          <span className="banner-icon" aria-hidden>
            !
          </span>
          <div>
            <strong>Temporary password</strong>
            <p>Admin assigned a temporary password. Set a new one below so your account stays secure.</p>
          </div>
        </div>
      )}

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

      <div className="profile-card security-card">
        <div className="security-head">
          <div className="security-icon" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <div>
            <h2 className="section-title">Change password</h2>
            <p className="section-sub">
              Available for every role — Doctor, Nurse, Receptionist, and Admin.
            </p>
          </div>
        </div>

        {error && (
          <div className="profile-alert error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="profile-alert success" role="status">
            {success}
          </div>
        )}

        <form className="profile-pw-form" onSubmit={onChangePassword}>
          <label className="pw-label">
            Current password
            <div className="pw-field">
              <input
                type={showPw ? 'text' : 'password'}
                className="pw-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter current password"
              />
            </div>
          </label>
          <label className="pw-label">
            New password
            <div className="pw-field">
              <input
                type={showPw ? 'text' : 'password'}
                className="pw-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </div>
          </label>
          <label className="pw-label">
            Confirm new password
            <div className="pw-field">
              <input
                type={showPw ? 'text' : 'password'}
                className="pw-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repeat new password"
              />
            </div>
          </label>

          <div className="pw-form-footer">
            <button
              type="button"
              className={`pw-toggle${showPw ? ' on' : ''}`}
              onClick={() => setShowPw((v) => !v)}
              aria-pressed={showPw}
            >
              <span className="pw-toggle-track" aria-hidden>
                <span className="pw-toggle-thumb" />
              </span>
              {showPw ? 'Hide passwords' : 'Show passwords'}
            </button>

            <button type="submit" className="pw-submit" disabled={saving}>
              {saving ? 'Updating…' : 'Save new password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
