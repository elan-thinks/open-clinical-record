import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPatients, type Patient, type PatientStatusFilter } from '../../services/patientsApi';
import './PatientsPage.css';

function initials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}
function ageFromDob(dob?: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 ? age : null;
}
function sexAge(p: Patient): string {
  const sex = p.sex ? p.sex[0]?.toUpperCase() : '-';
  const age = ageFromDob(p.dateOfBirth);
  return age === null ? `${sex} / -` : `${sex} / ${age}`;
}

export function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PatientStatusFilter>('active');

  const load = useCallback(
    async (search?: string) => {
      setLoading(true);
      setError(null);
      try {
        setPatients(await listPatients(search, filter));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load patients');
      } finally {
        setLoading(false);
      }
    },
    [filter],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const countLabel = useMemo(() => {
    if (loading) return 'Loading...';
    return patients.length === 1 ? '1 patient' : `${patients.length} patients`;
  }, [loading, patients.length]);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    await load(q);
  }

  return (
    <div className="patients-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-sub">Search, register, and open patient records - {countLabel}</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/patients/new')}>
          + Register patient
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="toolbar" onSubmit={onSearch}>
        <div className="search-box">
          <input
            placeholder="Search by name, ID, phone..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {(
            [
              ['all', 'All'],
              ['active', 'Active'],
              ['inactive', 'Inactive'],
              ['deceased', 'Deceased'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`filter-pill${filter === key ? ' active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="submit" className="btn-ghost">
          Search
        </button>
      </form>

      <div className="panel">
        {loading ? (
          <div className="empty">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="empty">No patients found. Register a patient to get started.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Sex / Age</th>
                <th>Phone</th>
                <th>Registered</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="patient-cell">
                      <div className="avatar">{initials(p.firstName, p.lastName)}</div>
                      <div>
                        <div className="p-name">
                          {p.firstName} {p.lastName}
                        </div>
                        <div className="p-id">{p.medicalRecordNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td>{sexAge(p)}</td>
                  <td>{p.phone || '-'}</td>
                  <td>
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '-'}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        p.status === 'Deceased'
                          ? 'status-inactive'
                          : p.isActive
                            ? 'status-active'
                            : 'status-inactive'
                      }`}
                    >
                      {p.status || (p.isActive ? 'Active' : 'Inactive')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="action-link"
                        onClick={() => navigate(`/patients/${p.id}`)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="action-link"
                        onClick={() => navigate(`/patients/${p.id}/chart`)}
                      >
                        Chart
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
