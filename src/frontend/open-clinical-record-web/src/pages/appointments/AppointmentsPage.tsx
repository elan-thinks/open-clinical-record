import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listAppointments,
  updateAppointmentStatus,
  type Appointment,
} from '../../services/appointmentsApi';
import './AppointmentsPage.css';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'CheckedIn', label: 'Checked in' },
  { id: 'Waiting', label: 'Waiting' },
  { id: 'Scheduled', label: 'Scheduled' },
  { id: 'Cancelled', label: 'Cancelled' },
] as const;

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const GRID_START_MIN = 8 * 60;
const PX_PER_MIN = 1;

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatLongDate(iso: string): string {
  const d = parseIsoDate(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatMonthTitle(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(t: string): string {
  return t.length >= 5 ? t.slice(0, 5) : t;
}

function timeToMinutes(t: string): number {
  const parts = t.split(':').map(Number);
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

function statusColor(status: string): string {
  switch (status) {
    case 'CheckedIn':
    case 'InProgress':
      return '#3ddc97';
    case 'Waiting':
      return '#eab35a';
    case 'Scheduled':
      return '#5b9fd4';
    case 'Cancelled':
    case 'NoShow':
      return '#e8778a';
    default:
      return '#9b7ed9';
  }
}

function buildMonthCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let i = 0; i < startPad; i++) {
    cells.push({
      date: new Date(year, month - 1, prevDays - startPad + i + 1),
      inMonth: false,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({
      date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
      inMonth: false,
    });
  }
  return cells;
}

export function AppointmentsPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(toIsoDate(new Date()));
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selected = parseIsoDate(date);
  const [calYear, setCalYear] = useState(selected.getFullYear());
  const [calMonth, setCalMonth] = useState(selected.getMonth());

  useEffect(() => {
    setCalYear(selected.getFullYear());
    setCalMonth(selected.getMonth());
  }, [date]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await listAppointments(date));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = items;
    if (filter !== 'all') {
      list = list.filter((a) => a.status === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.patientName.toLowerCase().includes(q) ||
          a.medicalRecordNumber.toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, filter, search]);

  const monthCells = useMemo(() => buildMonthCells(calYear, calMonth), [calYear, calMonth]);

  async function setStatus(id: string, status: string) {
    setError(null);
    try {
      await updateAppointmentStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    }
  }

  function shiftDay(delta: number) {
    const d = parseIsoDate(date);
    d.setDate(d.getDate() + delta);
    setDate(toIsoDate(d));
  }

  function goToday() {
    setDate(toIsoDate(new Date()));
  }

  return (
    <div className="appt-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-sub">Today · {items.length} scheduled · List or calendar view</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/appointments/new')}>
          + New appointment
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="toolbar">
        <div className="date-chip">
          <span aria-hidden>📅</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <input
          className="search-box"
          placeholder="Search patient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
        <div className="view-toggle">
          <button
            type="button"
            className={`view-btn${view === 'list' ? ' active' : ''}`}
            onClick={() => setView('list')}
          >
            List
          </button>
          <button
            type="button"
            className={`view-btn${view === 'calendar' ? ' active' : ''}`}
            onClick={() => setView('calendar')}
          >
            Calendar
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="panel">
          {loading ? (
            <div className="empty">Loading appointments...</div>
          ) : filtered.length === 0 ? (
            <div className="empty">No appointments for this date.</div>
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
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>{formatTime(a.startTime)}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{a.patientName}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>
                        {a.medicalRecordNumber}
                      </div>
                    </td>
                    <td>{a.appointmentType}</td>
                    <td>{a.providerName ?? '-'}</td>
                    <td>
                      <span className={`status-pill status-${a.status}`}>
                        <span className="dot" />
                        {a.status === 'CheckedIn' ? 'Checked in' : a.status}
                      </span>
                    </td>
                    <td>
                      {(a.status === 'Scheduled' || a.status === 'Waiting') && (
                        <button
                          type="button"
                          className="action-link"
                          onClick={() => void setStatus(a.id, 'CheckedIn')}
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
                      {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                        <button
                          type="button"
                          className="action-link"
                          onClick={() => void setStatus(a.id, 'Cancelled')}
                        >
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
      ) : (
        <div className="layout-cal">
          <aside className="side-panel">
            <div>
              <div className="mini-cal-head">
                <div className="mini-cal-title">{formatMonthTitle(calYear, calMonth)}</div>
                <div className="mini-nav">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(calYear, calMonth - 1, 1);
                      setCalYear(d.getFullYear());
                      setCalMonth(d.getMonth());
                    }}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date(calYear, calMonth + 1, 1);
                      setCalYear(d.getFullYear());
                      setCalMonth(d.getMonth());
                    }}
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="dow">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={`${d}-${i}`}>{d}</span>
                ))}
              </div>
              <div className="days">
                {monthCells.map((cell, i) => {
                  const iso = toIsoDate(cell.date);
                  const selectedDay = iso === date;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`day-cell${cell.inMonth ? '' : ' other'}${selectedDay ? ' selected' : ''}`}
                      onClick={() => setDate(iso)}
                    >
                      {cell.date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="queue-title">Today&apos;s queue</div>
              {loading ? (
                <div className="empty" style={{ padding: 8 }}>
                  Loading...
                </div>
              ) : items.length === 0 ? (
                <div className="empty" style={{ padding: 8 }}>
                  No appointments
                </div>
              ) : (
                items.map((a) => (
                  <div
                    key={a.id}
                    className="queue-item"
                    onClick={() => navigate(`/patients/${a.patientId}/chart`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') navigate(`/patients/${a.patientId}/chart`);
                    }}
                  >
                    <span className="queue-dot" style={{ background: statusColor(a.status) }} />
                    <span className="queue-time">{formatTime(a.startTime)}</span>
                    <div>
                      <div className="queue-name">{a.patientName}</div>
                      <div className="queue-meta">
                        {a.appointmentType} ·{' '}
                        {a.status === 'CheckedIn' ? 'Checked in' : a.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          <div className="cal-main">
            <div className="cal-toolbar">
              <button type="button" className="btn-ghost" onClick={() => shiftDay(-1)}>
                ‹
              </button>
              <div className="cal-date-label">{formatLongDate(date)}</div>
              <button type="button" className="btn-ghost" onClick={() => shiftDay(1)}>
                ›
              </button>
              <button type="button" className="btn-ghost" onClick={goToday}>
                Today
              </button>
            </div>

            <div className="cal-body">
              <div className="time-grid">
                {HOURS.map((h) => (
                  <div key={h} className="hour-row">
                    <div className="hour-label">
                      {h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}
                    </div>
                    <div className="hour-track" />
                  </div>
                ))}
                <div className="blocks-layer">
                  {filtered.map((a) => {
                    const start = timeToMinutes(a.startTime);
                    const top = (start - GRID_START_MIN) * PX_PER_MIN;
                    const height = Math.max(a.durationMinutes * PX_PER_MIN, 36);
                    if (top < -30 || top > HOURS.length * 60) return null;
                    return (
                      <div
                        key={a.id}
                        className={`appt-block block-${a.status}`}
                        style={{ top, height }}
                        onClick={() => navigate(`/patients/${a.patientId}/chart`)}
                        role="button"
                        tabIndex={0}
                        title={`${a.patientName} · ${a.status}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') navigate(`/patients/${a.patientId}/chart`);
                        }}
                      >
                        <div className="t">{formatTime(a.startTime)}</div>
                        <div className="n">{a.patientName}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="legend">
              <span>
                <i style={{ background: '#3ddc97' }} /> Checked in
              </span>
              <span>
                <i style={{ background: '#eab35a' }} /> Waiting
              </span>
              <span>
                <i style={{ background: '#5b9fd4' }} /> Scheduled
              </span>
              <span>
                <i style={{ background: '#9b7ed9' }} /> In progress
              </span>
              <span>
                <i style={{ background: '#e8778a' }} /> Cancelled
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
