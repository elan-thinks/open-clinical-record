import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listAppointments,
  updateAppointmentStatus,
  type Appointment,
} from '../../services/appointmentsApi';
import './AppointmentsPage.css';

const FILTERS = ['all', 'Scheduled', 'Waiting', 'CheckedIn', 'Completed', 'Cancelled'] as const;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatTime(t: string): string {
  return t.length >= 5 ? t.slice(0, 5) : t;
}

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(todayIso());
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('all');
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listAppointments(date, filter === 'all' ? undefined : filter));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [date, filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(id: string, status: string) {
    setError(null);
    try {
      await updateAppointmentStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    }
  }

  return (
    <div className="appt-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-sub">Schedule, check in, and open patient charts from today&apos;s list.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/appointments/new')}>
          + New appointment
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="toolbar">
        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={`filter-pill${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'CheckedIn' ? 'Checked in' : f}
          </button>
        ))}
        <button type="button" className="btn-ghost" onClick={() => void load()}>
          Refresh
        </button>
      </div>

      <div className="panel">
        {loading ? (
          <div className="empty">Loading appointments...</div>
        ) : items.length === 0 ? (
          <div className="empty">No appointments for this date. Create one to get started.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Type</th>
                <th>Provider</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td>{formatTime(a.startTime)}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{a.patientName}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{a.medicalRecordNumber}</div>
                  </td>
                  <td>{a.appointmentType}</td>
                  <td>{a.providerName ?? '-'}</td>
                  <td>
                    <span className={`status-pill status-${a.status}`}>
                      <span className="dot" />
                      {a.status}
                    </span>
                  </td>
                  <td>
                    {(a.status === 'Scheduled' || a.status === 'Waiting') && (
                      <button type="button" className="action-link" onClick={() => void setStatus(a.id, 'CheckedIn')}>
                        Check in
                      </button>
                    )}
                    <button
                      type="button"
                      className="action-link"
                      onClick={() => navigate(`/patients/${a.patientId}/chart`)}
                    >
                      Chart
                    </button>
                    {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                      <button type="button" className="action-link" onClick={() => void setStatus(a.id, 'Cancelled')}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
