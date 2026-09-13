import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  createPatient,
  listPatients,
  type Patient,
} from '../../services/patientsApi';
import './PatientsPage.css';

const PHONE_COUNTRIES = [
  { code: 'ET', dial: '+251', label: 'Ethiopia (+251)' },
  { code: 'US', dial: '+1', label: 'United States (+1)' },
  { code: 'GB', dial: '+44', label: 'United Kingdom (+44)' },
  { code: 'KE', dial: '+254', label: 'Kenya (+254)' },
  { code: 'UG', dial: '+256', label: 'Uganda (+256)' },
  { code: 'TZ', dial: '+255', label: 'Tanzania (+255)' },
  { code: 'SO', dial: '+252', label: 'Somalia (+252)' },
  { code: 'DJ', dial: '+253', label: 'Djibouti (+253)' },
  { code: 'ER', dial: '+291', label: 'Eritrea (+291)' },
  { code: 'OTHER', dial: '', label: 'Other (enter full number)' },
] as const;

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

function formatPhone(raw?: string | null): string {
  if (!raw) return '-';
  return raw;
}

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('ET');
  const [phoneLocal, setPhoneLocal] = useState('');
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

  const filtered = useMemo(() => {
    if (filter === 'active') return patients.filter((p) => p.isActive);
    if (filter === 'inactive') return patients.filter((p) => !p.isActive);
    return patients;
  }, [patients, filter]);

  const computedAge = useMemo(() => ageFromDob(dateOfBirth || null), [dateOfBirth]);

  const countLabel = useMemo(() => {
    if (loading) return 'Loading...';
    const n = filtered.length;
    return n === 1 ? '1 patient' : `${n} patients`;
  }, [loading, filtered.length]);

  function buildPhone(): string | undefined {
    const local = phoneLocal.trim().replace(/^0+/, '');
    if (!local && !phoneLocal.trim()) return undefined;
    const country = PHONE_COUNTRIES.find((c) => c.code === phoneCountry);
    if (!country || country.code === 'OTHER' || !country.dial) {
      return phoneLocal.trim() || undefined;
    }
    return `${country.dial} ${local || phoneLocal.trim()}`;
  }

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
        phone: buildPhone(),
        email: email || undefined,
      });
      setShowForm(false);
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setSex('');
      setPhoneCountry('ET');
      setPhoneLocal('');
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
            Search, register, and open patient records - {countLabel}
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
                  max={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div className="field">
                <label className="label">Age (from DOB)</label>
                <input
                  className="input"
                  value={
                    computedAge === null
                      ? 'Enter date of birth'
                      : `${computedAge} years`
                  }
                  readOnly
                  tabIndex={-1}
                />
              </div>
              <div className="field">
                <label className="label">Sex</label>
                <select className="select" value={sex} onChange={(e) => setSex(e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              <div className="field span-2">
                <label className="label">Phone</label>
                <div className="phone-row">
                  <select
                    className="select phone-country"
                    value={phoneCountry}
                    onChange={(e) => setPhoneCountry(e.target.value)}
                    aria-label="Country code"
                  >
                    {PHONE_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input phone-local"
                    value={phoneLocal}
                    onChange={(e) => setPhoneLocal(e.target.value)}
                    placeholder={phoneCountry === 'ET' ? '9xx xxx xxx' : 'Local number'}
                    inputMode="tel"
                  />
                </div>
              </div>
              <div className="field span-2">
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
                {saving ? 'Saving...' : 'Create patient'}
              </button>
            </div>
          </form>
        </div>
      )}

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
        ) : filtered.length === 0 ? (
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
              {filtered.map((p) => (
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
                  <td>{formatPhone(p.phone)}</td>
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
