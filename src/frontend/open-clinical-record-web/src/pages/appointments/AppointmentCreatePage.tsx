import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPatients, type Patient } from '../../services/patientsApi';
import { ApiError, createAppointment } from '../../services/appointmentsApi';
import { useAuth } from '../../context/AuthContext';
import './AppointmentCreatePage.css';

const SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

const TYPES = ['Consultation', 'Follow-up', 'New complaint', 'Procedure', 'Other'];

type Notice = { title: string; body: string; tone: 'error' | 'auth' };

function noticeFromError(err: unknown): Notice {
  if (err instanceof ApiError) {
    if (err.code === 'forbidden' || err.code === 'unauthorized') {
      return {
        title: err.code === 'unauthorized' ? 'Please sign in again' : 'Permission needed',
        body: err.message,
        tone: 'auth',
      };
    }
    if (err.code === 'conflict') {
      return { title: 'Time slot unavailable', body: err.message, tone: 'error' };
    }
    if (err.code === 'network') {
      return { title: 'Connection problem', body: err.message, tone: 'error' };
    }
    return { title: 'Could not create appointment', body: err.message, tone: 'error' };
  }
  if (err instanceof Error) {
    return { title: 'Could not create appointment', body: err.message, tone: 'error' };
  }
  return {
    title: 'Could not create appointment',
    body: 'Something went wrong. Please try again.',
    tone: 'error',
  };
}

export function AppointmentCreatePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState('09:30');
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState('Consultation');
  const [reason, setReason] = useState('');
  const [providerName, setProviderName] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    void listPatients(undefined, 'active')
      .then(setPatients)
      .catch((err) => setNotice(noticeFromError(err)));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setNotice(null);
    if (!patientId) {
      setNotice({ title: 'Patient required', body: 'Select a patient before creating the appointment.', tone: 'error' });
      return;
    }
    setSaving(true);
    try {
      await createAppointment({
        patientId,
        appointmentDate: date,
        startTime: slot.length === 5 ? `${slot}:00` : slot,
        durationMinutes: duration,
        appointmentType: type,
        reason: reason || undefined,
        providerName: providerName || undefined,
      });
      navigate('/appointments');
    } catch (err) {
      setNotice(noticeFromError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="appointment-create-page">
      <div className="breadcrumb">
        <button type="button" onClick={() => navigate('/appointments')}>Appointments</button>
        {' · '}New
      </div>
      <h1 className="page-title">New appointment</h1>
      <p className="page-sub">Create an appointment for an existing patient.</p>

      {notice && (
        <div className={`notice-banner ${notice.tone}`} role="alert">
          <div className="notice-title">{notice.title}</div>
          <p className="notice-body">{notice.body}</p>
          {notice.tone === 'auth' && (
            <div className="notice-actions">
              <button
                type="button"
                className="notice-btn"
                onClick={() => {
                  logout();
                  navigate('/login', { replace: true });
                }}
              >
                Sign out and try again
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="section-title">1. Patient</div>
          <div className="form-grid">
            <div className="field span-2">
              <label className="label">Patient <span className="req">*</span></label>
              <select className="select" value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                <option value="">Select patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName} — {p.medicalRecordNumber}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="hint">Patient must already be registered. Use Patients → Register for new records.</p>
        </div>

        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="section-title">2. Date & time</div>
          <div className="form-grid">
            <div className="field">
              <label className="label">Date <span className="req">*</span></label>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="field">
              <label className="label">Duration</label>
              <select className="select" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                <option value={15}>15 min</option><option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>60 min</option>
              </select>
            </div>
            <div className="field span-2">
              <label className="label">Available slots <span className="req">*</span></label>
              <div className="slot-grid">
                {SLOTS.map((s) => (
                  <button key={s} type="button" className={`slot${slot === s ? ' selected' : ''}`} onClick={() => setSlot(s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="section-title">3. Details</div>
          <div className="form-grid">
            <div className="field"><label className="label">Type</label><select className="select" value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
            <div className="field"><label className="label">Provider (optional)</label><input className="input" value={providerName} onChange={(e) => setProviderName(e.target.value)} placeholder="Defaults to current user" /></div>
            <div className="field span-2"><label className="label">Reason / chief complaint</label><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => navigate('/appointments')}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create appointment'}</button>
          </div>
        </div>
      </form>
    </div>
  );
}
