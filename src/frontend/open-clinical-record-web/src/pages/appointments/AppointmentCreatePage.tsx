import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPatients, type Patient } from '../../services/patientsApi';
import { createAppointment } from '../../services/appointmentsApi';
import './AppointmentsPage.css';

const SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

const TYPES = ['Consultation', 'Follow-up', 'New complaint', 'Procedure', 'Other'];

export function AppointmentCreatePage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState('09:30');
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState('Consultation');
  const [reason, setReason] = useState('');
  const [providerName, setProviderName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void listPatients(undefined, 'active')
      .then(setPatients)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load patients'));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!patientId) {
      setError('Select a patient.');
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
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="appt-page">
      <div className="breadcrumb">
        <button type="button" onClick={() => navigate('/appointments')}>
          Appointments
        </button>
        {' · '}New
      </div>
      <h1 className="page-title">New appointment</h1>
      <p className="page-sub">Create an appointment for an existing patient.</p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={onSubmit}>
        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="section-title">1. Patient</div>
          <div className="form-grid">
            <div className="field span-2">
              <label className="label">
                Patient <span className="req">*</span>
              </label>
              <select className="select" value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                <option value="">Select patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} — {p.medicalRecordNumber}
                  </option>
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
              <label className="label">
                Date <span className="req">*</span>
              </label>
              <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="field">
              <label className="label">Duration</label>
              <select className="select" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </div>
            <div className="field span-2">
              <label className="label">
                Available slots <span className="req">*</span>
              </label>
              <div className="slot-grid">
                {SLOTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`slot${slot === s ? ' selected' : ''}`}
                    onClick={() => setSlot(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 14 }}>
          <div className="section-title">3. Details</div>
          <div className="form-grid">
            <div className="field">
              <label className="label">Type</label>
              <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">Provider (optional)</label>
              <input
                className="input"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                placeholder="Defaults to current user"
              />
            </div>
            <div className="field span-2">
              <label className="label">Reason / chief complaint</label>
              <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => navigate('/appointments')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Create appointment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
