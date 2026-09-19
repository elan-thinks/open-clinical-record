import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import type { AppRole } from '../../types/auth';
import {
  createUser,
  listUsers,
  resetUserPassword,
  setUserActive,
  updateUserProfile,
  updateUserRoles,
  type UserListItem,
} from '../../services/usersApi';
import './UsersPage.css';

const ALL_ROLES: AppRole[] = ['Doctor', 'Nurse', 'Receptionist', 'Admin'];

export function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<AppRole[]>(['Doctor']);
  const [saving, setSaving] = useState(false);

  const [editUser, setEditUser] = useState<UserListItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editRoles, setEditRoles] = useState<AppRole[]>([]);
  const [tempPassword, setTempPassword] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.roles.some((r) => r.toLowerCase().includes(term)),
    );
  }, [users, q]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await createUser({ email, fullName, password, roles });
      setShowForm(false);
      setEmail('');
      setFullName('');
      setPassword('');
      setRoles(['Doctor']);
      setSuccess('User created. They must change the temporary password on first sign-in.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user: UserListItem) {
    setError(null);
    setSuccess(null);
    try {
      await setUserActive(user.id, !user.isActive);
      setSuccess(user.isActive ? `${user.fullName} deactivated.` : `${user.fullName} activated.`);
      await load();
      if (editUser?.id === user.id) {
        setEditUser({ ...user, isActive: !user.isActive });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  function openEdit(user: UserListItem) {
    setEditUser(user);
    setEditName(user.fullName);
    setEditRoles(user.roles.filter((r): r is AppRole => ALL_ROLES.includes(r as AppRole)));
    setTempPassword('');
    setError(null);
    setSuccess(null);
  }

  function toggleRole(role: AppRole, forEdit = false) {
    if (forEdit) {
      setEditRoles((prev) =>
        prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
      );
    } else {
      setRoles((prev) =>
        prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
      );
    }
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setEditSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editName.trim() !== editUser.fullName) {
        await updateUserProfile(editUser.id, editName.trim());
      }
      const sameRoles =
        editRoles.length === editUser.roles.length &&
        editRoles.every((r) => editUser.roles.includes(r));
      if (!sameRoles) {
        if (editRoles.length === 0) throw new Error('At least one role is required.');
        await updateUserRoles(editUser.id, editRoles);
      }
      if (tempPassword.trim().length >= 8) {
        await resetUserPassword(editUser.id, tempPassword.trim());
      }
      setSuccess(`Updated ${editName.trim() || editUser.fullName}.`);
      setTempPassword('');
      await load();
      const refreshed = (await listUsers()).find((u) => u.id === editUser.id);
      if (refreshed) openEdit(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setEditSaving(false);
    }
  }

  return (
    <div className="admin-page users-manage">
      <div className="page-head">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-sub">Search, create, edit roles, reset passwords, activate accounts</p>
        </div>
        <button type="button" className="admin-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add user'}
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {success && <p className="admin-success">{success}</p>}

      <div className="users-toolbar">
        <div className="users-search">
          <input
            placeholder="Filter by name, email, or role…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
          />
        </div>
        <span className="users-count">
          {loading ? 'Loading…' : `${filtered.length} of ${users.length}`}
        </span>
      </div>

      <div className="admin-panel">
        {showForm && (
          <form className="admin-form" onSubmit={onCreate}>
            <div className="admin-form-row">
              <input
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Temporary password (min 8)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="role-checks">
              {ALL_ROLES.map((role) => (
                <label key={role}>
                  <input
                    type="checkbox"
                    checked={roles.includes(role)}
                    onChange={() => toggleRole(role)}
                  />
                  {role}
                </label>
              ))}
            </div>
            <button className="admin-btn" type="submit" disabled={saving || roles.length === 0}>
              {saving ? 'Saving…' : 'Create user'}
            </button>
          </form>
        )}

        {loading ? (
          <p style={{ padding: 16, color: 'var(--text-dim)' }}>Loading users…</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: 16, color: 'var(--text-faint)' }}>No users match your filter.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={editUser?.id === u.id ? 'row-active' : undefined}>
                  <td>
                    <b>{u.fullName}</b>
                    <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{u.email}</div>
                  </td>
                  <td>
                    {u.roles.map((r) => (
                      <span key={r} className="badge b-role">
                        {r}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'b-ok' : 'b-off'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="admin-actions">
                    <button type="button" onClick={() => openEdit(u)}>
                      Manage
                    </button>
                    <button type="button" onClick={() => void toggleActive(u)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editUser && (
        <div className="user-drawer panel">
          <div className="drawer-head">
            <div>
              <h2 className="panel-title">Manage {editUser.fullName}</h2>
              <p className="page-sub">{editUser.email}</p>
            </div>
            <button type="button" className="btn-ghost" onClick={() => setEditUser(null)}>
              Close
            </button>
          </div>

          <form className="drawer-form" onSubmit={saveEdit}>
            <label>
              Display name
              <input value={editName} onChange={(e) => setEditName(e.target.value)} required minLength={2} />
            </label>

            <div>
              <div className="drawer-label">Roles</div>
              <div className="role-checks">
                {ALL_ROLES.map((role) => (
                  <label key={role}>
                    <input
                      type="checkbox"
                      checked={editRoles.includes(role)}
                      onChange={() => toggleRole(role, true)}
                    />
                    {role}
                  </label>
                ))}
              </div>
            </div>

            <label>
              Set temporary password (optional)
              <input
                type="password"
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                minLength={8}
                placeholder="Leave blank to keep current password"
              />
              <span className="field-hint">If set, user must change password on next login.</span>
            </label>

            <div className="drawer-actions">
              <button type="submit" className="admin-btn" disabled={editSaving || editRoles.length === 0}>
                {editSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      <p className="admin-note">
        Only administrators can manage users. Deactivated users cannot sign in. Self-service name and
        password changes are on each user&apos;s Profile page.
      </p>
    </div>
  );
}
