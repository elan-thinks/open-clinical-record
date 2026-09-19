import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listPatients, type Patient } from '../../services/patientsApi';
import { createVisit, getPatientChart } from '../../services/clinicalApi';
import { Icon } from '../../components/Icon';
import './RecordVitalsPage.css';

function ageYears(dob?: string | null): string {
  if (!dob) return '-';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return '-';
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return String(age);
}

export function RecordVitalsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patientId') ?? '';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState(patientIdParam);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [allergyText, setAllergyText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [bp, setBp] = useState('');
  const [pulse, setPulse] = useState('');
  const [temp, setTemp] = useState('');
  const [rr, setRr] = useState('');
  const [spo2, setSpo2] = useState('');
  const [weight, setWeight] = useState('');
  const [obsNotes, setObsNotes] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await listPatients(undefined, 'active');
        if (!cancelled) setPatients(list);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load patients');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!patientId) {
      setSelected(null);
      setAllergyText(null);
      return;
    }
    const p = patients.find((x) => x.id === patientId) ?? null;
    setSelected(p);
    setSearchParams(patientId ? { patientId } : {});
    let cancelled = false;
    (async () => {
      try {
        const chart = await getPatientChart(patientId);
        if (cancelled) return;
        if (chart.allergies.length) {
          setAllergyText(chart.allergies.map((a) => a.substance).join(', ') + ' allergy on file');
        } else {
          setAllergyText(null);
        }
      } catch {
        if (!cancelled) setAllergyText(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patientId, patients, setSearchParams]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!patientId) {
      setError('Select a patient first.');
      return;
    }
    if (!bp && !pulse && !temp && !rr && !spo2 && !weight) {
      setError('Enter at least one vital sign.');
      return;
    }
    setSaving(true);
    try {
      await createVisit(patientId, {
        visitType: 'Vitals',
        bloodPressure: bp || undefined,
        pulse: pulse ? Number(pulse) : undefined,
        temperatureC: temp ? Number(temp) : undefined,
        respiratoryRate: rr ? Number(rr) : undefined,
        spo2: spo2 ? Number(spo2) : undefined,
        weightKg: weight ? Number(weight) : undefined,
        clinicalNote: obsNotes.trim() || undefined,
        status: 'Completed',
      });
      setSuccess('Vitals saved. Author and timestamp are stored with the entry.');
      setBp('');
      setPulse('');
      setTemp('');
      setRr('');
      setSpo2('');
      setWeight('');
      setObsNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vitals');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="vitals-page">
      <h1 className="page-title">Record vitals / observations</h1>
      <p className="page-sub">Nurse-owned entry · Guide §4.5 · Does not replace clinician diagnosis</p>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="picker panel" style={{ marginBottom: 16, padding: 16 }}>
        <label className="label">Patient</label>
        <select
          className="select"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          disabled={loading}
        >
          <option value="">{loading ? 'Loading patients...' : 'Select patient...'}</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName} — {p.medicalRecordNumber}
            </option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="patient-bar">
          <div>
            <b>
              {selected.firstName} {selected.lastName}
            </b>
            <div className="meta">
              {selected.medicalRecordNumber} · {selected.sex ?? '-'} · {ageYears(selected.dateOfBirth)} yrs
              {selected.phone ? ` · ${selected.phone}` : ''}
            </div>
          </div>
          {allergyText && (
            <div className="allergy-alert">
              <Icon name="bell" size={14} /> {allergyText}
            </div>
          )}
        </div>
      )}

      <form className="panel" onSubmit={onSave}>
        <div className="panel-title">Vitals</div>
        <div className="form-grid">
          <div className="field">
            <label className="label">Blood pressure (mmHg)</label>
            <input className="input" value={bp} onChange={(e) => setBp(e.target.value)} placeholder="e.g. 128/84" />
          </div>
          <div className="field">
            <label className="label">Heart rate (bpm)</label>
            <input className="input" type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="e.g. 72" />
          </div>
          <div className="field">
            <label className="label">Temperature (°C)</label>
            <input className="input" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="e.g. 36.8" />
          </div>
          <div className="field">
            <label className="label">Respiratory rate</label>
            <input className="input" type="number" value={rr} onChange={(e) => setRr(e.target.value)} placeholder="e.g. 16" />
          </div>
          <div className="field">
            <label className="label">SpO₂ (%)</label>
            <input className="input" type="number" value={spo2} onChange={(e) => setSpo2(e.target.value)} placeholder="e.g. 98" />
          </div>
          <div className="field">
            <label className="label">Weight (kg) — optional</label>
            <input className="input" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 72" />
          </div>
          <div className="field full">
            <label className="label">Observation notes</label>
            <textarea
              className="textarea"
              value={obsNotes}
              onChange={(e) => setObsNotes(e.target.value)}
              placeholder="Nurse observations only..."
            />
          </div>
        </div>

        <div className="actions">
          <button type="submit" className="btn-primary" disabled={saving || !patientId}>
            {saving ? 'Saving...' : 'Save vitals'}
          </button>
          <button
            type="button"
            className="btn-ghost"
            disabled={!patientId}
            onClick={() => patientId && navigate(`/patients/${patientId}/chart?tab=vitals`)}
          >
            Open chart
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
        </div>

        <p className="note">
          Only confirmed MVP fields. Nurse contributes observations; clinicians make/record clinical
          decisions. Author and timestamp are stored with the entry.
        </p>
      </form>
    </div>
  );
}
