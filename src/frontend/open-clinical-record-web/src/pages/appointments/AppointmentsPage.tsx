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
const HOUR_PX = 72;
const GRID_START = 8 * 60;

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function parseIso(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function addDays(iso: string, n: number): string {
  const d = parseIso(iso);
  d.setDate(d.getDate() + n);
  return toIsoDate(d);
}
function weekMonday(iso: string): Date {
  const d = parseIso(iso);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}
function weekDays(iso: string): Date[] {
  const mon = weekMonday(iso);
  return [0, 1, 2, 3, 4].map((i) => {
    const x = new Date(mon);
    x.setDate(mon.getDate() + i);
    return x;
  });
}
function formatLong(iso: string): string {
  return parseIso(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
function formatChip(iso: string): string {
  return parseIso(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
function formatWeekRange(iso: string): string {
  const days = weekDays(iso);
  const a = days[0];
  const b = days[4];
  if (a.getMonth() === b.getMonth()) {
    return `${a.getDate()} – ${b.getDate()} ${a.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
  }
  return `${a.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – ${b.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`;
}
function formatMonth(y: number, m: number): string {
  return new Date(y, m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}
function formatTime(t: string): string {
  return t.length >= 5 ? t.slice(0, 5) : t;
}
function timeMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
function statusClass(status: string): string {
  if (status === 'CheckedIn' || status === 'InProgress') return 'checked';
  if (status === 'Waiting') return 'waiting';
  if (status === 'Cancelled' || status === 'NoShow') return 'cancelled';
  if (status === 'Scheduled') return 'scheduled';
  return 'nurse';
}
function statusLabel(status: string): string {
  return status === 'CheckedIn' ? 'Checked in' : status;
}
function hourLabel(h: number): string {
  if (h === 12) return '12 PM';
  if (h > 12) return `${h - 12} PM`;
  return `${h} AM`;
}
function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const cells: { date: Date; muted: boolean }[] = [];
  for (let i = 0; i < startPad; i++) {
    cells.push({ date: new Date(year, month - 1, prevDays - startPad + i + 1), muted: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), muted: false });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), muted: true });
  }
  return cells;
}
function blockStyle(startTime: string, durationMinutes: number) {
  const start = timeMins(startTime);
  const top = ((start - GRID_START) / 60) * HOUR_PX;
  const height = Math.max((durationMinutes / 60) * HOUR_PX - 3, 36);
  return { top, height };
}

export function AppointmentsPage() {
  const navigate = useNavigate();
  const todayIso = toIsoDate(new Date());
  const [date, setDate] = useState(todayIso);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'calendar'>('calendar');
  const [calMode, setCalMode] = useState<'day' | 'week'>('week');
  const [items, setItems] = useState<Appointment[]>([]);
  const [weekItems, setWeekItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selected = parseIso(date);
  const [calYear, setCalYear] = useState(selected.getFullYear());
  const [calMonth, setCalMonth] = useState(selected.getMonth());
  const days = useMemo(() => weekDays(date), [date]);

  useEffect(() => {
    setCalYear(selected.getFullYear());
    setCalMonth(selected.getMonth());
  }, [date]);

  const loadDay = useCallback(async () => {
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

  const loadWeek = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isos = weekDays(date).map((d) => toIsoDate(d));
      const lists = await Promise.all(isos.map((iso) => listAppointments(iso)));
      setWeekItems(lists.flat());
      const dayIdx = isos.indexOf(date);
      setItems(dayIdx >= 0 ? lists[dayIdx] : lists[0] ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (view === 'calendar' && calMode === 'week') void loadWeek();
    else void loadDay();
  }, [view, calMode, loadDay, loadWeek]);

  const filteredDay = useMemo(() => {
    let list = items;
    if (filter !== 'all') list = list.filter((a) => a.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) => a.patientName.toLowerCase().includes(q) || a.medicalRecordNumber.toLowerCase().includes(q),
      );
    }
    return list;
  }, [items, filter, search]);

  const filteredWeek = useMemo(() => {
    let list = weekItems;
    if (filter !== 'all') list = list.filter((a) => a.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) => a.patientName.toLowerCase().includes(q) || a.medicalRecordNumber.toLowerCase().includes(q),
      );
    }
    return list;
  }, [weekItems, filter, search]);

  const monthCells = useMemo(() => buildMonth(calYear, calMonth), [calYear, calMonth]);

  const nowLineTop = useMemo(() => {
    if (calMode === 'day' && date !== todayIso) return null;
    if (calMode === 'week' && !days.some((d) => toIsoDate(d) === todayIso)) return null;
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    if (mins < GRID_START || mins > 17 * 60) return null;
    return (mins - GRID_START) * (HOUR_PX / 60);
  }, [date, todayIso, calMode, days]);

  async function setStatus(id: string, status: string) {
    setError(null);
    try {
      await updateAppointmentStatus(id, status);
      if (calMode === 'week' && view === 'calendar') await loadWeek();
      else await loadDay();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    }
  }

  function renderBlock(a: Appointment, compact?: boolean) {
    const { top, height } = blockStyle(a.startTime, a.durationMinutes);
    if (top < -20 || top > HOURS.length * HOUR_PX) return null;
    return (
      <div
        key={a.id}
        className={`appt-block ${statusClass(a.status)}`}
        style={{ top, height }}
        onClick={() => navigate(`/patients/${a.patientId}/chart`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') navigate(`/patients/${a.patientId}/chart`);
        }}
        role="button"
        tabIndex={0}
        title={`${a.patientName} · ${statusLabel(a.status)}`}
      >
        <div className="ab-time">{formatTime(a.startTime)}</div>
        <div className="ab-name">{a.patientName}</div>
        {!compact && <div className="ab-type">{a.appointmentType}</div>}
      </div>
    );
  }

  const scheduledCount =
    view === 'calendar' && calMode === 'week' ? filteredWeek.length : filteredDay.length;

  return (
    <div className="appt-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-sub">Today · {scheduledCount} scheduled · List or calendar view</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => navigate('/appointments/new')}>
          <Icon name="cal" size={15} />
          New appointment
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="toolbar">
        <div className="date-chip">
          <Icon name="cal" size={15} />
          <span>{formatChip(date)}</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: 0, opacity: 0, position: 'absolute' }}
            id="appt-date-input"
          />
          <label htmlFor="appt-date-input" style={{ cursor: 'pointer', color: 'var(--teal)', fontSize: 12 }}>
            Change
          </label>
        </div>
        <div className="search-box">
          <Icon name="search" size={15} />
          <input placeholder="Search patient..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
        <div className="view-toggle">
          <button type="button" className={`view-btn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')}>
            List
          </button>
          <button type="button" className={`view-btn${view === 'calendar' ? ' active' : ''}`} onClick={() => setView('calendar')}>
            Calendar
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="panel">
          {loading ? (
            <div className="empty">Loading appointments...</div>
          ) : filteredDay.length === 0 ? (
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
                {filteredDay.map((a) => (
                  <tr key={a.id}>
                    <td>{formatTime(a.startTime)}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{a.patientName}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{a.medicalRecordNumber}</div>
                    </td>
                    <td>{a.appointmentType}</td>
                    <td>{a.providerName ?? '—'}</td>
                    <td>
                      <span className={`status-pill ${statusClass(a.status)}`}>
                        <span className="dot" />
                        {statusLabel(a.status)}
                      </span>
                    </td>
                    <td>
                      {(a.status === 'Scheduled' || a.status === 'Waiting') && (
                        <button type="button" className="action-link" onClick={() => void setStatus(a.id, 'CheckedIn')}>
                          Check in
                        </button>
                      )}
                      <button type="button" className="action-link" onClick={() => navigate(`/patients/${a.patientId}/chart`)}>
                        Chart
                      </button>
                      {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                        <button type="button" className="action-link muted" onClick={() => void setStatus(a.id, 'Cancelled')}>
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
        <div className="cal-layout">
          <aside className="cal-sidebar">
            <div className="mini-cal-head">
              <div className="mini-cal-title">{formatMonth(calYear, calMonth)}</div>
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
            <div className="mini-grid">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={`${d}-${i}`} className="mini-dow">
                  {d}
                </div>
              ))}
              {monthCells.map((cell, i) => {
                const iso = toIsoDate(cell.date);
                const cls = ['mini-day', cell.muted ? 'muted' : '', iso === todayIso ? 'today' : '', iso === date ? 'selected' : '']
                  .filter(Boolean)
                  .join(' ');
                return (
                  <button key={i} type="button" className={cls} onClick={() => setDate(iso)}>
                    {cell.date.getDate()}
                  </button>
                );
              })}
            </div>
            <div className="upcoming-box">
              <div className="upcoming-title">Today's queue</div>
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
                    className="upcoming-item"
                    onClick={() => navigate(`/patients/${a.patientId}/chart`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') navigate(`/patients/${a.patientId}/chart`);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <span className={`up-dot ${statusClass(a.status)}`} />
                    <span className="up-time">{formatTime(a.startTime)}</span>
                    <div>
                      <div className="up-name">{a.patientName}</div>
                      <div className="up-type">
                        {a.appointmentType} · {statusLabel(a.status)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          <div className="cal-main">
            <div className="cal-toolbar">
              <div className="cal-nav-group">
                <button
                  type="button"
                  className="cal-nav-btn"
                  onClick={() => setDate(addDays(date, calMode === 'week' ? -7 : -1))}
                >
                  ‹
                </button>
                <div className="cal-date-label">
                  {calMode === 'week' ? formatWeekRange(date) : formatLong(date)}
                </div>
                <button
                  type="button"
                  className="cal-nav-btn"
                  onClick={() => setDate(addDays(date, calMode === 'week' ? 7 : 1))}
                >
                  ›
                </button>
                <button
                  type="button"
                  className="cal-nav-btn"
                  style={{ width: 'auto', padding: '0 12px' }}
                  onClick={() => setDate(todayIso)}
                >
                  Today
                </button>
              </div>
              <div className="cal-mode">
                <button type="button" className={calMode === 'day' ? 'active' : ''} onClick={() => setCalMode('day')}>
                  Day
                </button>
                <button type="button" className={calMode === 'week' ? 'active' : ''} onClick={() => setCalMode('week')}>
                  Week
                </button>
              </div>
            </div>

            <div className="cal-scroll">
              {calMode === 'day' ? (
                <div className="day-timeline">
                  <div className="day-hours">
                    {HOURS.map((h) => (
                      <div key={h} className="hour-lbl">
                        {hourLabel(h)}
                      </div>
                    ))}
                  </div>
                  <div className="day-track">
                    {HOURS.map((h) => (
                      <div key={h} className="hour-line" />
                    ))}
                    {date === todayIso && nowLineTop != null && <div className="now-line" style={{ top: nowLineTop }} />}
                    {filteredDay.map((a) => renderBlock(a))}
                  </div>
                </div>
              ) : (
                <div className="week-wrap">
                  <div className="week-header">
                    <div />
                    {days.map((d) => {
                      const iso = toIsoDate(d);
                      return (
                        <div key={iso} className={`wh-day${iso === todayIso ? ' today' : ''}${iso === date ? ' selected' : ''}`}>
                          <div className="wh-dow">{['MON', 'TUE', 'WED', 'THU', 'FRI'][d.getDay() === 0 ? 6 : d.getDay() - 1]}</div>
                          <div className="wh-num">{d.getDate()}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="week-body">
                    <div className="week-hours">
                      {HOURS.map((h) => (
                        <div key={h} className="hour-lbl">
                          {hourLabel(h)}
                        </div>
                      ))}
                    </div>
                    {days.map((d) => {
                      const iso = toIsoDate(d);
                      const dayList = filteredWeek.filter((a) => a.appointmentDate === iso);
                      return (
                        <div key={iso} className="week-col">
                          {HOURS.map((h) => (
                            <div key={h} className="hour-line" />
                          ))}
                          {iso === todayIso && nowLineTop != null && <div className="now-line" style={{ top: nowLineTop }} />}
                          {dayList.map((a) => renderBlock(a, true))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
