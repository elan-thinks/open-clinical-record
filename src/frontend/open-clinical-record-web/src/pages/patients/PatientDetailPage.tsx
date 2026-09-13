import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPatient, updatePatient, type Patient } from '../../services/patientsApi';
import './PatientDetailPage.css';

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

function formatDob(dob?: string | null): string {
  if (!dob) return '-';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return dob;
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [sex, setSex] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const p = await getPatient(id);
      setPatient(p);
      setFirstName(p.firstName);
      setLastName(p.lastName);
      setDateOfBirth(p.dateOfBirth ? p.dateOfBirth.slice(0, 10) : '');
      setSex(p.sex ?? '');
      setPhone(p.phone ?? '');
      setEmail(p.email ?? '');
      setIsActive(p.isActive);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patient');
      setPatient(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const metaLine = useMemo(() => {
    if (!patient) return '';
    const age = ageFromDob(patient.dateOfBirth);
    const parts = [
      patient.medicalRecordNumber,
      patient.sex ?? '-',
      age !== null ? `${age} yrs` : '-',
      `Registered ${formatDob(patient.createdAt)}`,
    ];
    return parts.join(' \u00b7 ');
  }, [patient]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updatePatient(id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth || undefined,
        sex: sex || undefined,
        phone: phone || undefined,
        email: email || undefined,
        isActive,
      });
      setPatient(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="patient-detail">
        <div className="empty">Loading patient...</div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-detail">
        {error && <div className="error-banner">{error}</div>}
        <button type="button" className="back" onClick={() => navigate('/patients')}>
          \u2190 Patient list
        </button>
        <div className="empty">Patient not found.</div>
      </div>
    );
  }

  return (
    <div className="patient-detail">
      <button type="button" className="back" onClick={() => navigate('/patients')}>
        \u2190 Patient list
      </button>

      <div className="header">
        <div>
          <div className="name">
            {patient.firstName} {patient.lastName}
            <span className={`badge${patient.isActive ? '' : ' off'}`}>
              {patient.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="meta">{metaLine}</div>
        </div>
        <div className="btn-row">
          {!editing && (
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>
              Edit contact
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="lock-note">
        <b>Patient profile</b> \u2014 Demographics and contact only. Clinical chart and appointments
        modules will link here in later milestones.
      </div>

      {!editing ? (
        <div className="panel">
          <div className="panel-title">Identity &amp; contact</div>
          <div className="grid">
            <div className="field">
              <label>Full name</label>
              <div className="val">
                {patient.firstName} {patient.lastName}
              </div>
            </div>
            <div className="field">
              <label>Patient ID</label>
              <div className="val">{patient.medicalRecordNumber}</div>
            </div>
            <div className="field">
              <label>Date of birth</label>
              <div className="val">{formatDob(patient.dateOfBirth)}</div>
            </div>
            <div className="field">
              <label>Sex</label>
              <div className="val">{patient.sex ?? '-'}</div>
            </div>
            <div className="field">
              <label>Phone</label>
              <div className="val">{patient.phone ?? '-'}</div>
            </div>
            <div className="field">
              <label>Email</label>
              <div className="val">{patient.email ?? '-'}</div>
            </div>
            <div className="field">
              <label>Status</label>
              <div className="val">{patient.isActive ? 'Active' : 'Inactive'}</div>
            </div>
            <div className="field">
              <label>Registered</label>
              <div className="val">{formatDob(patient.createdAt)}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="panel">
          <div className="panel-title">Edit contact</div>
          <form onSubmit={onSave}>
            <div className="form-grid">
              <div className="field">
                <label>First name *</label>
                <input
                  className="input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>Last name *</label>
                <input
                  className="input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label>Date of birth</label>
                <input
                  className="input"
                  type="date"
                  value={dateOfBirth}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Sex</label>
                <select className="select" value={sex} onChange={(e) => setSex(e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              <div className="field">
                <label>Phone</label>
                <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Status</label>
                <select
                  className="select"
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setEditing(false);
                  setError(null);
                  void load();
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
