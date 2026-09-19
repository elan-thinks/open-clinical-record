import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePasswordRequest, updateProfileRequest } from '../services/authApi';
import './ProfilePage.css';

export function ProfilePage() {
  const { user, primaryRole, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

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

  const displayName = fullName.trim() || user.fullName;
  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleHints: Record<string, string> = {
    Doctor: 'Clinical care — charts, consultations, diagnoses, and notes.',
    Nurse: 'Observations and vitals — support the care team at the bedside.',
    Receptionist: 'Front desk — registration, appointments, and check-in.',
    Admin: 'System administration — users, roles, reports, and audit.',
  };

  async function onSaveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    const name = fullName.trim();
    if (name.length < 2) {
      setProfileMsg({ type: 'err', text: 'Name must be at least 2 characters.' });
      return;
    }
    setProfileSaving(true);
    try {
      await updateProfileRequest(name);
      await refreshUser?.();
      setProfileMsg({ type: 'ok', text: 'Display name updated.' });
    } catch (err) {
      setProfileMsg({ type: 'err', text: err instanceof Error ? err.message : 'Update failed' });
    } finally {
      setProfileSaving(false);
    }
  }

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
      <p className="page-sub">Manage your account — available to every role.</p>

      {user.mustChangePassword && (
        <div className="profile-banner" role="status">
          <span className="banner-icon" aria-hidden>
            !
          </span>
          <div>
            <strong>Temporary password</strong>
            <p>Set a new password below so your account stays secure.</p>
          </div>
        </div>
      )}

      <div className="profile-card">
        <div className="profile-top">
          <div className="avatar">{initials || 'U'}</div>
          <div>
            <div className="name">{displayName}</div>
            <div className="email">{user.email}</div>
            <div className="role-badge">{primaryRole ?? user.roles[0] ?? 'User'}</div>
          </div>
        </div>

        <form className="profile-edit-form" onSubmit={onSaveProfile}>
          <h2 className="section-title">Account details</h2>
          <div className="info-grid editable">
            <label className="info-item">
              <span>Full name</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={2}
                maxLength={120}
                placeholder="Your display name"
              />
            </label>
            <div className="info-item">
              <label>Email</label>
              <div className="val">{user.email}</div>
              <span className="field-hint">Email is used for sign-in and cannot be changed here.</span>
            </div>
            <div className="info-item">
              <label>Roles</label>
              <div className="val role-chips">
                {user.roles.map((r) => (
                  <span key={r} className="mini-chip">
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div className="info-item">
              <label>User ID</label>
              <div className="val mono">{user.id}</div>
            </div>
          </div>

          {profileMsg && (
            <div className={`profile-alert ${profileMsg.type === 'ok' ? 'success' : 'error'}`} role="status">
              {profileMsg.text}
            </div>
          )}

          <div className="profile-form-actions">
            <button type="submit" className="pw-submit" disabled={profileSaving || fullName.trim() === user.fullName}>
              {profileSaving ? 'Saving…' : 'Save name'}
            </button>
          </div>
        </form>

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
            <p className="section-sub">Doctor, Nurse, Receptionist, and Admin can all update their own password.</p>
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
            <input
              type={showPw ? 'text' : 'password'}
              className="pw-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter current password"
            />
          </label>
          <label className="pw-label">
            New password
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
          </label>
          <label className="pw-label">
            Confirm new password
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
