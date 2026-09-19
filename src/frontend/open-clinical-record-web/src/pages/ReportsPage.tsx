import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getDashboardStats,
  listAppointments,
  type Appointment,
  type DashboardStats,
} from '../services/appointmentsApi';
import './ReportsPage.css';

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(t: string): string {
  return t.length >= 5 ? t.slice(0, 5) : t;
}

function formatPrettyDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function downloadCsv(filename: string, rows: string[][]) {
  const body = rows.map((r) => r.map((c) => csvEscape(c ?? '')).join(',')).join('\n');
  const blob = new Blob([body], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const STATUS_COLORS: Record<string, string> = {
  Scheduled: '#5b9fd4',
  Waiting: '#eab35a',
  CheckedIn: '#3ddc97',
  InProgress: '#3ddc97',
  Completed: '#29a874',
  Cancelled: '#e8778a',
  NoShow: '#e8778a',
};

export function ReportsPage() {
  const today = toIsoDate(new Date());
  const [date, setDate] = useState(today);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dayAppts, setDayAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, list] = await Promise.all([getDashboardStats(), listAppointments(date)]);
      setStats(s);
      setDayAppts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void load();
  }, [load]);

  const statusBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of dayAppts) {
      map.set(a.status, (map.get(a.status) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [dayAppts]);

  const maxStatus = Math.max(1, ...statusBreakdown.map(([, c]) => c));

  function exportDayCsv() {
    const rows: string[][] = [
      ['Time', 'Patient', 'MRN', 'Type', 'Provider', 'Status', 'Reason'],
      ...dayAppts.map((a) => [
        formatTime(a.startTime),
        a.patientName,
        a.medicalRecordNumber,
        a.appointmentType,
        a.providerName ?? '',
        a.status,
        a.reason ?? '',
      ]),
    ];
    downloadCsv(`ocr-appointments-${date}.csv`, rows);
  }

  function exportSummaryCsv() {
    const rows: string[][] = [
      ['Metric', 'Value'],
      ['Report date', date],
      ['Appointments (selected day)', String(dayAppts.length)],
      ['Appointments today (live)', String(stats?.appointmentsToday ?? 0)],
      ['Waiting / scheduled today', String(stats?.waitingCount ?? 0)],
      ['Checked in today', String(stats?.checkedInCount ?? 0)],
      ['Active patients', String(stats?.activePatients ?? 0)],
      ['Visits this week', String(stats?.visitsThisWeek ?? 0)],
      ['Patients with allergy on chart', String(stats?.openChartAlerts ?? 0)],
      ...statusBreakdown.map(([status, count]) => [`Day status: ${status}`, String(count)]),
    ];
    downloadCsv(`ocr-summary-${date}.csv`, rows);
  }

  const cards = [
    { num: loading ? '—' : dayAppts.length, label: 'Appointments', sub: 'selected day', tone: 'teal' },
    { num: stats?.appointmentsToday ?? '—', label: 'Today', sub: 'clinic-wide', tone: 'blue' },
    { num: stats?.waitingCount ?? '—', label: 'Waiting', sub: 'queue pressure', tone: 'amber' },
    { num: stats?.checkedInCount ?? '—', label: 'Checked in', sub: 'ready now', tone: 'teal' },
    { num: stats?.activePatients ?? '—', label: 'Active patients', sub: 'registry', tone: 'blue' },
    { num: stats?.visitsThisWeek ?? '—', label: 'Visits week', sub: 'clinical volume', tone: 'amber' },
  ];

  return (
    <div className="reports-page">
      <div className="reports-hero">
        <div>
          <div className="reports-kicker">Operations</div>
          <h1 className="page-title">Clinic reports</h1>
          <p className="page-sub">
            Live volume for <strong>{formatPrettyDate(date)}</strong> — export when you need offline review.
          </p>
        </div>
        <div className="reports-actions">
          <button type="button" className="btn-ghost" onClick={() => void load()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <button type="button" className="btn-ghost" onClick={exportSummaryCsv} disabled={!stats}>
            Summary CSV
          </button>
          <button type="button" className="btn-primary" onClick={exportDayCsv} disabled={dayAppts.length === 0}>
            Schedule CSV
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="reports-toolbar">
        <label className="reports-date">
          <span>Report date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button type="button" className="btn-ghost" onClick={() => setDate(today)}>
          Jump to today
        </button>
      </div>

      <div className="reports-stat-row">
        {cards.map((c) => (
          <div key={c.label} className={`reports-stat tone-${c.tone}`}>
            <div className="rs-num">{c.num}</div>
            <div className="rs-label">{c.label}</div>
            <div className="rs-sub">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="reports-grid">
        <div className="panel reports-panel">
          <div className="panel-head">
            <div className="panel-title">Status mix</div>
            <span className="panel-meta">{dayAppts.length} total</span>
          </div>
          {loading ? (
            <div className="empty">Loading…</div>
          ) : statusBreakdown.length === 0 ? (
            <div className="empty">No appointments for this date.</div>
          ) : (
            <ul className="breakdown-list">
              {statusBreakdown.map(([status, count]) => {
                const pct = Math.round((count / maxStatus) * 100);
                const color = STATUS_COLORS[status] ?? '#6d8577';
                return (
                  <li key={status}>
                    <div className="bd-top">
                      <span className="bd-status" style={{ color }}>
                        {status}
                      </span>
                      <strong>{count}</strong>
                    </div>
                    <div className="bd-bar">
                      <div className="bd-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="panel reports-panel">
          <div className="panel-head">
            <div className="panel-title">Day schedule</div>
            <span className="panel-meta">{formatPrettyDate(date)}</span>
          </div>
          {loading ? (
            <div className="empty">Loading…</div>
          ) : dayAppts.length === 0 ? (
            <div className="empty">No rows to show for this day.</div>
          ) : (
            <div className="reports-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Patient</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dayAppts.map((a) => (
                    <tr key={a.id}>
                      <td className="time-cell">{formatTime(a.startTime)}</td>
                      <td>
                        <div className="p-name">{a.patientName}</div>
                        <div className="p-id">{a.medicalRecordNumber}</div>
                      </td>
                      <td>{a.appointmentType}</td>
                      <td>
                        <span
                          className="status-pill"
                          style={{
                            color: STATUS_COLORS[a.status] ?? undefined,
                            borderColor: `${STATUS_COLORS[a.status] ?? '#6d8577'}44`,
                            background: `${STATUS_COLORS[a.status] ?? '#6d8577'}18`,
                          }}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
