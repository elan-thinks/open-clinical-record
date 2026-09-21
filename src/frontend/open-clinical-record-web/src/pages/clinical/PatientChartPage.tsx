import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  addAllergy,
  addHistoryItem,
  createVisit,
  documentVisit,
  getPatientChart,
  type PatientChart,
} from '../../services/clinicalApi';
import { listAppointments, type Appointment } from '../../services/appointmentsApi';
import {
  clearPatientDeceased,
  getDeathRecord,
  markPatientDeceased,
  type DeathRecord,
} from '../../services/patientsApi';
import { DeceasedTabPanel } from './DeceasedTabPanel';
import './PatientChartPage.css';
import { VisitHistoryPanel } from './VisitHistoryPanel';
import { ConfirmDialog } from '../../components/ConfirmDialog';

type TabId =
  | 'overview'
  | 'history'
  | 'vitals'
  | 'visits'
  | 'notes'
  | 'appointments'
  | 'deceased'
  | 'consultation';

function ageFromDob(dob?: string | null): string {
  if (!dob) return '-';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return '-';
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return `${age}`;
}

function formatDob(dob?: string | null): string {
  if (!dob) return '-';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return dob;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function initials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

function fmtDate(value?: string | null): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function allergyLabel(a: {
  substance: string;
  severity?: string | null;
  reaction?: string | null;
}): string {
  const sev = a.severity && a.severity !== 'Unknown' ? a.severity : null;
  const rx = a.reaction?.trim() || null;
  if (sev && rx) return `${a.substance} — ${sev} (${rx})`;
  if (sev) return `${a.substance} — ${sev}`;
  if (rx) return `${a.substance} — ${rx}`;
  return a.substance;
}

export function PatientChartPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [chart, setChart] = useState<PatientChart | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>((searchParams.get('tab') as TabId) || 'overview');
  const [saving, setSaving] = useState(false);
  const [allergySub, setAllergySub] = useState('');
  const [allergyReaction, setAllergyReaction] = useState('');
  const [historyDesc, setHistoryDesc] = useState('');
  const [historyCat, setHistoryCat] = useState('Condition');
  const [bp, setBp] = useState('');
  const [pulse, setPulse] = useState('');
  const [temp, setTemp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [respRate, setRespRate] = useState('');
  const [consultationComplaint, setConsultationComplaint] = useState('');
  const [consultationBp, setConsultationBp] = useState('');
  const [consultationPulse, setConsultationPulse] = useState('');
  const [consultationTemp, setConsultationTemp] = useState('');
  const [consultationSpo2, setConsultationSpo2] = useState('');
  const [primaryDx, setPrimaryDx] = useState('');
  const [secondaryDx, setSecondaryDx] = useState('');
  const [clinicalNote, setClinicalNote] = useState('');
  const [consultationPlan, setConsultationPlan] = useState('');
  const [consultationInstructions, setConsultationInstructions] = useState('');
  const [deceasedConfirmOpen, setDeceasedConfirmOpen] = useState(false);
  const [deathRecord, setDeathRecord] = useState<DeathRecord | null>(null);
  const [deathNote, setDeathNote] = useState('');
  const [deathDate, setDeathDate] = useState('');

  const bmi = useMemo(() => {
    const w = Number(weightKg);
    const h = Number(heightCm);
    if (!w || !h || h <= 0) return '';
    const value = w / ((h / 100) * (h / 100));
    return Number.isFinite(value) ? value.toFixed(1) : '';
  }, [weightKg, heightCm]);

  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const [c, appts, death] = await Promise.all([
        getPatientChart(patientId),
        listAppointments().catch(() => [] as Appointment[]),
        getDeathRecord(patientId).catch(() => null),
      ]);
      setChart(c);
      setAppointments(appts.filter((a) => a.patientId === patientId));
      setDeathRecord(death);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart');
      setChart(null);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  function selectTab(next: TabId) {
    setTab(next);
    setSearchParams(next === 'overview' ? {} : { tab: next });
  }

  const alertText = useMemo(() => {
    if (!chart) return null;
    const parts: string[] = [];
    if (chart.allergies.length) {
      parts.push(chart.allergies.map((a) => a.substance).join(', ') + ' allergy');
    }
    const primary = chart.visits[0]?.diagnoses.find((d) => d.isPrimary);
    if (primary) parts.push(primary.description + ' flagged on last visit');
    if (!parts.length) return null;
    return `${parts.length} chart alert${parts.length > 1 ? 's' : ''} — ${parts.join(' · ')}`;
  }, [chart]);

  const isDeceased = (chart?.status ?? '').toLowerCase() === 'deceased';

  async function confirmMarkDeceased() {
    if (!chart) return;
    setSaving(true);
    try {
      await markPatientDeceased(chart.patientId, {
        dateOfDeath: deathDate || undefined,
        note: deathNote.trim() || undefined,
      });
      setDeceasedConfirmOpen(false);
      setDeathNote('');
      setDeathDate('');
      await load();
      selectTab('deceased');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark deceased');
      setDeceasedConfirmOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function onAddAllergy(e: FormEvent) {
    e.preventDefault();
    if (!patientId || !allergySub.trim() || isDeceased) return;
    setSaving(true);
    try {
      await addAllergy(patientId, {
        substance: allergySub.trim(),
        reaction: allergyReaction || undefined,
        severity: 'Moderate',
      });
      setAllergySub('');
      setAllergyReaction('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add allergy');
    } finally {
      setSaving(false);
    }
  }

  async function onAddHistory(e: FormEvent) {
    e.preventDefault();
    if (!patientId || !historyDesc.trim() || isDeceased) return;
    setSaving(true);
    try {
      await addHistoryItem(patientId, { category: historyCat, description: historyDesc.trim() });
      setHistoryDesc('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add history');
    } finally {
      setSaving(false);
    }
  }

  async function onSaveVitals(e: FormEvent) {
    e.preventDefault();
    if (!patientId || isDeceased) return;
    setSaving(true);
    try {
      const draftVisit = chart?.visits.find((v) => v.status === 'Draft');
      const payload = {
        bloodPressure: bp || undefined,
        pulse: pulse ? Number(pulse) : undefined,
        temperatureC: temp ? Number(temp) : undefined,
        spo2: spo2 ? Number(spo2) : undefined,
        respiratoryRate: respRate ? Number(respRate) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
      };
      if (draftVisit) {
        await documentVisit(patientId, draftVisit.id, payload);
      } else {
        await createVisit(patientId, { visitType: 'Vitals', ...payload, status: 'Draft' });
      }
      setBp('');
      setPulse('');
      setTemp('');
      setSpo2('');
      setWeightKg('');
      setHeightCm('');
      setRespRate('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vitals');
    } finally {
      setSaving(false);
    }
  }

  async function onSaveConsultation(e: FormEvent) {
    e.preventDefault();
    if (!patientId || isDeceased) return;
    if (!consultationComplaint.trim() && !primaryDx.trim() && !clinicalNote.trim() && !consultationPlan.trim()) {
      setError('Add at least a chief complaint, diagnosis, clinical note, or plan before saving.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const draftVisit = chart?.visits.find((v) => v.status === 'Draft');
      const appointment = appointments.find((a) => a.id === draftVisit?.appointmentId) ?? appointments.find((a) =>
        ['CheckedIn', 'Waiting', 'InProgress'].includes(a.status),
      );
      const payload = {
        appointmentId: draftVisit?.appointmentId ?? appointment?.id,
        visitType: draftVisit?.visitType ?? appointment?.appointmentType ?? 'Consultation',
        chiefComplaint: consultationComplaint.trim() || undefined,
        bloodPressure: consultationBp || undefined,
        pulse: consultationPulse ? Number(consultationPulse) : undefined,
        temperatureC: consultationTemp ? Number(consultationTemp) : undefined,
        spo2: consultationSpo2 ? Number(consultationSpo2) : undefined,
        primaryDiagnosis: primaryDx.trim() || undefined,
        secondaryDiagnosis: secondaryDx.trim() || undefined,
        clinicalNote: clinicalNote.trim() || undefined,
        plan: consultationPlan.trim() || undefined,
        instructions: consultationInstructions.trim() || undefined,
        status: 'Final',
      };
      if (draftVisit) {
        await documentVisit(patientId, draftVisit.id, payload);
      } else {
        await createVisit(patientId, payload);
      }
      setConsultationComplaint(''); setConsultationBp(''); setConsultationPulse(''); setConsultationTemp('');
      setConsultationSpo2(''); setPrimaryDx(''); setSecondaryDx(''); setClinicalNote('');
      setConsultationPlan(''); setConsultationInstructions('');
      await load();
      selectTab('visits');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save consultation');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="chart-page">
        <div className="empty">Loading chart...</div>
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="chart-page">
        {error && <div className="error-banner">{error}</div>}
        <button type="button" className="breadcrumb" onClick={() => navigate('/patients')}>
          Patients
        </button>
        <div className="empty">Chart not found.</div>
      </div>
    );
  }

  const age = ageFromDob(chart.dateOfBirth);
  const meds = chart.medicalHistory.filter((h) => h.category.toLowerCase().includes('med'));

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'Medical history' },
    { id: 'vitals', label: 'Vital signs' },
    { id: 'visits', label: 'Visits & diagnosis' },
    { id: 'notes', label: 'Clinical notes' },
    { id: 'appointments', label: 'Appointments' },
    { id: 'deceased', label: 'Deceased' },
  ];

  return (
    <div className="chart-page">
      <div className="breadcrumb">
        <button type="button" onClick={() => navigate('/patients')}>
          Patients
        </button>
        {' · '}Chart
      </div>

      <div className="patient-header">
        <div className="patient-identity">
          <div className="avatar-lg">{initials(chart.firstName, chart.lastName)}</div>
          <div>
            <div className="p-name">
              {chart.firstName} {chart.lastName}
            </div>
            <div className="p-meta">
              <span>{chart.medicalRecordNumber}</span>
              <span>
                {chart.sex ? chart.sex[0].toUpperCase() : '-'} · {age} yrs
              </span>
              <span>DOB {formatDob(chart.dateOfBirth)}</span>
              <span>{chart.phone ?? '-'}</span>
              <span className={`badge${isDeceased ? ' badge-deceased' : ''}`}>{chart.status}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-ghost" onClick={() => navigate(`/patients/${chart.patientId}`)}>
            Edit demographics
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              if (isDeceased) {
                selectTab('deceased');
                return;
              }
              setDeceasedConfirmOpen(true);
            }}
          >
            {isDeceased ? 'Deceased details' : 'Mark deceased'}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate(`/appointments/new?patientId=${chart.patientId}`)}
            disabled={isDeceased}
          >
            + New appointment
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {isDeceased && (
        <div className="deceased-banner">
          <span className="ico">†</span>
          <div>
            <b>Patient is marked deceased</b> — Historical chart is preserved. New appointments and clinical
            activity are blocked.
          </div>
        </div>
      )}

      {alertText && !isDeceased && (
        <div className="alert-bar">
          <span className="ico">!</span>
          <div>
            <b>{alertText}</b>
          </div>
        </div>
      )}

      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab${tab === t.id ? ' active' : ''}`}
            onClick={() => selectTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid-2">
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Demographics</div>
                <button type="button" className="panel-link" onClick={() => navigate(`/patients/${chart.patientId}`)}>
                  Edit
                </button>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <label>Full name</label>
                  <div className="val">
                    {chart.firstName} {chart.lastName}
                  </div>
                </div>
                <div className="info-item">
                  <label>Patient ID</label>
                  <div className="val">{chart.medicalRecordNumber}</div>
                </div>
                <div className="info-item">
                  <label>Sex</label>
                  <div className="val">{chart.sex ?? '-'}</div>
                </div>
                <div className="info-item">
                  <label>Date of birth</label>
                  <div className="val">
                    {formatDob(chart.dateOfBirth)} ({age})
                  </div>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <div className="val">{chart.phone ?? '-'}</div>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <div className="val">{chart.email ?? '-'}</div>
                </div>
                <div className="info-item">
                  <label>Address</label>
                  <div className="val">{[chart.address, chart.city].filter(Boolean).join(', ') || '-'}</div>
                </div>
                <div className="info-item">
                  <label>Status</label>
                  <div className="val">{chart.status}</div>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Allergies & alerts</div>
                <button type="button" className="panel-link" onClick={() => selectTab('history')} disabled={isDeceased}>
                  + Add
                </button>
              </div>
              {chart.allergies.length === 0 ? (
                <div className="empty">No allergies recorded.</div>
              ) : (
                <div className="tag-list">
                  {chart.allergies.map((a) => (
                    <span key={a.id} className="tag allergy">
                      {allergyLabel(a)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid-2">
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Current medications</div>
                <button type="button" className="panel-link" onClick={() => selectTab('history')} disabled={isDeceased}>
                  + Add
                </button>
              </div>
              {meds.length === 0 ? (
                <div className="empty">No medications recorded. Add under Medical history (category Medication).</div>
              ) : (
                <div className="list-rows">
                  {meds.map((h) => (
                    <div key={h.id} className="list-row">
                      <div>
                        <div>{h.description}</div>
                        <div className="muted">{h.category}</div>
                      </div>
                      <span className="tag med">{h.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Recent visits</div>
                <button type="button" className="panel-link" onClick={() => selectTab('visits')}>
                  View all
                </button>
              </div>
              {chart.visits.length === 0 ? (
                <div className="empty">No visits yet.</div>
              ) : (
                <div className="list-rows">
                  {chart.visits.slice(0, 5).map((v) => (
                    <div key={v.id} className="list-row">
                      <div>
                        <div>
                          {fmtDate(v.visitDate)} — {v.visitType}
                        </div>
                        <div className="muted">
                          {v.clinicianName ?? 'Clinician'} · {v.status}
                        </div>
                      </div>
                      <span
                        className={`status-pill ${
                          v.status === 'Completed' || v.status === 'Final' ? 'done' : 'open'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'history' && (
        <>
          <div className="panel">
            <div className="panel-title">Medical history</div>
            {chart.medicalHistory.length === 0 ? (
              <div className="empty">No history recorded.</div>
            ) : (
              chart.medicalHistory.map((h) => (
                <div key={h.id} className="list-row">
                  <div>
                    <div>{h.description}</div>
                    <div className="muted">
                      {h.category} · {h.isActive ? 'Active' : 'Resolved'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="panel">
            <div className="panel-title">Add history / allergy</div>
            <form onSubmit={onAddHistory}>
              <div className="form-grid">
                <div className="field">
                  <label className="label">Category</label>
                  <select className="select" value={historyCat} onChange={(e) => setHistoryCat(e.target.value)} disabled={isDeceased}>
                    <option>Condition</option>
                    <option>Surgery</option>
                    <option>Medication</option>
                    <option>Family</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label">Description</label>
                  <input className="input" value={historyDesc} onChange={(e) => setHistoryDesc(e.target.value)} required disabled={isDeceased} />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={saving || isDeceased}>
                Save history
              </button>
            </form>
            <form onSubmit={onAddAllergy} style={{ marginTop: 16 }}>
              <div className="form-grid">
                <div className="field">
                  <label className="label">Allergy substance</label>
                  <input className="input" value={allergySub} onChange={(e) => setAllergySub(e.target.value)} required disabled={isDeceased} />
                </div>
                <div className="field">
                  <label className="label">Reaction</label>
                  <input className="input" value={allergyReaction} onChange={(e) => setAllergyReaction(e.target.value)} disabled={isDeceased} />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={saving || isDeceased}>
                Save allergy
              </button>
            </form>
          </div>
        </>
      )}

      {tab === 'vitals' && (
        <div className="panel">
          <div className="panel-title">Record vitals</div>
          <form onSubmit={onSaveVitals}>
            <div className="form-grid">
              <div className="field">
                <label className="label">Blood pressure</label>
                <input className="input" value={bp} onChange={(e) => setBp(e.target.value)} placeholder="120/80" disabled={isDeceased} />
              </div>
              <div className="field">
                <label className="label">Pulse</label>
                <input className="input" value={pulse} onChange={(e) => setPulse(e.target.value)} disabled={isDeceased} />
              </div>
              <div className="field">
                <label className="label">Temp (°C)</label>
                <input className="input" value={temp} onChange={(e) => setTemp(e.target.value)} disabled={isDeceased} />
              </div>
              <div className="field">
                <label className="label">SpO2 %</label>
                <input className="input" value={spo2} onChange={(e) => setSpo2(e.target.value)} disabled={isDeceased} />
              </div>
              <div className="field">
                <label className="label">Weight (kg)</label>
                <input className="input" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} disabled={isDeceased} />
              </div>
              <div className="field">
                <label className="label">Height (cm)</label>
                <input className="input" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} disabled={isDeceased} />
              </div>
              <div className="field">
                <label className="label">Respiratory rate</label>
                <input className="input" value={respRate} onChange={(e) => setRespRate(e.target.value)} disabled={isDeceased} />
              </div>
              {bmi && (
                <div className="field">
                  <label className="label">BMI</label>
                  <div className="val">{bmi}</div>
                </div>
              )}
            </div>
            <button type="submit" className="btn-primary" disabled={saving || isDeceased}>
              Save vitals
            </button>
          </form>
        </div>
      )}

      {tab === 'visits' && (
        <VisitHistoryPanel
          patientId={chart.patientId}
          visits={chart.visits}
          isDeceased={isDeceased}
          onNewConsultation={() => selectTab('consultation')}
          onChanged={load}
        />
      )}

      {tab === 'consultation' && (
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">New consultation</div>
              <div className="muted">Complete the current checked-in encounter, then finalize the documentation.</div>
            </div>
          </div>
          <form onSubmit={onSaveConsultation}>
            <div className="form-grid">
              <div className="field span-2"><label className="label">Chief complaint</label><input className="input" value={consultationComplaint} onChange={(e) => setConsultationComplaint(e.target.value)} disabled={isDeceased} /></div>
              <div className="field"><label className="label">Blood pressure</label><input className="input" value={consultationBp} onChange={(e) => setConsultationBp(e.target.value)} placeholder="120/80" disabled={isDeceased} /></div>
              <div className="field"><label className="label">Pulse</label><input className="input" value={consultationPulse} onChange={(e) => setConsultationPulse(e.target.value)} disabled={isDeceased} /></div>
              <div className="field"><label className="label">Temperature °C</label><input className="input" value={consultationTemp} onChange={(e) => setConsultationTemp(e.target.value)} disabled={isDeceased} /></div>
              <div className="field"><label className="label">SpO2 %</label><input className="input" value={consultationSpo2} onChange={(e) => setConsultationSpo2(e.target.value)} disabled={isDeceased} /></div>
              <div className="field span-2"><label className="label">Primary diagnosis</label><input className="input" value={primaryDx} onChange={(e) => setPrimaryDx(e.target.value)} placeholder="Diagnosis" disabled={isDeceased} /></div>
              <div className="field span-2"><label className="label">Secondary diagnosis</label><input className="input" value={secondaryDx} onChange={(e) => setSecondaryDx(e.target.value)} disabled={isDeceased} /></div>
              <div className="field span-2"><label className="label">Clinical note</label><textarea className="textarea" value={clinicalNote} onChange={(e) => setClinicalNote(e.target.value)} rows={5} disabled={isDeceased} /></div>
              <div className="field span-2"><label className="label">Plan</label><input className="input" value={consultationPlan} onChange={(e) => setConsultationPlan(e.target.value)} disabled={isDeceased} /></div>
              <div className="field span-2"><label className="label">Instructions</label><input className="input" value={consultationInstructions} onChange={(e) => setConsultationInstructions(e.target.value)} disabled={isDeceased} /></div>
            </div>
            <div className="form-actions"><button type="button" className="btn-ghost" onClick={() => selectTab('visits')}>Cancel</button><button type="submit" className="btn-primary" disabled={saving || isDeceased}>{saving ? 'Saving...' : 'Save consultation'}</button></div>
          </form>
        </div>
      )}

      {tab === 'notes' && (
        <div className="panel">
          <div className="panel-title">Clinical notes</div>
          {chart.visits.flatMap((v) => v.notes ?? []).length === 0 ? (
            <div className="empty">No clinical notes yet. Add them from a visit consultation.</div>
          ) : (
            <div className="list-rows">
              {chart.visits.flatMap((v) =>
                (v.notes ?? []).map((n) => (
                  <div key={n.id} className="list-row">
                    <div>
                      <div>{n.body || n.content || n.text || 'Note'}</div>
                      <div className="muted">{fmtDate(v.visitDate)} · {v.visitType}</div>
                    </div>
                  </div>
                )),
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'appointments' && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Appointments</div>
            <button
              type="button"
              className="panel-link"
              onClick={() => navigate(`/appointments/new?patientId=${chart.patientId}`)}
              disabled={isDeceased}
            >
              + Book
            </button>
          </div>
          {appointments.length === 0 ? (
            <div className="empty">No appointments for this patient.</div>
          ) : (
            <div className="list-rows">
              {appointments.map((a) => (
                <div key={a.id} className="list-row">
                  <div>
                    <div>
                      {a.appointmentDate} · {a.startTime} — {a.appointmentType}
                    </div>
                    <div className="muted">
                      {a.providerName ?? 'Provider'} · {a.reason || '—'}
                    </div>
                  </div>
                  <span className="status-pill open">{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'deceased' && (
        <DeceasedTabPanel
          isDeceased={isDeceased}
          patient={chart}
          deathRecord={deathRecord}
          appointments={appointments}
          saving={saving}
          onClear={() => {
            void (async () => {
              setSaving(true);
              try {
                await clearPatientDeceased(chart.patientId);
                await load();
                selectTab('overview');
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to clear deceased');
              } finally {
                setSaving(false);
              }
            })();
          }}
        />
      )}

      {tab === 'consultation' && (
        <div className="panel">
          <div className="panel-title">Consultation</div>
          <p className="muted">Use Visit history → + New consultation, or record vitals on the Vital signs tab.</p>
          <button type="button" className="btn-primary" onClick={() => selectTab('visits')}>
            Open visit history
          </button>
        </div>
      )}

      <ConfirmDialog
        open={deceasedConfirmOpen}
        tone="danger"
        title="Mark patient as deceased?"
        description={
          <>
            <p style={{ margin: '0 0 12px' }}>
              This will update <strong>{chart.firstName} {chart.lastName}</strong> ({chart.medicalRecordNumber}) to
              deceased status. Historical chart is retained; new clinical activity is blocked.
            </p>
            <label className="death-form-label" htmlFor="death-date">
              Date of death (optional)
            </label>
            <input
              id="death-date"
              type="date"
              className="input death-form-input"
              value={deathDate}
              onChange={(e) => setDeathDate(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
            />
            <label className="death-form-label" htmlFor="death-note">
              Notes (optional)
            </label>
            <textarea
              id="death-note"
              className="input death-form-input"
              rows={3}
              placeholder="Cause context, place, or administrative note…"
              value={deathNote}
              onChange={(e) => setDeathNote(e.target.value)}
            />
          </>
        }
        confirmLabel="Mark deceased"
        cancelLabel="Keep active"
        busy={saving}
        onCancel={() => setDeceasedConfirmOpen(false)}
        onConfirm={() => void confirmMarkDeceased()}
      />
    </div>
  );
}
