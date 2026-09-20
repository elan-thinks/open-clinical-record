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
        <div className="profile-empty">Not signed in.</div>
      </div>
    );
  }

  const displayName = fullName.trim() || user.fullName;
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = primaryRole ?? user.roles[0] ?? 'User';
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
      <div className="page-head">
        <div>
          <h1 className="page-title">User profile</h1>
          <p className="page-sub">Account details, role, and password for your OCR login.</p>
        </div>
      </div>

      {user.mustChangePassword && (
        <div className="profile-banner" role="status">
          <span className="banner-icon" aria-hidden>
            !
          </span>
          <div>
            <strong>Temporary password in use</strong>
            <p>Set a new password in the security section below before continuing clinical work.</p>
          </div>
        </div>
      )}

      <section className="profile-panel">
        <div className="profile-head">
          <div className="avatar-lg" aria-hidden>
            {initials || 'U'}
          </div>
          <div>
            <div className="p-name">{displayName}</div>
            <div className="p-role">
              {roleLabel}
              <span className="role-dot" aria-hidden />
              Active
            </div>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <label>Email</label>
            <div className="val">{user.email}</div>
          </div>
          <div className="info-item">
            <label>Role</label>
            <div className="val">{user.roles.join(' · ') || roleLabel}</div>
          </div>
          <div className="info-item">
            <label>Display name</label>
            <div className="val">{user.fullName}</div>
          </div>
          <div className="info-item">
            <label>Account</label>
            <div className="val mono" title={user.id}>
              {user.id.slice(0, 8)}…
            </div>
          </div>
        </div>

        {primaryRole && <p className="role-hint">{roleHints[primaryRole] ?? 'Signed in to Open Clinical Record.'}</p>}
      </section>

      <section className="profile-panel">
        <h2 className="section-title">Update profile</h2>
        <form className="profile-form" onSubmit={onSaveProfile}>
          <div className="form-grid">
            <div className="field">
              <label className="label" htmlFor="profile-name">
                Display name
              </label>
              <input
                id="profile-name"
                className="input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={2}
                maxLength={120}
                placeholder="Your name as shown in the app"
                autoComplete="name"
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="profile-email">
                Email
              </label>
              <input id="profile-email" className="input" value={user.email} disabled readOnly title="Email is used for sign-in" />
              <span className="field-hint">Used for sign-in — contact an admin to change it.</span>
            </div>
          </div>

          {profileMsg && (
            <div className={`profile-alert ${profileMsg.type === 'ok' ? 'success' : 'error'}`} role="status">
              {profileMsg.text}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={profileSaving || fullName.trim() === (user.fullName ?? '').trim()}
            >
              {profileSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      <section className="profile-panel">
        <h2 className="section-title">Change password</h2>
        <p className="section-lead">All roles can update their own password. Use at least 8 characters.</p>

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

        <form className="profile-form" onSubmit={onChangePassword}>
          <div className="form-grid pw-grid">
            <div className="field span-2">
              <label className="label" htmlFor="pw-current">
                Current password
              </label>
              <input
                id="pw-current"
                className="input"
                type={showPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Enter current password"
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="pw-new">
                New password
              </label>
              <input
                id="pw-new"
                className="input"
                type={showPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="pw-confirm">
                Confirm new password
              </label>
              <input
                id="pw-confirm"
                className="input"
                type={showPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Repeat new password"
              />
            </div>
          </div>

          <div className="form-actions pw-actions">
            <button
              type="button"
              className={`pw-show${showPw ? ' on' : ''}`}
              onClick={() => setShowPw((v) => !v)}
              aria-pressed={showPw}
            >
              <span className="pw-show-track" aria-hidden>
                <span className="pw-show-thumb" />
              </span>
              {showPw ? 'Hide passwords' : 'Show passwords'}
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Updating…' : 'Save new password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
