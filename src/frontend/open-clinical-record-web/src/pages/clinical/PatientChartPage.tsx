import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  addAllergy,
  addHistoryItem,
  createVisit,
  getPatientChart,
  type PatientChart,
} from '../../services/clinicalApi';
import './PatientChartPage.css';

type TabId = 'overview' | 'history' | 'vitals' | 'visits' | 'notes' | 'consultation';

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

export function PatientChartPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [chart, setChart] = useState<PatientChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>((searchParams.get('tab') as TabId) || 'overview');
  const [saving, setSaving] = useState(false);

  const [allergySub, setAllergySub] = useState('');
  const [allergyReaction, setAllergyReaction] = useState('');
  const [historyDesc, setHistoryDesc] = useState('');
  const [historyCat, setHistoryCat] = useState('Condition');

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [bp, setBp] = useState('');
  const [pulse, setPulse] = useState('');
  const [temp, setTemp] = useState('');
  const [spo2, setSpo2] = useState('');
  const [primaryDx, setPrimaryDx] = useState('');
  const [secondaryDx, setSecondaryDx] = useState('');
  const [note, setNote] = useState('');
  const [plan, setPlan] = useState('');
  const [instructions, setInstructions] = useState('');

  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      setChart(await getPatientChart(patientId));
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

  async function onAddAllergy(e: FormEvent) {
    e.preventDefault();
    if (!patientId || !allergySub.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await addAllergy(patientId, {
        substance: allergySub.trim(),
        reaction: allergyReaction || undefined,
        severity: 'Unknown',
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
    if (!patientId || !historyDesc.trim()) return;
    setSaving(true);
    setError(null);
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

  async function onSaveConsultation(e: FormEvent) {
    e.preventDefault();
    if (!patientId) return;
    setSaving(true);
    setError(null);
    try {
      await createVisit(patientId, {
        visitType: 'Consultation',
        chiefComplaint: chiefComplaint || undefined,
        bloodPressure: bp || undefined,
        pulse: pulse ? Number(pulse) : undefined,
        temperatureC: temp ? Number(temp) : undefined,
        spo2: spo2 ? Number(spo2) : undefined,
        primaryDiagnosis: primaryDx || undefined,
        secondaryDiagnosis: secondaryDx || undefined,
        clinicalNote: note || undefined,
        plan: plan || undefined,
        instructions: instructions || undefined,
        status: 'Completed',
      });
      setChiefComplaint('');
      setBp('');
      setPulse('');
      setTemp('');
      setSpo2('');
      setPrimaryDx('');
      setSecondaryDx('');
      setNote('');
      setPlan('');
      setInstructions('');
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
                {chart.sex ? chart.sex[0] : '-'} · {age} yrs
              </span>
              <span>DOB {formatDob(chart.dateOfBirth)}</span>
              <span>{chart.phone ?? '-'}</span>
              <span className="badge">{chart.status}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-ghost" onClick={() => navigate(`/patients/${chart.patientId}`)}>
            Edit demographics
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate(`/patients/${chart.patientId}`)}>
            Mark deceased
          </button>
          <button type="button" className="btn-primary" onClick={() => navigate('/appointments/new')}>
            + New appointment
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {alertText && (
        <div className="alert-bar">
          <span className="ico">!</span>
          <div>
            <b>{alertText}</b>
          </div>
        </div>
      )}

      <div className="tabs">
        {(
          [
            ['overview', 'Overview'],
            ['history', 'Medical history'],
            ['vitals', 'Vital signs'],
            ['visits', 'Visits & diagnosis'],
            ['notes', 'Clinical notes'],
            ['consultation', 'Consultation'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab${tab === id ? ' active' : ''}`}
            onClick={() => selectTab(id)}
          >
            {label}
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
                <div className="panel-title">Allergies &amp; alerts</div>
                <button type="button" className="panel-link" onClick={() => selectTab('history')}>
                  + Add
                </button>
              </div>
              {chart.allergies.length === 0 ? (
                <div className="empty">No allergies recorded.</div>
              ) : (
                <div className="tag-list">
                  {chart.allergies.map((a) => (
                    <span key={a.id} className="tag allergy">
                      {a.substance}
                      {a.reaction ? ` — ${a.severity} (${a.reaction})` : a.severity ? ` — ${a.severity}` : ''}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 16 }}>
                <div className="panel-title" style={{ marginBottom: 10 }}>
                  Alerts
                </div>
                <div className="tag-list">
                  {chart.medicalHistory.filter((h) => h.isActive).length === 0 ? (
                    <span className="muted">No active clinical alerts.</span>
                  ) : (
                    chart.medicalHistory
                      .filter((h) => h.isActive)
                      .slice(0, 6)
                      .map((h) => (
                        <span key={h.id} className="tag">
                          {h.description}
                          {h.category ? ` — ${h.category}` : ''}
                        </span>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="panel">
              <div className="panel-head">
                <div className="panel-title">Current medications</div>
                <button type="button" className="panel-link" onClick={() => selectTab('history')}>
                  + Add
                </button>
              </div>
              {meds.length === 0 ? (
                <div className="empty">
                  No medications recorded. Add under Medical history with category Medication.
                </div>
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
                      <span className={`status-pill ${v.status === 'Completed' ? 'done' : 'open'}`}>
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
            <div className="panel-head">
              <div className="panel-title">Medical history</div>
            </div>
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
            <div className="panel-title">Add history item</div>
            <form onSubmit={onAddHistory}>
              <div className="form-grid">
                <div className="field">
                  <label className="label">Category</label>
                  <select className="select" value={historyCat} onChange={(e) => setHistoryCat(e.target.value)}>
                    <option>Condition</option>
                    <option>Surgery</option>
                    <option>Medication</option>
                    <option>Family</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="field span-2">
                  <label className="label">Description</label>
                  <input className="input" value={historyDesc} onChange={(e) => setHistoryDesc(e.target.value)} required />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  Add
                </button>
              </div>
            </form>
          </div>
          <div className="panel">
            <div className="panel-title">Add allergy</div>
            <form onSubmit={onAddAllergy}>
              <div className="form-grid">
                <div className="field">
                  <label className="label">Substance</label>
                  <input className="input" value={allergySub} onChange={(e) => setAllergySub(e.target.value)} required />
                </div>
                <div className="field">
                  <label className="label">Reaction</label>
                  <input className="input" value={allergyReaction} onChange={(e) => setAllergyReaction(e.target.value)} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={saving}>
                  Add allergy
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {tab === 'vitals' && (
        <div className="panel">
          <div className="panel-title">Vital signs history</div>
          {chart.visits.filter((v) => v.vitalSigns).length === 0 ? (
            <div className="empty">No vitals recorded. Use Consultation or Record vitals.</div>
          ) : (
            chart.visits
              .filter((v) => v.vitalSigns)
              .map((v) => (
                <div key={v.id} className="list-row">
                  <div>
                    <div>
                      BP {v.vitalSigns?.bloodPressure ?? '-'} · Pulse {v.vitalSigns?.pulse ?? '-'} · Temp{' '}
                      {v.vitalSigns?.temperatureC ?? '-'}°C · SpO₂ {v.vitalSigns?.spo2 ?? '-'}%
                    </div>
                    <div className="muted">
                      {fmtDate(v.vitalSigns?.recordedAt)} · {v.vitalSigns?.recordedByName}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {tab === 'visits' && (
        <div className="panel">
          <div className="panel-title">Visits &amp; diagnosis</div>
          {chart.visits.length === 0 ? (
            <div className="empty">No visits yet.</div>
          ) : (
            chart.visits.map((v) => (
              <div key={v.id} className="list-row">
                <div>
                  <div>
                    {v.visitType} · {v.status}
                  </div>
                  <div className="muted">
                    {fmtDate(v.visitDate)} · {v.clinicianName ?? '-'}
                  </div>
                  {v.diagnoses.map((d) => (
                    <div key={d.id} className="muted">
                      {d.isPrimary ? 'Primary: ' : 'Other: '}
                      {d.code ? `${d.code} — ` : ''}
                      {d.description}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div className="panel">
          <div className="panel-title">Clinical notes</div>
          {chart.visits.flatMap((v) => v.notes).length === 0 ? (
            <div className="empty">No clinical notes yet.</div>
          ) : (
            chart.visits.flatMap((v) =>
              v.notes.map((n) => (
                <div key={n.id} className="list-row">
                  <div>
                    <div>{n.content}</div>
                    <div className="muted">
                      {n.noteType} · {n.authorName ?? '-'} · {fmtDate(n.createdAt)}
                    </div>
                  </div>
                </div>
              )),
            )
          )}
        </div>
      )}

      {tab === 'consultation' && (
        <form onSubmit={onSaveConsultation}>
          <div className="panel">
            <div className="panel-title">1. Visit</div>
            <div className="form-grid">
              <div className="field span-2">
                <label className="label">Chief complaint</label>
                <input
                  className="input"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Reason for visit"
                />
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-title">2. Vital signs</div>
            <div className="form-grid">
              <div className="field">
                <label className="label">BP</label>
                <input className="input" value={bp} onChange={(e) => setBp(e.target.value)} placeholder="120/80" />
              </div>
              <div className="field">
                <label className="label">Pulse</label>
                <input className="input" value={pulse} onChange={(e) => setPulse(e.target.value)} placeholder="72" />
              </div>
              <div className="field">
                <label className="label">Temp °C</label>
                <input className="input" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="36.8" />
              </div>
              <div className="field">
                <label className="label">SpO₂ %</label>
                <input className="input" value={spo2} onChange={(e) => setSpo2(e.target.value)} placeholder="98" />
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-title">3. Diagnosis</div>
            <div className="form-grid">
              <div className="field span-2">
                <label className="label">Primary diagnosis</label>
                <input className="input" value={primaryDx} onChange={(e) => setPrimaryDx(e.target.value)} />
              </div>
              <div className="field span-2">
                <label className="label">Secondary</label>
                <input className="input" value={secondaryDx} onChange={(e) => setSecondaryDx(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-title">4. Notes &amp; plan</div>
            <div className="form-grid">
              <div className="field span-2">
                <label className="label">Clinical note</label>
                <input className="input" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <div className="field span-2">
                <label className="label">Plan</label>
                <input className="input" value={plan} onChange={(e) => setPlan(e.target.value)} />
              </div>
              <div className="field span-2">
                <label className="label">Instructions</label>
                <input className="input" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => selectTab('overview')}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save consultation'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
