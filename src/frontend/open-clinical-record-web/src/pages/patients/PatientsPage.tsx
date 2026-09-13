import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  createPatient,
  listPatients,
  type Patient,
} from '../../services/patientsApi';
import './PatientsPage.css';

function initials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function ageFromDob(dob?: string | null): string {
  if (!dob) return '\u2014';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return '\u2014';
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return String(age);
}

function sexAge(p: Patient): string {
  const sex = p.sex ? p.sex[0]?.toUpperCase() : '\u2014';
  const age = ageFromDob(p.dateOfBirth);
  return `${sex} \u00b7 ${age}`;
}

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const load = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      setPatients(await listPatients(search));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const countLabel = useMemo(() => {
    if (loading) return 'Loading\u2026';
    const n = patients.length;
    return n === 1 ? '1 patient' : `${n} patients`;
  }, [loading, patients.length]);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    await load(q);
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createPatient({
        firstName,
        lastName,
        dateOfBirth: dateOfBirth || undefined,
        sex: sex || undefined,
        phone: phone || undefined,
        email: email || undefined,
      });
      setShowForm(false);
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setSex('');
      setPhone('');
      setEmail('');
      await load(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="patients-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-sub">
            Search, register, and open patient records \u00b7 {countLabel}
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close form' : '+ Register patient'}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="panel form-panel">
          <div className="section-title">New patient registration</div>
          <form onSubmit={onCreate}>
            <div className="form-grid">
              <div className="field">
                <label className="label">
                  First name <span className="req">*</span>
                </label>
                <input
                  className="input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label className="label">
                  Last name <span className="req">*</span>
                </label>
                <input
                  className="input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label className="label">Date of birth</label>
                <input
                  className="input"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="label">Sex</label>
                <select className="select" value={sex} onChange={(e) => setSex(e.target.value)}>
                  <option value="">Select\u2026</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              <div className="field">
                <label className="label">Phone</label>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+251 \u2026"
                />
              </div>
              <div className="field">
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving\u2026' : 'Create patient'}
              </button>
            </div>
          </form>
        </div>
      )}

      <form className="toolbar" onSubmit={onSearch}>
        <div className="search-box">
          <span aria-hidden="true">\u2315</span>
          <input
            placeholder="Search name, MRN, phone, email\u2026"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          <button type="button" className="filter-pill active">
            Active
          </button>
        </div>
        <button type="submit" className="btn-ghost">
          Search
        </button>
      </form>

      <div className="panel">
        {loading ? (
          <div className="empty">Loading patients\u2026</div>
        ) : patients.length === 0 ? (
          <div className="empty">No patients found. Register a patient to get started.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Sex \u00b7 Age</th>
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
                  <td>{p.phone ?? '\u2014'}</td>
                  <td>
                    {p.createdAt
                      ? new Date(p.createdAt).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '\u2014'}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        p.isActive ? 'status-active' : 'status-inactive'
                      }`}
                    >
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="action-link" disabled title="Coming soon">
                      Open chart
                    </button>
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
