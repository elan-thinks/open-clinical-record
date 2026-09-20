import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePasswordRequest, updateProfileRequest } from '../services/authApi';
import './ProfilePage.css';

type SettingsTab = 'account' | 'security';

export function ProfilePage() {
  const { user, primaryRole, refreshUser } = useAuth();
  const [tab, setTab] = useState<SettingsTab>(() =>
    user?.mustChangePassword ? 'security' : 'account',
  );
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
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Your account and security for Open Clinical Record.</p>
        </div>
      </div>

      {user.mustChangePassword && (
        <div className="profile-banner" role="status">
          <span className="banner-icon" aria-hidden>
            !
          </span>
          <div>
            <strong>Temporary password in use</strong>
            <p>
              Open the{' '}
              <button type="button" className="banner-link" onClick={() => setTab('security')}>
                Security
              </button>{' '}
              tab and set a new password.
            </p>
          </div>
        </div>
      )}

      <section className="profile-hero">
        <div className="avatar-lg" aria-hidden>
          {initials || 'U'}
        </div>
        <div className="hero-meta">
          <div className="p-name">{displayName}</div>
          <div className="p-role">
            <span className="role-pill">{roleLabel}</span>
            <span className="status-live">
              <span className="role-dot" aria-hidden />
              Active
            </span>
          </div>
          <div className="hero-email">{user.email}</div>
        </div>
      </section>

      <div className="settings-shell">
        <div className="settings-tabs" role="tablist" aria-label="Profile settings">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'account'}
            className={`settings-tab${tab === 'account' ? ' active' : ''}`}
            onClick={() => setTab('account')}
          >
            Account
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'security'}
            className={`settings-tab${tab === 'security' ? ' active' : ''}`}
            onClick={() => setTab('security')}
          >
            Security
            {user.mustChangePassword && <span className="tab-badge">Required</span>}
          </button>
        </div>

        <div className="settings-body" role="tabpanel">
          {tab === 'account' ? (
            <>
              <div className="settings-intro">
                <h2 className="settings-title">Account</h2>
                <p className="settings-desc">How your name appears across charts and appointments.</p>
              </div>

              <div className="info-grid compact">
                <div className="info-item">
                  <label>Roles</label>
                  <div className="val">{user.roles.join(' · ') || roleLabel}</div>
                </div>
                <div className="info-item">
                  <label>Account ID</label>
                  <div className="val mono" title={user.id}>
                    {user.id.slice(0, 8)}…
                  </div>
                </div>
              </div>

              {primaryRole && (
                <p className="role-hint">{roleHints[primaryRole] ?? 'Signed in to Open Clinical Record.'}</p>
              )}

              <form className="profile-form" onSubmit={onSaveProfile}>
                <div className="form-stack">
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
                    <input
                      id="profile-email"
                      className="input"
                      value={user.email}
                      disabled
                      readOnly
                      title="Email is used for sign-in"
                    />
                    <span className="field-hint">Sign-in email — ask an admin if you need this changed.</span>
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
            </>
          ) : (
            <>
              <div className="settings-intro">
                <h2 className="settings-title">Security</h2>
                <p className="settings-desc">Update your password. Minimum 8 characters.</p>
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

              <form className="profile-form" onSubmit={onChangePassword}>
                <div className="form-stack">
                  <div className="field">
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
                  <div className="field-row">
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
                        Confirm
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
                    {showPw ? 'Hide' : 'Show'} passwords
                  </button>
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Updating…' : 'Update password'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
