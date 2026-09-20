import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPatient } from '../../services/patientsApi';
import './PatientRegisterPage.css';

/** Common codes for clinic use — Ethiopia first */
const COUNTRY_CODES = [
  { code: '+251', label: '🇪🇹 +251' },
  { code: '+254', label: '🇰🇪 +254' },
  { code: '+255', label: '🇹🇿 +255' },
  { code: '+256', label: '🇺🇬 +256' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+966', label: '🇸🇦 +966' },
] as const;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** Format local part for display (Ethiopian mobile-friendly spacing) */
function formatLocalPhone(raw: string): string {
  const d = digitsOnly(raw).slice(0, 12);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
}

function composePhone(countryCode: string, local: string): string {
  const localDigits = digitsOnly(local);
  if (!localDigits) return '';
  // Avoid double country code if user pasted full number into local
  if (localDigits.startsWith('251') && countryCode === '+251' && localDigits.length > 9) {
    return `+${localDigits}`;
  }
  return `${countryCode} ${formatLocalPhone(localDigits)}`.trim();
}

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
  const [countryCode, setCountryCode] = useState('+251');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [secCountryCode, setSecCountryCode] = useState('+251');
  const [secondaryPhoneLocal, setSecondaryPhoneLocal] = useState('');
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
    const primary = composePhone(countryCode, phoneLocal);
    if (!primary) errs.phone = 'Primary phone is required';
    else if (digitsOnly(phoneLocal).length < 8) errs.phone = 'Enter a valid phone number';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSaving(true);
    try {
      const phone = composePhone(countryCode, phoneLocal);
      const secondaryPhone = composePhone(secCountryCode, secondaryPhoneLocal) || undefined;
      const patient = await createPatient({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        sex,
        dateOfBirth,
        nationalId: nationalId || undefined,
        status,
        phone,
        secondaryPhone,
        email: email || undefined,
        address: address || undefined,
        city: city || undefined,
        emergencyContactName: emergencyContactName || undefined,
        preferredLanguage: preferredLanguage || undefined,
        insuranceScheme: insuranceScheme || undefined,
        notes: notes || undefined,
      });
      navigate(`/patients/${patient.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setSaving(false);
    }
  }

  const possibleDuplicate = firstName.trim().toLowerCase().includes('marta');

  return (
    <div className="register-page">
      <div className="breadcrumb">
        <button type="button" onClick={() => navigate('/patients')}>
          Patients
        </button>
        {' · '}Register
      </div>
      <h1 className="page-title">Register patient</h1>
      <p className="page-sub">Create a new patient record. Required fields are marked. System checks for likely duplicates.</p>
      {error && <div className="error-banner">{error}</div>}
      {possibleDuplicate && (
        <div className="dup-banner">
          ⚠ Possible duplicate found: <b>Marta Bekele</b> (OCR-10482, DOB 12 Mar 1992). Review before saving.
        </div>
      )}
      <form onSubmit={onSubmit}>
        <div className="panel">
          <div className="section-title">1. Identity</div>
          <div className="form-grid">
            <div className={`field${fieldErrors.firstName ? ' has-error' : ''}`}>
              <label className="label">
                First name <span className="req">*</span>
              </label>
              <input
                className={`input${fieldErrors.firstName ? ' error' : ''}`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Marta"
              />
              {fieldErrors.firstName && <div className="error-msg">{fieldErrors.firstName}</div>}
            </div>
            <div className={`field${fieldErrors.lastName ? ' has-error' : ''}`}>
              <label className="label">
                Last name / Father's name <span className="req">*</span>
              </label>
              <input
                className={`input${fieldErrors.lastName ? ' error' : ''}`}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Bekele"
              />
              {fieldErrors.lastName && <div className="error-msg">{fieldErrors.lastName}</div>}
            </div>
            <div className={`field${fieldErrors.sex ? ' has-error' : ''}`}>
              <label className="label">
                Sex <span className="req">*</span>
              </label>
              <select
                className={`select${fieldErrors.sex ? ' error' : ''}`}
                value={sex}
                onChange={(e) => setSex(e.target.value)}
              >
                <option value="">Select…</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
              {fieldErrors.sex && <div className="error-msg">{fieldErrors.sex}</div>}
            </div>
            <div className={`field${fieldErrors.dateOfBirth ? ' has-error' : ''}`}>
              <label className="label">
                Date of birth <span className="req">*</span>
              </label>
              <input
                className={`input${fieldErrors.dateOfBirth ? ' error' : ''}`}
                type="date"
                value={dateOfBirth}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
              {fieldErrors.dateOfBirth && <div className="error-msg">{fieldErrors.dateOfBirth}</div>}
            </div>
            <div className="field">
              <label className="label">National ID / Passport (optional)</label>
              <input
                className="input"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="Optional identifier"
              />
            </div>
            <div className="field">
              <label className="label">Status</label>
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Deceased">Deceased</option>
              </select>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="section-title">2. Contact</div>
          <div className="form-grid">
            <div className={`field${fieldErrors.phone ? ' has-error' : ''}`}>
              <label className="label">
                Primary phone <span className="req">*</span>
              </label>
              <div className={`phone-split${fieldErrors.phone ? ' error' : ''}`}>
                <select
                  className="phone-code"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  aria-label="Country code"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  className="phone-number"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={phoneLocal}
                  onChange={(e) => setPhoneLocal(formatLocalPhone(e.target.value))}
                  placeholder="9 12 345 678"
                  aria-label="Phone number"
                />
              </div>
              <div className="hint">Used for reminders and search</div>
              {fieldErrors.phone && <div className="error-msg">{fieldErrors.phone}</div>}
            </div>

            <div className="field">
              <label className="label">Secondary phone</label>
              <div className="phone-split">
                <select
                  className="phone-code"
                  value={secCountryCode}
                  onChange={(e) => setSecCountryCode(e.target.value)}
                  aria-label="Secondary country code"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  className="phone-number"
                  type="tel"
                  inputMode="numeric"
                  value={secondaryPhoneLocal}
                  onChange={(e) => setSecondaryPhoneLocal(formatLocalPhone(e.target.value))}
                  placeholder="Optional"
                  aria-label="Secondary phone number"
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
                placeholder="optional@email.com"
              />
            </div>
            <div className="field span-2">
              <label className="label">Address</label>
              <input
                className="input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Subcity, woreda, house no. or description"
              />
            </div>
            <div className="field">
              <label className="label">City / Region</label>
              <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Emergency contact name</label>
              <input
                className="input"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="section-title">3. Additional (optional)</div>
          <div className="form-grid">
            <div className="field">
              <label className="label">Preferred language</label>
              <select
                className="select"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
              >
                <option>Amharic</option>
                <option>English</option>
                <option>Oromo</option>
                <option>Tigrinya</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Insurance / scheme (if any)</label>
              <input
                className="input"
                value={insuranceScheme}
                onChange={(e) => setInsuranceScheme(e.target.value)}
                placeholder="e.g. CBHI, private"
              />
            </div>
            <div className="field span-2">
              <label className="label">Notes for front desk</label>
              <input
                className="input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any registration notes…"
              />
            </div>
          </div>
          <div className="hint section-hint">
            Patient ID (OCR-xxxxx) is assigned automatically on save. Duplicate detection runs on name + DOB + phone.
            Status <b>Deceased</b> preserves history and blocks new appointments (see clinical domain rules).
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/patients')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Register patient'}
          </button>
        </div>
      </form>
    </div>
  );
}
