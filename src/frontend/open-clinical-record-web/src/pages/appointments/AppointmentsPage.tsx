import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  listAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
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
  { id: 'Completed', label: 'Completed' },
] as const;

const CAN_RESCHEDULE = new Set(['Scheduled', 'Waiting', 'Cancelled', 'NoShow']);

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
  // Full clinic week: Mon → Sun (so Saturday/Sunday are visible, e.g. 27)
  return [0, 1, 2, 3, 4, 5, 6].map((i) => {
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
  const b = days[days.length - 1];
  if (a.getMonth() === b.getMonth()) {
    return `${a.getDate()} – ${b.getDate()} ${a.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}`;
  }
  return `${a.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – ${b.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

/** Pack overlapping appointments into side-by-side lanes so near-time blocks do not stack on top of each other. */
function layoutLanes(list: Appointment[]): Map<string, { lane: number; lanes: number }> {
  const sorted = [...list].sort((a, b) => {
    const d = timeMins(a.startTime) - timeMins(b.startTime);
    return d !== 0 ? d : a.durationMinutes - b.durationMinutes;
  });
  const result = new Map<string, { lane: number; lanes: number }>();
  for (const a of sorted) {
    const aStart = timeMins(a.startTime);
    const aEnd = aStart + Math.max(a.durationMinutes || 30, 15);
    const overlapping = sorted.filter((b) => {
      const bStart = timeMins(b.startTime);
      const bEnd = bStart + Math.max(b.durationMinutes || 30, 15);
      return aStart < bEnd && bStart < aEnd;
    });
    const lanes = Math.max(1, overlapping.length);
    const clusterSorted = overlapping.sort((x, y) => {
      const d = timeMins(x.startTime) - timeMins(y.startTime);
      return d !== 0 ? d : x.id.localeCompare(y.id);
    });
    const lane = clusterSorted.findIndex((x) => x.id === a.id);
    result.set(a.id, { lane: Math.max(0, lane), lanes });
  }
  return result;
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
  if (status === 'Completed') return 'completed';
  if (status === 'Scheduled') return 'scheduled';
  return 'nurse';
}
function statusLabel(status: string): string {
  if (status === 'CheckedIn') return 'Checked in';
  if (status === 'InProgress') return 'In progress';
  if (status === 'NoShow') return 'No-show';
  return status;
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
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [calMode, setCalMode] = useState<'day' | 'week'>('week');
  const [items, setItems] = useState<Appointment[]>([]);
  const [weekItems, setWeekItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelBusy, setCancelBusy] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rsDate, setRsDate] = useState('');
  const [rsTime, setRsTime] = useState('09:30');
  const [rsDuration, setRsDuration] = useState(30);
  const [rsProvider, setRsProvider] = useState('');
  const [rsReason, setRsReason] = useState('');
  const [rsBusy, setRsBusy] = useState(false);
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

  async function reload() {
    if (view === 'calendar' && calMode === 'week') await loadWeek();
    else await loadDay();
  }

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
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    }
  }

  function openCancel(a: Appointment) {
    setCancelTarget(a);
    setCancelReason('');
    setError(null);
  }

  function openReschedule(a: Appointment) {
    setRescheduleTarget(a);
    setRsDate(a.appointmentDate);
    setRsTime(formatTime(a.startTime));
    setRsDuration(a.durationMinutes || 30);
    setRsProvider(a.providerName || '');
    setRsReason('');
    setError(null);
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
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed');
    } finally {
      setCancelBusy(false);
    }
  }

  async function confirmReschedule() {
    if (!rescheduleTarget) return;
    if (!rsDate || !rsTime) {
      setError('Date and time are required to reschedule.');
      return;
    }
    setRsBusy(true);
    setError(null);
    try {
      await rescheduleAppointment(rescheduleTarget.id, {
        appointmentDate: rsDate,
        startTime: rsTime.length === 5 ? `${rsTime}:00` : rsTime,
        durationMinutes: rsDuration,
        providerName: rsProvider.trim() || undefined,
        reason: rsReason.trim() || undefined,
      });
      setRescheduleTarget(null);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reschedule failed');
    } finally {
      setRsBusy(false);
    }
  }

  function renderBlock(
    a: Appointment,
    compact?: boolean,
    laneInfo?: { lane: number; lanes: number },
  ) {
    const { top, height } = blockStyle(a.startTime, a.durationMinutes);
    if (top < -20 || top > HOURS.length * HOUR_PX) return null;
    const lanes = Math.max(1, laneInfo?.lanes ?? 1);
    const lane = laneInfo?.lane ?? 0;
    const style: CSSProperties = {
      top,
      height,
      left: `calc(${(lane / lanes) * 100}% + 3px)`,
      width: `calc(${100 / lanes}% - 6px)`,
      right: 'auto',
    };
    return (
      <div
        key={a.id}
        className={`appt-block ${statusClass(a.status)}${lanes > 1 ? ' stacked' : ''}`}
        style={style}
        onClick={() => navigate(`/patients/${a.patientId}/chart`)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') navigate(`/patients/${a.patientId}/chart`);
        }}
        role="button"
        tabIndex={0}
        title={`${a.patientName} · ${statusLabel(a.status)} · ${formatTime(a.startTime)}`}
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
          <p className="page-sub">
            {formatChip(date)} · {scheduledCount} shown · List or calendar
          </p>
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
                    <td className="actions">
                      {(a.status === 'Scheduled' || a.status === 'Waiting') && (
                        <button type="button" className="action-link" onClick={() => void setStatus(a.id, 'CheckedIn')}>
                          Check in
                        </button>
                      )}
                      {CAN_RESCHEDULE.has(a.status) && (
                        <button type="button" className="action-link" onClick={() => openReschedule(a)}>
                          Reschedule
                        </button>
                      )}
                      <button type="button" className="action-link" onClick={() => navigate(`/patients/${a.patientId}/chart`)}>
                        Chart
                      </button>
                      {a.status !== 'Cancelled' && a.status !== 'Completed' && (
                        <button type="button" className="action-link muted" onClick={() => openCancel(a)}>
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
              <div className="upcoming-title">Today&apos;s queue</div>
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
                    {(() => {
                      const lanes = layoutLanes(filteredDay);
                      return filteredDay.map((a) => renderBlock(a, false, lanes.get(a.id)));
                    })()}
                  </div>
                </div>
              ) : (
                <div className="week-wrap">
                  <div className="week-header">
                    <div />
                    {days.map((d) => {
                      const iso = toIsoDate(d);
                      const dow = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][
                        d.getDay() === 0 ? 6 : d.getDay() - 1
                      ];
                      return (
                        <div
                          key={iso}
                          className={`wh-day${iso === todayIso ? ' today' : ''}${iso === date ? ' selected' : ''}`}
                          onClick={() => setDate(iso)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setDate(iso);
                          }}
                        >
                          <div className="wh-dow">{dow}</div>
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
                      const lanes = layoutLanes(dayList);
                      return (
                        <div key={iso} className={`week-col${iso === todayIso ? ' today-col' : ''}`}>
                          {HOURS.map((h) => (
                            <div key={h} className="hour-line" />
                          ))}
                          {iso === todayIso && nowLineTop != null && <div className="now-line" style={{ top: nowLineTop }} />}
                          {dayList.map((a) => renderBlock(a, true, lanes.get(a.id)))}
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

      {cancelTarget && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-title">Cancel appointment</div>
            <div className="modal-sub">
              {cancelTarget.patientName} · {formatTime(cancelTarget.startTime)} · {cancelTarget.appointmentType}
            </div>
            <label className="modal-label" htmlFor="appt-cancel-reason">
              Reason <span className="req">*</span>
            </label>
            <textarea
              id="appt-cancel-reason"
              className="modal-textarea"
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Patient requested, provider unavailable…"
              autoFocus
            />
            <div className="modal-actions">
              <button type="button" className="modal-btn ghost" disabled={cancelBusy} onClick={() => setCancelTarget(null)}>
                Keep appointment
              </button>
              <button
                type="button"
                className="modal-btn danger"
                disabled={cancelBusy || !cancelReason.trim()}
                onClick={() => void confirmCancel()}
              >
                {cancelBusy ? 'Cancelling…' : 'Confirm cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {rescheduleTarget && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card modal-wide">
            <div className="modal-title">Reschedule appointment</div>
            <div className="modal-sub">
              {rescheduleTarget.patientName} · currently {rescheduleTarget.appointmentDate}{' '}
              {formatTime(rescheduleTarget.startTime)}
            </div>
            <div className="modal-grid">
              <div>
                <label className="modal-label" htmlFor="rs-date">
                  New date <span className="req">*</span>
                </label>
                <input id="rs-date" className="modal-input" type="date" value={rsDate} onChange={(e) => setRsDate(e.target.value)} />
              </div>
              <div>
                <label className="modal-label" htmlFor="rs-time">
                  New time <span className="req">*</span>
                </label>
                <input id="rs-time" className="modal-input" type="time" value={rsTime} onChange={(e) => setRsTime(e.target.value)} />
              </div>
              <div>
                <label className="modal-label" htmlFor="rs-dur">
                  Duration (min)
                </label>
                <input
                  id="rs-dur"
                  className="modal-input"
                  type="number"
                  min={15}
                  max={240}
                  step={15}
                  value={rsDuration}
                  onChange={(e) => setRsDuration(Number(e.target.value) || 30)}
                />
              </div>
              <div>
                <label className="modal-label" htmlFor="rs-prov">
                  Provider
                </label>
                <input id="rs-prov" className="modal-input" value={rsProvider} onChange={(e) => setRsProvider(e.target.value)} />
              </div>
            </div>
            <label className="modal-label" htmlFor="rs-reason">
              Note (optional)
            </label>
            <textarea
              id="rs-reason"
              className="modal-textarea"
              rows={2}
              value={rsReason}
              onChange={(e) => setRsReason(e.target.value)}
              placeholder="Why the slot changed…"
            />
            <div className="modal-actions">
              <button type="button" className="modal-btn ghost" disabled={rsBusy} onClick={() => setRescheduleTarget(null)}>
                Close
              </button>
              <button
                type="button"
                className="modal-btn primary"
                disabled={rsBusy || !rsDate || !rsTime}
                onClick={() => void confirmReschedule()}
              >
                {rsBusy ? 'Saving…' : 'Save new slot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
