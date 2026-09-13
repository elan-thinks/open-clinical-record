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

function formatDate(value?: string | null): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
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
  const [status, setStatus] = useState('Active');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Addis Ababa');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('Amharic');
  const [insuranceScheme, setInsuranceScheme] = useState('');
  const [notes, setNotes] = useState('');

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
      setStatus(p.status ?? (p.isActive ? 'Active' : 'Inactive'));
      setNationalId(p.nationalId ?? '');
      setPhone(p.phone ?? '');
      setSecondaryPhone(p.secondaryPhone ?? '');
      setEmail(p.email ?? '');
      setAddress(p.address ?? '');
      setCity(p.city ?? 'Addis Ababa');
      setEmergencyContactName(p.emergencyContactName ?? '');
      setPreferredLanguage(p.preferredLanguage ?? 'Amharic');
      setInsuranceScheme(p.insuranceScheme ?? '');
      setNotes(p.notes ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patient');
      setPatient(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const metaLine = useMemo(() => {
    if (!patient) return '';
    const age = ageFromDob(patient.dateOfBirth);
    return [patient.medicalRecordNumber, patient.sex ?? '-', age !== null ? `${age} yrs` : '-', `Registered ${formatDate(patient.createdAt)}`].join(' · ');
  }, [patient]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    if (!firstName.trim() || !lastName.trim() || !dateOfBirth || !sex || !phone.trim()) {
      setError('First name, last name, date of birth, sex, and primary phone are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updatePatient(id, {
        firstName: firstName.trim(), lastName: lastName.trim(), dateOfBirth,
        sex, status, nationalId: nationalId || undefined, phone: phone.trim(),
        secondaryPhone: secondaryPhone || undefined, email: email || undefined,
        address: address || undefined, city: city || undefined,
        emergencyContactName: emergencyContactName || undefined,
        preferredLanguage: preferredLanguage || undefined,
        insuranceScheme: insuranceScheme || undefined, notes: notes || undefined,
      });
      setPatient(updated);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="patient-detail"><div className="empty">Loading patient...</div></div>;

  if (!patient) {
    return <div className="patient-detail">
      {error && <div className="error-banner">{error}</div>}
      <button type="button" className="back" onClick={() => navigate('/patients')}>← Patient list</button>
      <div className="empty">Patient not found.</div>
    </div>;
  }

  return <div className="patient-detail">
    <button type="button" className="back" onClick={() => navigate('/patients')}>← Patient list</button>

    <div className="header">
      <div>
        <div className="name">{patient.firstName} {patient.lastName}
          <span className={`badge${patient.isActive ? '' : ' off'}`}>{patient.status}</span>
        </div>
        <div className="meta">{metaLine}</div>
      </div>
      {!editing && <button type="button" className="btn btn-ghost" onClick={() => setEditing(true)}>Edit profile</button>}
    </div>

    {error && <div className="error-banner">{error}</div>}

    {!editing ? <>
      <div className="lock-note"><b>Patient profile</b> — Demographics and contact information. Clinical history, visits, vitals, diagnoses, and notes are available from the patient chart.</div>
      <div className="panel">
        <div className="panel-title">Identity &amp; contact</div>
        <div className="grid">
          {[
            ['Full name', `${patient.firstName} ${patient.lastName}`],
            ['Patient ID', patient.medicalRecordNumber],
            ['Date of birth', formatDate(patient.dateOfBirth)],
            ['Sex', patient.sex ?? '-'],
            ['National ID / Passport', patient.nationalId ?? '-'],
            ['Phone', patient.phone ?? '-'],
            ['Secondary phone', patient.secondaryPhone ?? '-'],
            ['Email', patient.email ?? '-'],
            ['Address', patient.address ?? '-'],
            ['City / Region', patient.city ?? '-'],
            ['Emergency contact', patient.emergencyContactName ?? '-'],
            ['Preferred language', patient.preferredLanguage ?? '-'],
            ['Insurance / scheme', patient.insuranceScheme ?? '-'],
            ['Status', patient.status ?? (patient.isActive ? 'Active' : 'Inactive')],
            ['Registered', formatDate(patient.createdAt)],
            ['Notes', patient.notes ?? '-'],
          ].map(([label, value]) => <div className="field" key={label}><label>{label}</label><div className="val">{value}</div></div>)}
        </div>
      </div>
      <div className="form-actions"><button type="button" className="btn btn-primary" onClick={() => navigate(`/patients/${patient.id}/chart`)}>Open patient chart</button></div>
    </> : <div className="panel">
      <div className="panel-title">Edit patient profile</div>
      <form onSubmit={onSave}>
        <div className="form-grid">
          <div className="field"><label>First name *</label><input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} required /></div>
          <div className="field"><label>Last name / Father&apos;s name *</label><input className="input" value={lastName} onChange={e => setLastName(e.target.value)} required /></div>
          <div className="field"><label>Date of birth *</label><input className="input" type="date" value={dateOfBirth} max={new Date().toISOString().slice(0, 10)} onChange={e => setDateOfBirth(e.target.value)} required /></div>
          <div className="field"><label>Sex *</label><select className="select" value={sex} onChange={e => setSex(e.target.value)} required><option value="">Select...</option><option value="Female">Female</option><option value="Male">Male</option></select></div>
          <div className="field"><label>National ID / Passport</label><input className="input" value={nationalId} onChange={e => setNationalId(e.target.value)} /></div>
          <div className="field"><label>Status</label><select className="select" value={status} onChange={e => setStatus(e.target.value)}><option>Active</option><option>Inactive</option><option>Deceased</option></select></div>
          <div className="field"><label>Primary phone *</label><input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} required /></div>
          <div className="field"><label>Secondary phone</label><input className="input" type="tel" value={secondaryPhone} onChange={e => setSecondaryPhone(e.target.value)} /></div>
          <div className="field span-2"><label>Email</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="field span-2"><label>Address</label><input className="input" value={address} onChange={e => setAddress(e.target.value)} /></div>
          <div className="field"><label>City / Region</label><input className="input" value={city} onChange={e => setCity(e.target.value)} /></div>
          <div className="field"><label>Emergency contact name</label><input className="input" value={emergencyContactName} onChange={e => setEmergencyContactName(e.target.value)} /></div>
          <div className="field"><label>Preferred language</label><select className="select" value={preferredLanguage} onChange={e => setPreferredLanguage(e.target.value)}><option>Amharic</option><option>English</option><option>Oromo</option><option>Tigrinya</option></select></div>
          <div className="field"><label>Insurance / scheme</label><input className="input" value={insuranceScheme} onChange={e => setInsuranceScheme(e.target.value)} /></div>
          <div className="field span-2"><label>Notes for front desk</label><input className="input" value={notes} onChange={e => setNotes(e.target.value)} /></div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => { setEditing(false); setError(null); void load(); }}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
        </div>
      </form>
    </div>}
  </div>;
}
