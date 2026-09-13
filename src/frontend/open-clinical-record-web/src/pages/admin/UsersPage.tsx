import { useCallback, useEffect, useState, type FormEvent } from 'react';
import type { AppRole } from '../../types/auth';
import {
  createUser,
  listUsers,
  setUserActive,
  type UserListItem,
} from '../../services/usersApi';
import './UsersPage.css';

const ALL_ROLES: AppRole[] = ['Doctor', 'Nurse', 'Receptionist', 'Admin'];

export function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<AppRole[]>(['Doctor']);
  const [saving, setSaving] = useState(false);

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

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createUser({ email, fullName, password, roles });
      setShowForm(false);
      setEmail('');
      setFullName('');
      setPassword('');
      setRoles(['Doctor']);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user: UserListItem) {
    setError(null);
    try {
      await setUserActive(user.id, !user.isActive);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  }

  function toggleRole(role: AppRole) {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  }

  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-sub">Manage application accounts and role assignment</p>
        </div>
        <button type="button" className="admin-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add user'}
        </button>
      </div>

      {error && <p className="admin-error">{error}</p>}

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
                placeholder="Temporary password"
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
              {saving ? 'Saving...' : 'Create user'}
            </button>
          </form>
        )}

        {loading ? (
          <p style={{ padding: 16, color: 'var(--text-dim)' }}>Loading users...</p>
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
              {users.map((u) => (
                <tr key={u.id}>
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

      <p className="admin-note">
        Only administrators can manage users. Deactivated users cannot sign in.
      </p>
    </div>
  );
}
