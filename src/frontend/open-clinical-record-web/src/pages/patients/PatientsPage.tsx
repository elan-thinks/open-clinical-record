import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  createPatient,
  listPatients,
  type Patient,
} from '../../services/patientsApi';
import '../admin/UsersPage.css';

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
    <div>
      <div className="admin-toolbar">
        <h2>Patients</h2>
        <button type="button" className="admin-btn" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'Register patient'}
        </button>
      </div>

      <form className="admin-form-row" onSubmit={onSearch} style={{ marginBottom: 14 }}>
        <input
          placeholder="Search name, MRN, phone, email\u2026"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            flex: 1,
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            padding: '10px 12px',
            color: 'var(--text)',
            fontSize: 13.5,
          }}
        />
        <button type="submit" className="admin-btn secondary">
          Search
        </button>
      </form>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-panel">
        {showForm && (
          <form className="admin-form" onSubmit={onCreate}>
            <div className="admin-form-row">
              <input
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="admin-form-row">
              <select value={sex} onChange={(e) => setSex(e.target.value)}>
                <option value="">Sex (optional)</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Unknown">Unknown</option>
              </select>
              <input
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button className="admin-btn" type="submit" disabled={saving}>
              {saving ? 'Saving\u2026' : 'Create patient'}
            </button>
          </form>
        )}

        {loading ? (
          <p style={{ padding: 16, color: 'var(--text-dim)' }}>Loading patients\u2026</p>
        ) : patients.length === 0 ? (
          <p style={{ padding: 16, color: 'var(--text-dim)' }}>No patients found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>MRN</th>
                <th>Name</th>
                <th>DOB</th>
                <th>Sex</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="badge b-role">{p.medicalRecordNumber}</span>
                  </td>
                  <td>
                    {p.lastName}, {p.firstName}
                  </td>
                  <td>{p.dateOfBirth ?? '\u2014'}</td>
                  <td>{p.sex ?? '\u2014'}</td>
                  <td>{p.phone ?? '\u2014'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="admin-note">
        MRN is assigned automatically (OCR-######). Chart and clinical modules will link to these
        records in later milestones.
      </p>
    </div>
  );
}
