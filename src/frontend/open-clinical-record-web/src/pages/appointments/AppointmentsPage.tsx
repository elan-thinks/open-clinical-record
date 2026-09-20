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

type FilterId = (typeof FILTERS)[number]['id'];

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

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeekMon(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>('all');
  const [query, setQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => toYmd(new Date()));
  const [view, setView] = useState<'list' | 'day' | 'week'>('list');
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeekMon(new Date()));
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAppointments();
      setItems(Array.isArray(data) ? data : []);
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
    if (view === 'list' || view === 'day') {
      list = list.filter((a) => a.appointmentDate === selectedDate);
    }
    if (view === 'week') {
      const days = new Set(Array.from({ length: 5 }, (_, i) => toYmd(addDays(weekAnchor, i))));
      list = list.filter((a) => days.has(a.appointmentDate));
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          (a.medicalRecordNumber ?? '').toLowerCase().includes(q) ||
          (a.providerName ?? '').toLowerCase().includes(q) ||
          (a.reason ?? '').toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [items, filter, query, selectedDate, view, weekAnchor]);

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

  const weekDays = useMemo(() => Array.from({ length: 5 }, (_, i) => addDays(weekAnchor, i)), [weekAnchor]);

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

      <div className="toolbar">
        <label className="date-chip">
          <Icon name="cal" size={15} />
          <span>{selectedDate}</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              if (e.target.value) setWeekAnchor(startOfWeekMon(new Date(e.target.value + 'T12:00:00')));
            }}
          />
        </label>
        <div className="search-box">
          <Icon name="search" size={15} />
          <input
            type="search"
            placeholder="Search patient, MRN…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="filter-pills">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filter-pill${filter === f.id ? ' active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="cal-mode">
          {(['list', 'day', 'week'] as const).map((v) => (
            <button key={v} type="button" className={view === v ? 'active' : ''} onClick={() => setView(v)}>
              {v === 'list' ? 'List' : v === 'day' ? 'Day' : 'Week'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="empty">Loading appointments…</div>
      ) : view === 'list' ? (
        <div className="appt-table-wrap">
          {filtered.length === 0 ? (
            <div className="empty">No appointments for this date/filter.</div>
          ) : (
            <table className="appt-table">
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
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td className="ab-time">{formatTime(a.startTime)}</td>
                    <td>
                      <div className="ab-name">{a.patientName}</div>
                      <div className="ab-type">{a.medicalRecordNumber}</div>
                    </td>
                    <td>{a.appointmentType}</td>
                    <td>{a.providerName ?? '—'}</td>
                    <td>
                      <span className={`status-pill ${statusClass(a.status)}`}>
                        <span className="dot" />
                        {statusLabel(a.status)}
                      </span>
                    </td>
                    <td className="row-actions">
                      {(a.status === 'Scheduled' || a.status === 'Waiting') && (
                        <button
                          type="button"
                          className="action-link"
                          disabled={busyId === a.id}
                          onClick={() => void onCheckIn(a.id)}
                        >
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : view === 'day' ? (
        <div className="cal-layout">
          <div className="cal-main">
            <div className="day-timeline">
              {Array.from({ length: 10 }, (_, i) => 8 + i).map((h) => (
                <div key={h} className="hour-line">
                  <span className="hour-lbl">{String(h).padStart(2, '0')}:00</span>
                  <div className="day-track">
                    {filtered
                      .filter((a) => parseInt(a.startTime.split(':')[0] ?? '0', 10) === h)
                      .map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          className={`appt-block ${statusClass(a.status)}`}
                          onClick={() => navigate(`/patients/${a.patientId}/chart`)}
                        >
                          <span className="ab-time">{formatTime(a.startTime)}</span>
                          <span className="ab-name">{a.patientName}</span>
                          <span className="ab-type">{a.appointmentType}</span>
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <aside className="cal-sidebar">
            <div className="sidebar-title">Queue</div>
            {filtered.length === 0 ? (
              <div className="empty">No appointments</div>
            ) : (
              filtered.map((a) => (
                <div key={a.id} className="queue-item">
                  <div className="ab-time">{formatTime(a.startTime)}</div>
                  <div className="ab-name">{a.patientName}</div>
                  <span className={`status-pill ${statusClass(a.status)}`}>
                    <span className="dot" />
                    {statusLabel(a.status)}
                  </span>
                </div>
              ))
            )}
          </aside>
        </div>
      ) : (
        <div className="week-view">
          <div className="cal-toolbar">
            <div className="cal-nav-group">
              <button type="button" className="cal-nav-btn" onClick={() => setWeekAnchor(addDays(weekAnchor, -7))}>
                ←
              </button>
              <span className="cal-date-label">
                {toYmd(weekDays[0])} – {toYmd(weekDays[4])}
              </span>
              <button type="button" className="cal-nav-btn" onClick={() => setWeekAnchor(addDays(weekAnchor, 7))}>
                →
              </button>
            </div>
          </div>
          <div className="week-grid">
            {weekDays.map((day) => {
              const key = toYmd(day);
              const dayItems = filtered.filter((a) => a.appointmentDate === key);
              return (
                <div key={key} className="week-col">
                  <div className="week-col-head">
                    {day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}
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
