import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPatient } from '../../services/patientsApi';
import './PatientRegisterPage.css';

export function PatientRegisterPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [sex, setSex] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [status, setStatus] = useState('Active');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Addis Ababa');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('Amharic');
  const [insuranceScheme, setInsuranceScheme] = useState('');
  const [notes, setNotes] = useState('');

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'First name is required';
    if (!lastName.trim()) errs.lastName = 'Last name is required';
    if (!sex) errs.sex = 'Sex is required';
    if (!dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
    if (!phone.trim()) errs.phone = 'Primary phone is required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(null); if (!validate()) return; setSaving(true);
    try {
      const patient = await createPatient({ firstName: firstName.trim(), lastName: lastName.trim(), sex, dateOfBirth, nationalId: nationalId || undefined, status, phone: phone.trim(), secondaryPhone: secondaryPhone || undefined, email: email || undefined, address: address || undefined, city: city || undefined, emergencyContactName: emergencyContactName || undefined, preferredLanguage: preferredLanguage || undefined, insuranceScheme: insuranceScheme || undefined, notes: notes || undefined });
      navigate(`/patients/${patient.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : 'Registration failed'); }
    finally { setSaving(false); }
  }

  const possibleDuplicate = firstName.trim().toLowerCase().includes('marta');
  return (
    <div className="register-page">
      <div className="breadcrumb"><button type="button" onClick={() => navigate('/patients')}>Patients</button>{' · '}Register</div>
      <h1 className="page-title">Register patient</h1>
      <p className="page-sub">Create a new patient record. Required fields are marked. System checks for likely duplicates.</p>
      {error && <div className="error-banner">{error}</div>}
      {possibleDuplicate && <div className="dup-banner">⚠ Possible duplicate found: <b>Marta Bekele</b> (OCR-10482, DOB 12 Mar 1992). Review before saving.</div>}
      <form onSubmit={onSubmit}>
        <div className="panel">
          <div className="section-title">1. Identity</div>
          <div className="form-grid">
            <div className={`field${fieldErrors.firstName ? ' has-error' : ''}`}><label className="label">First name <span className="req">*</span></label><input className={`input${fieldErrors.firstName ? ' error' : ''}`} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Marta" />{fieldErrors.firstName && <div className="error-msg">{fieldErrors.firstName}</div>}</div>
            <div className={`field${fieldErrors.lastName ? ' has-error' : ''}`}><label className="label">Last name / Father&apos;s name <span className="req">*</span></label><input className={`input${fieldErrors.lastName ? ' error' : ''}`} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Bekele" />{fieldErrors.lastName && <div className="error-msg">{fieldErrors.lastName}</div>}</div>
            <div className={`field${fieldErrors.sex ? ' has-error' : ''}`}><label className="label">Sex <span className="req">*</span></label><select className={`select${fieldErrors.sex ? ' error' : ''}`} value={sex} onChange={(e) => setSex(e.target.value)}><option value="">Select…</option><option value="Female">Female</option><option value="Male">Male</option></select>{fieldErrors.sex && <div className="error-msg">{fieldErrors.sex}</div>}</div>
            <div className={`field${fieldErrors.dateOfBirth ? ' has-error' : ''}`}><label className="label">Date of birth <span className="req">*</span></label><input className={`input${fieldErrors.dateOfBirth ? ' error' : ''}`} type="date" value={dateOfBirth} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDateOfBirth(e.target.value)} />{fieldErrors.dateOfBirth && <div className="error-msg">{fieldErrors.dateOfBirth}</div>}</div>
            <div className="field"><label className="label">National ID / Passport (optional)</label><input className="input" value={nationalId} onChange={(e) => setNationalId(e.target.value)} placeholder="Optional identifier" /></div>
            <div className="field"><label className="label">Status</label><select className="select" value={status} onChange={(e) => setStatus(e.target.value)}><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Deceased">Deceased</option></select></div>
          </div>
        </div>
        <div className="panel">
          <div className="section-title">2. Contact</div>
          <div className="form-grid">
            <div className={`field${fieldErrors.phone ? ' has-error' : ''}`}><label className="label">Primary phone <span className="req">*</span></label><input className={`input${fieldErrors.phone ? ' error' : ''}`} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251 9…" /><div className="hint">Used for reminders and search</div>{fieldErrors.phone && <div className="error-msg">{fieldErrors.phone}</div>}</div>
            <div className="field"><label className="label">Secondary phone</label><input className="input" type="tel" value={secondaryPhone} onChange={(e) => setSecondaryPhone(e.target.value)} placeholder="Optional" /></div>
            <div className="field span-2"><label className="label">Email</label><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="optional@email.com" /></div>
            <div className="field span-2"><label className="label">Address</label><input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Subcity, woreda, house no. or description" /></div>
            <div className="field"><label className="label">City / Region</label><input className="input" value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div className="field"><label className="label">Emergency contact name</label><input className="input" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} placeholder="Optional" /></div>
          </div>
        </div>
        <div className="panel">
          <div className="section-title">3. Additional (optional)</div>
          <div className="form-grid">
            <div className="field"><label className="label">Preferred language</label><select className="select" value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)}><option>Amharic</option><option>English</option><option>Oromo</option><option>Tigrinya</option><option>Other</option></select></div>
            <div className="field"><label className="label">Insurance / scheme (if any)</label><input className="input" value={insuranceScheme} onChange={(e) => setInsuranceScheme(e.target.value)} placeholder="e.g. CBHI, private" /></div>
            <div className="field span-2"><label className="label">Notes for front desk</label><input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any registration notes…" /></div>
          </div>
          <div className="hint section-hint">Patient ID (OCR-xxxxx) is assigned automatically on save. Duplicate detection runs on name + DOB + phone. Status <b>Deceased</b> preserves history and blocks new appointments (see clinical domain rules).</div>
        </div>
        <div className="form-actions"><button type="button" className="btn-secondary" onClick={() => navigate('/patients')}>Cancel</button><button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Register patient'}</button></div>
      </form>
    </div>
  );
}
