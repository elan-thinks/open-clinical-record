import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPatients, type Patient, type PatientStatusFilter } from '../../services/patientsApi';
import './PatientsPage.css';
import { PageLoader } from '../../components/PageLoader';

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
  const [debouncedQ, setDebouncedQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PatientStatusFilter>('active');

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(q.trim()), 280);
    return () => window.clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPatients(await listPatients(debouncedQ || undefined, filter));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedQ]);

  useEffect(() => {
    void load();
  }, [load]);

  const countLabel = useMemo(() => {
    if (loading) return 'Searching…';
    return patients.length === 1 ? '1 patient' : `${patients.length} patients`;
  }, [loading, patients.length]);

  return (
    <div className="patients-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-sub">Search as you type · register · open records — {countLabel}</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/patients/new')}>
          + Register patient
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="toolbar">
        <div className="search-box">
          <input
            placeholder="Type name, MRN, or phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoComplete="off"
            aria-label="Search patients"
          />
          {q && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQ('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
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
      </div>

      <div className="panel">
        {loading ? (
          <PageLoader variant="skeleton" label="Loading patients…" rows={5} />
        ) : patients.length === 0 ? (
          <div className="empty">
            {debouncedQ
              ? `No patients match “${debouncedQ}”.`
              : 'No patients found. Register a patient to get started.'}
          </div>
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
