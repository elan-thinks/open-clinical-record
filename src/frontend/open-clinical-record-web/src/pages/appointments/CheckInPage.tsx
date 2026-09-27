import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAppointments, updateAppointmentStatus, type Appointment } from '../../services/appointmentsApi';
import './CheckInPage.css';

type FilterId = 'all' | 'Scheduled' | 'Waiting' | 'CheckedIn' | 'Walk-in' | 'Completed';

const TERMINAL = new Set(['Completed', 'Cancelled', 'NoShow']);

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(t: string): string {
  if (!t) return '—';
  const parts = t.split(':');
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  return t;
}

function statusClass(status: string): string {
  const s = status.toLowerCase();
  if (s === 'checkedin' || s === 'inprogress') return 's-ok';
  if (s === 'waiting') return 's-wait';
  if (s === 'scheduled') return 's-dim';
  if (s === 'cancelled' || s === 'noshow') return 's-bad';
  if (s === 'completed') return 's-done';
  return 's-dim';
}

function statusLabel(status: string): string {
  if (status === 'CheckedIn') return 'Checked in';
  if (status === 'NoShow') return 'No-show';
  if (status === 'InProgress') return 'In progress';
  return status;
}

export function CheckInPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>('all');
  const [q, setQ] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelBusy, setCancelBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listAppointments(todayIso()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeItems = useMemo(
    () => items.filter((a) => !TERMINAL.has(a.status)),
    [items],
  );

  const stats = useMemo(() => {
    const scheduled = items.filter((a) => a.status === 'Scheduled').length;
    const checkedIn = items.filter((a) => a.status === 'CheckedIn' || a.status === 'InProgress').length;
    const waiting = items.filter((a) => a.status === 'Waiting').length;
    const completed = items.filter((a) => a.status === 'Completed').length;
    const walkIns = items.filter((a) =>
      (a.appointmentType || '').toLowerCase().includes('walk'),
    ).length;
    return { scheduled: activeItems.length, checkedIn, waiting, walkIns, scheduledOnly: scheduled, completed };
  }, [items, activeItems]);

  const filtered = useMemo(() => {
    let list = filter === 'Completed' ? items.filter((a) => a.status === 'Completed') : activeItems;
    if (filter === 'Walk-in') {
      list = activeItems.filter((a) => (a.appointmentType || '').toLowerCase().includes('walk'));
    } else if (filter !== 'all' && filter !== 'Completed') {
      list = activeItems.filter((a) => a.status === filter);
    }
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (a) =>
          a.patientName.toLowerCase().includes(term) ||
          a.medicalRecordNumber.toLowerCase().includes(term) ||
          (a.providerName || '').toLowerCase().includes(term),
      );
    }
    return list;
  }, [items, activeItems, filter, q]);

  async function setStatus(id: string, status: string, reason?: string) {
    setBusyId(id);
    setError(null);
    try {
      await updateAppointmentStatus(id, status, reason);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    } finally {
      setBusyId(null);
    }
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    if (!cancelReason.trim()) {
      setError('A reason is required when cancelling.');
      return;
    }
    setCancelBusy(true);
    setError(null);
    try {
      await updateAppointmentStatus(cancelTarget.id, 'Cancelled', cancelReason.trim());
      setCancelTarget(null);
      setCancelReason('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed');
    } finally {
      setCancelBusy(false);
    }
  }

  function primaryAction(a: Appointment): { label: string; next: string } | null {
    if (TERMINAL.has(a.status)) return null;
    if (a.status === 'Scheduled' || a.status === 'Waiting') {
      return { label: 'Check in', next: 'CheckedIn' };
    }
    if (a.status === 'CheckedIn') {
      return { label: 'Mark waiting', next: 'Waiting' };
    }
    return null;
  }

  return (
    <div className="checkin-page">
      <div className="page-head">
        <div>
          <div className="page-title">Check-in / Queue</div>
          <div className="page-sub">
            Front desk · Confirm identity → Check in → Waiting workflow
          </div>
        </div>
        <div className="head-actions">
          <button type="button" className="btn-ghost" onClick={() => navigate('/patients/new')}>
            Walk-in register
          </button>
          <button type="button" className="btn-primary" onClick={() => navigate('/appointments/new')}>
            + Book appointment
          </button>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="stat-label">Active today</div>
          <div className="stat-val">{stats.scheduled}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Checked in</div>
          <div className="stat-val teal">{stats.checkedIn}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Waiting</div>
          <div className="stat-val amber">{stats.waiting}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Completed</div>
          <div className="stat-val">{stats.completed}</div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="toolbar">
        <input
          className="search-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, MRN, provider…"
        />
        {(
          [
            ['all', 'Active'],
            ['Scheduled', 'Scheduled'],
            ['Waiting', 'Waiting'],
            ['CheckedIn', 'Checked in'],
            ['Completed', 'Completed'],
            ['Walk-in', 'Walk-in'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`pill${filter === id ? ' active' : ''}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="panel">
        {loading ? (
          <div className="empty">Loading today&apos;s queue…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No appointments match. Book one or clear filters.</div>
        ) : (
          <table className="queue-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Type</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const action = primaryAction(a);
                const isTerminal = TERMINAL.has(a.status);
                return (
                  <tr key={a.id} className={isTerminal ? 'row-done' : undefined}>
                    <td className="time">{formatTime(a.startTime)}</td>
                    <td>
                      <div className="pname">{a.patientName}</div>
                      <div className="muted">{a.medicalRecordNumber}</div>
                    </td>
                    <td>{a.appointmentType}</td>
                    <td>{a.providerName || '—'}</td>
                    <td>
                      <span className={`status-pill ${statusClass(a.status)}`}>
                        <span className="dot" />
                        {statusLabel(a.status)}
                      </span>
                    </td>
                    <td className="actions">
                      {action && (
                        <button
                          type="button"
                          className="btn-sm"
                          disabled={busyId === a.id}
                          onClick={() => void setStatus(a.id, action.next)}
                        >
                          {busyId === a.id ? '…' : action.label}
                        </button>
                      )}
                      {a.status === 'Scheduled' && (
                        <button
                          type="button"
                          className="btn-sm ghost"
                          disabled={busyId === a.id}
                          onClick={() => void setStatus(a.id, 'Waiting')}
                        >
                          Arrive / Wait
                        </button>
                      )}
                      {!isTerminal && (
                        <button
                          type="button"
                          className="btn-sm ghost danger"
                          disabled={busyId === a.id}
                          onClick={() => {
                            setCancelTarget(a);
                            setCancelReason('');
                            setError(null);
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        className="link"
                        onClick={() => navigate(`/patients/${a.patientId}`)}
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flow">
        <div className="flow-card">
          <div className="flow-title">Scheduled patient</div>
          <div className="flow-steps">
            <b>1.</b> Confirm identity (MRN / name)
            <br />
            <b>2.</b> Check in → status <em>Checked in</em>
            <br />
            <b>3.</b> Clinician finalizes visit → status <em>Completed</em> (leaves active queue)
          </div>
        </div>
        <div className="flow-card">
          <div className="flow-title">Walk-in</div>
          <div className="flow-steps">
            <b>1.</b> Register patient if new
            <br />
            <b>2.</b> Book walk-in appointment (or use Arrived path)
            <br />
            <b>3.</b> Check in when ready for care
          </div>
        </div>
      </div>

      <div className="note">
        Receptionist view: demographics, appointment status, and check-in actions only. Clinical notes and
        diagnoses stay on the chart. Finalized consultations auto-complete the appointment.
      </div>

      {cancelTarget && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-title">Cancel appointment</div>
            <div className="modal-sub">
              {cancelTarget.patientName} · {formatTime(cancelTarget.startTime)} · {cancelTarget.appointmentType}
            </div>
            <label className="modal-label" htmlFor="cancel-reason">
              Reason <span className="req">*</span>
            </label>
            <textarea
              id="cancel-reason"
              className="modal-textarea"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Patient requested, provider unavailable, double-booked…"
              autoFocus
            />
            <div className="modal-actions">
              <button
                type="button"
                className="btn-ghost"
                disabled={cancelBusy}
                onClick={() => {
                  setCancelTarget(null);
                  setCancelReason('');
                }}
              >
                Keep appointment
              </button>
              <button
                type="button"
                className="btn-danger"
                disabled={cancelBusy || !cancelReason.trim()}
                onClick={() => void confirmCancel()}
              >
                {cancelBusy ? 'Cancelling…' : 'Confirm cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
