import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listAppointments,
  updateAppointmentStatus,
  type Appointment,
} from '../../services/appointmentsApi';
import { Icon } from '../../components/Icon';
import './AppointmentsList.css';
import './AppointmentsCalendar.css';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'CheckedIn', label: 'Checked in' },
  { id: 'Waiting', label: 'Waiting' },
  { id: 'Scheduled', label: 'Scheduled' },
  { id: 'Cancelled', label: 'Cancelled' },
] as const;

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday = 0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTime(t: string): string {
  return t.length >= 5 ? t.slice(0, 5) : t;
}

function statusClass(status: string): string {
  if (status === 'CheckedIn' || status === 'InProgress' || status === 'Completed') return 'checked';
  if (status === 'Waiting') return 'waiting';
  if (status === 'Cancelled' || status === 'NoShow') return 'cancelled';
  return 'scheduled';
}

function statusLabel(status: string): string {
  if (status === 'CheckedIn') return 'Checked in';
  if (status === 'InProgress') return 'In progress';
  if (status === 'NoShow') return 'No show';
  return status;
}

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'list' | 'week'>('list');
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(new Date()));
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAppointments();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = items;
    if (filter !== 'all') list = list.filter((a) => a.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.medicalRecordNumber.toLowerCase().includes(q) ||
          (a.providerName ?? '').toLowerCase().includes(q) ||
          (a.reason ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, filter, query]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => addDays(weekAnchor, i));
  }, [weekAnchor]);

  async function onCheckIn(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await updateAppointmentStatus(id, { status: 'CheckedIn' });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Check-in failed');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="appt-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-sub">Schedule, queue, and check-in</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/appointments/new')}>
          <Icon name="cal" size={15} />
          New appointment
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="appt-toolbar">
        <div className="filter-row">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`chip${filter === f.id ? ' active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="search-box">
          <Icon name="search" size={15} />
          <input
            type="search"
            placeholder="Search patient, MRN, provider…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="view-toggle">
          <button type="button" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
            List
          </button>
          <button type="button" className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>
            Week
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty">Loading appointments…</div>
      ) : view === 'list' ? (
        <div className="appt-list panel-card">
          {filtered.length === 0 ? (
            <div className="empty">No appointments match this filter.</div>
          ) : (
            filtered.map((a) => (
              <div key={a.id} className="appt-row">
                <div className="appt-time">
                  <div className="t">{formatTime(a.startTime)}</div>
                  <div className="d">{a.appointmentDate}</div>
                </div>
                <div className="appt-main">
                  <div className="name">{a.patientName}</div>
                  <div className="meta">
                    {a.medicalRecordNumber} · {a.appointmentType}
                    {a.providerName ? ` · ${a.providerName}` : ''}
                  </div>
                  {a.reason && <div className="reason">{a.reason}</div>}
                </div>
                <span className={`status-pill ${statusClass(a.status)}`}>
                  <span className="dot" />
                  {statusLabel(a.status)}
                </span>
                <div className="appt-actions">
                  {(a.status === 'Scheduled' || a.status === 'Waiting') && (
                    <button
                      type="button"
                      className="btn-ghost"
                      disabled={busyId === a.id}
                      onClick={() => void onCheckIn(a.id)}
                    >
                      Check in
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => navigate(`/patients/${a.patientId}/chart`)}
                  >
                    Chart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="week-view panel-card">
          <div className="week-nav">
            <button type="button" className="btn-ghost" onClick={() => setWeekAnchor(addDays(weekAnchor, -7))}>
              ← Prev
            </button>
            <span>
              {toDateKey(weekDays[0])} – {toDateKey(weekDays[4])}
            </span>
            <button type="button" className="btn-ghost" onClick={() => setWeekAnchor(addDays(weekAnchor, 7))}>
              Next →
            </button>
          </div>
          <div className="week-grid">
            {weekDays.map((day) => {
              const key = toDateKey(day);
              const dayItems = filtered.filter((a) => a.appointmentDate === key);
              return (
                <div key={key} className="week-col">
                  <div className="week-col-head">
                    {day.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  {dayItems.length === 0 ? (
                    <div className="empty small">—</div>
                  ) : (
                    dayItems.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className={`week-chip ${statusClass(a.status)}`}
                        onClick={() => navigate(`/patients/${a.patientId}/chart`)}
                      >
                        <span className="t">{formatTime(a.startTime)}</span>
                        <span className="n">{a.patientName}</span>
                      </button>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
