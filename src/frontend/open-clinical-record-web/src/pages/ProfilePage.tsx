import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePasswordRequest, updateProfileRequest } from '../services/authApi';
import './ProfilePage.css';

export function ProfilePage() {
  const { user, primaryRole, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [editingProfile, setEditingProfile] = useState(false);
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
      setProfileMsg({ type: 'ok', text: 'Profile updated successfully.' });
      setEditingProfile(false);
    } catch (err) {
      setProfileMsg({ type: 'err', text: err instanceof Error ? err.message : 'Update failed' });
    } finally {
      setProfileSaving(false);
    }
  }

  function onCancelProfile() {
    setFullName(user.fullName ?? '');
    setProfileMsg(null);
    setEditingProfile(false);
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
      setSuccess('Password updated successfully.');
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
          <h1 className="page-title">Profile</h1>
          <p className="page-sub">Manage your personal information and account security.</p>
        </div>
      </div>

      {user.mustChangePassword && (
        <div className="profile-banner" role="status">
          <span className="banner-icon" aria-hidden>!</span>
          <div>
            <strong>Password change required</strong>
            <p>You are using a temporary password. Please change it in the Security section below.</p>
          </div>
        </div>
      )}

      <section className="profile-card">
        <div className="profile-card-head">
          <div className="profile-card-title">
            <h2>Personal information</h2>
            <p>Update the information shown across Open Clinical Record.</p>
          </div>
          {!editingProfile && (
            <button type="button" className="btn-secondary" onClick={() => setEditingProfile(true)}>
              Edit profile
            </button>
          )}
        </div>

        <div className="identity-row">
          <div className="avatar-lg" aria-hidden>{initials || 'U'}</div>
          <div className="identity-meta">
            <div className="p-name">{displayName}</div>
            <div className="p-role">
              <span className="role-pill">{roleLabel}</span>
              <span className="status-live"><span className="role-dot" aria-hidden />Active</span>
            </div>
          </div>
        </div>

        <form className="profile-form" onSubmit={onSaveProfile}>
          <div className="profile-fields">
            <div className="field">
              <label className="label" htmlFor="profile-name">Full name</label>
              {editingProfile ? (
                <input
                  id="profile-name"
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                  autoFocus
                />
              ) : (
                <div className="field-value">{user.fullName}</div>
              )}
            </div>

            <div className="field">
              <label className="label" htmlFor="profile-email">Email address</label>
              <div id="profile-email" className="field-value muted">{user.email}</div>
              <span className="field-hint">Your sign-in email. Contact an administrator if it needs to be changed.</span>
            </div>

            <div className="field">
              <label className="label">Role</label>
              <div className="field-value">{user.roles.join(' · ') || roleLabel}</div>
            </div>

            <div className="field">
              <label className="label">Account ID</label>
              <div className="field-value mono" title={user.id}>{user.id.slice(0, 8)}…</div>
            </div>
          </div>

          {profileMsg && (
            <div className={`profile-alert ${profileMsg.type === 'ok' ? 'success' : 'error'}`} role="status">
              {profileMsg.text}
            </div>
          )}

          {editingProfile && (
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onCancelProfile}>Cancel</button>
              <button
                type="submit"
                className="btn-primary"
                disabled={profileSaving || fullName.trim() === (user.fullName ?? '').trim()}
              >
                {profileSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          )}
        </form>
      </section>

      <section className="profile-card security-card">
        <div className="profile-card-head">
          <div className="profile-card-title">
            <h2>Security</h2>
            <p>Keep your account secure by using a strong, private password.</p>
          </div>
        </div>

        <form className="profile-form" onSubmit={onChangePassword}>
          <div className="password-section">
            <div className="field">
              <label className="label" htmlFor="pw-current">Current password</label>
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

            <div className="field-row">
              <div className="field">
                <label className="label" htmlFor="pw-new">New password</label>
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
                <label className="label" htmlFor="pw-confirm">Confirm new password</label>
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
          </div>

          {error && <div className="profile-alert error" role="alert">{error}</div>}
          {success && <div className="profile-alert success" role="status">{success}</div>}

          <div className="form-actions security-actions">
            <button
              type="button"
              className={`pw-show${showPw ? ' on' : ''}`}
              onClick={() => setShowPw((v) => !v)}
              aria-pressed={showPw}
            >
              {showPw ? 'Hide passwords' : 'Show passwords'}
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Updating…' : 'Change password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
