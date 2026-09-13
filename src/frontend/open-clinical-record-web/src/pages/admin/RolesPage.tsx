import { useCallback, useEffect, useState } from 'react';
import { listRoles, type RoleItem } from '../../services/usersApi';
import './UsersPage.css';

export function RolesPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRoles(await listRoles());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="admin-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Roles &amp; Permissions</h1>
          <p className="page-sub">Fixed MVP roles enforced by the API</p>
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-panel">
        {loading ? (
          <p style={{ padding: 16, color: 'var(--text-dim)' }}>Loading roles...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Users</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id}>
                  <td>
                    <span className="badge b-role">{r.name}</span>
                  </td>
                  <td>{r.userCount}</td>
                  <td style={{ color: 'var(--text-dim)' }}>{describeRole(r.name)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="admin-note">
        Roles are fixed for the MVP (Doctor, Nurse, Receptionist, Admin). Permissions are enforced
        by API policies.
      </p>
    </div>
  );
}

function describeRole(name: string): string {
  switch (name) {
    case 'Doctor':
      return 'Clinical chart, records, and appointments';
    case 'Nurse':
      return 'Vitals, chart support, appointments';
    case 'Receptionist':
      return 'Registration, check-in, appointments';
    case 'Admin':
      return 'Users, roles, audit, and system settings';
    default:
      return 'Application role';
  }
}
