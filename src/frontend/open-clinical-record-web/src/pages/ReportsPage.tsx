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

  return (
    <div className="reports-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-sub">
            Operational summaries for clinic volume — export CSV for offline review.
          </p>
        </div>
        <div className="reports-actions">
          <button type="button" className="btn-ghost" onClick={() => void load()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <button type="button" className="btn-ghost" onClick={exportSummaryCsv} disabled={!stats}>
            Export summary CSV
          </button>
          <button type="button" className="btn-primary" onClick={exportDayCsv} disabled={dayAppts.length === 0}>
            Export day schedule CSV
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="reports-toolbar">
        <label className="reports-date">
          Appointment date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <div className="reports-stat-row">
        <div className="reports-stat">
          <div className="rs-num">{loading ? '—' : dayAppts.length}</div>
          <div className="rs-label">Appointments (day)</div>
        </div>
        <div className="reports-stat">
          <div className="rs-num">{stats ? stats.appointmentsToday : '—'}</div>
          <div className="rs-label">Today (clinic)</div>
        </div>
        <div className="reports-stat">
          <div className="rs-num">{stats ? stats.waitingCount : '—'}</div>
          <div className="rs-label">Waiting / scheduled</div>
        </div>
        <div className="reports-stat">
          <div className="rs-num">{stats ? stats.checkedInCount : '—'}</div>
          <div className="rs-label">Checked in</div>
        </div>
        <div className="reports-stat">
          <div className="rs-num">{stats ? stats.activePatients : '—'}</div>
          <div className="rs-label">Active patients</div>
        </div>
        <div className="reports-stat">
          <div className="rs-num">{stats ? stats.visitsThisWeek : '—'}</div>
          <div className="rs-label">Visits this week</div>
        </div>
      </div>

      <div className="reports-grid">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Status breakdown — {date}</div>
          </div>
          {loading ? (
            <div className="empty">Loading…</div>
          ) : statusBreakdown.length === 0 ? (
            <div className="empty">No appointments for this date.</div>
          ) : (
            <ul className="breakdown-list">
              {statusBreakdown.map(([status, count]) => (
                <li key={status}>
                  <span>{status}</span>
                  <strong>{count}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Day schedule</div>
          </div>
          {loading ? (
            <div className="empty">Loading…</div>
          ) : dayAppts.length === 0 ? (
            <div className="empty">No rows to show.</div>
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
                      <td>{formatTime(a.startTime)}</td>
                      <td>
                        <div className="p-name">{a.patientName}</div>
                        <div className="p-id">{a.medicalRecordNumber}</div>
                      </td>
                      <td>{a.appointmentType}</td>
                      <td>{a.status}</td>
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
