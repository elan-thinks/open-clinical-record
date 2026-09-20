import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, type DashboardStats, type Appointment } from '../services/appointmentsApi';
import './DashboardPage.css';

const CIRC = 151;

function formatTime(t: string): string {
  return t.length >= 5 ? t.slice(0, 5) : t;
}

function greetingPrefix(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatLongDate(d = new Date()): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusClass(status: string): string {
  if (status === 'CheckedIn' || status === 'InProgress' || status === 'Completed') return 'checked';
  if (status === 'Waiting') return 'waiting';
  return 'scheduled';
}

function statusLabel(status: string): string {
  if (status === 'CheckedIn') return 'Checked in';
  return status;
}

function ringOffset(pct: number): number {
  const p = Math.max(0, Math.min(100, pct));
  return CIRC - (CIRC * p) / 100;
}

function primaryRole(roles: string[] | undefined): string {
  const r = roles ?? [];
  if (r.includes('Doctor') || r.includes('Clinician')) return 'Doctor';
  if (r.includes('Nurse')) return 'Nurse';
  if (r.includes('Receptionist')) return 'Receptionist';
  if (r.includes('Admin') || r.includes('Administrator')) return 'Admin';
  return r[0] ?? 'User';
}

type QuickAction = { icon: string; label: string; path: string };

function roleConfig(role: string, name: string, stats: DashboardStats | null) {
  const appt = stats?.appointmentsToday ?? 0;
  const checked = stats?.checkedInCount ?? 0;
  const waiting = stats?.waitingCount ?? 0;
  const patients = stats?.activePatients ?? 0;
  const visits = stats?.visitsThisWeek ?? 0;

  if (role === 'Nurse') {
    return {
      eyebrow: "Today's clinical support",
      hero: (
        <>
          <b>{waiting}</b> patients need support, <b>{checked}</b> ready after vitals. Keep the queue moving.
        </>
      ),
      cta: 'Record vitals',
      ctaPath: '/vitals',
      schedTitle: 'Work queue — need support',
      actTitle: 'Care activity',
      stats: [
        { num: waiting, label: 'Need vitals', sub: 'waiting now', tone: 'warning', pct: waiting ? 55 : 10 },
        { num: checked, label: 'Checked in', sub: 'ready for support', tone: 'success', pct: checked ? 70 : 15 },
        { num: appt, label: "Today's appointments", sub: 'on clinic list', tone: 'info', pct: appt ? 80 : 20 },
        { num: visits, label: 'Visits this week', sub: 'clinical activity', tone: 'success', pct: visits ? 75 : 20 },
      ],
      quick: [
        { icon: '❤️', label: 'Record vitals', path: '/vitals' },
        { icon: '📋', label: 'Open chart', path: '/chart' },
        { icon: '🔍', label: 'Find patient', path: '/patients' },
        { icon: '📅', label: 'Appointments', path: '/appointments' },
      ] as QuickAction[],
      perm: (
        <>
          <b>Nurse:</b> vitals/observations, chart context, visit support. Not: overwrite doctor decisions, delete
          history, manage users.
        </>
      ),
      attn: [
        { crit: false, title: waiting ? `${waiting} still need vitals` : 'No vitals backlog', sub: 'Check waiting queue' },
        { crit: false, title: 'Review allergy flags on chart', sub: 'Before recording vitals' },
        { crit: false, title: 'Complete observation notes', sub: 'For walk-ins checked in' },
      ],
      feed: [
        { text: 'Dashboard refreshed with live schedule', time: 'just now', dim: false },
        { text: `${checked} patients checked in today`, time: 'today', dim: false },
        { text: `${patients} active patients in registry`, time: 'today', dim: true },
      ],
    };
  }

  if (role === 'Receptionist') {
    return {
      eyebrow: "Today's front desk",
      hero: (
        <>
          <b>{appt}</b> appointments today. <b>{waiting}</b> waiting at check-in. Register, book, and check in —
          without clinical chart noise.
        </>
      ),
      cta: 'Register patient',
      ctaPath: '/patients/new',
      schedTitle: "Today's schedule",
      actTitle: 'Front desk activity',
      stats: [
        { num: appt, label: "Today's appointments", sub: 'scheduled', tone: 'warning', pct: appt ? 65 : 15 },
        { num: checked, label: 'Checked in', sub: 'waiting now', tone: 'success', pct: checked ? 85 : 15 },
        { num: waiting, label: 'Waiting', sub: 'need check-in action', tone: 'warning', pct: waiting ? 90 : 10 },
        { num: patients, label: 'Active patients', sub: 'in registry', tone: 'info', pct: patients ? 70 : 20 },
      ],
      quick: [
        { icon: '➕', label: 'Register patient', path: '/patients/new' },
        { icon: '📅', label: 'New appointment', path: '/appointments/new' },
        { icon: '✅', label: 'Check-in queue', path: '/appointments' },
        { icon: '🔍', label: 'Find patient', path: '/patients' },
      ] as QuickAction[],
      perm: (
        <>
          <b>Receptionist:</b> registration, appointments, check-in. Not: clinical notes, diagnosis, user admin.
        </>
      ),
      attn: [
        { crit: false, title: waiting ? `${waiting} waiting for check-in` : 'Queue clear', sub: 'Front desk list' },
        { crit: false, title: 'Confirm afternoon slots', sub: 'Open appointments' },
        { crit: false, title: 'Verify patient contact details', sub: 'At registration' },
      ],
      feed: [
        { text: 'Front desk dashboard loaded', time: 'just now', dim: false },
        { text: `${appt} appointments on today's list`, time: 'today', dim: false },
        { text: `${patients} patients in registry`, time: 'today', dim: true },
      ],
    };
  }

  if (role === 'Admin') {
    return {
      eyebrow: 'System overview',
      hero: (
        <>
          <b>{patients}</b> active patients, <b>{appt}</b> appointments today. Monitor access, roles, and operational
          health.
        </>
      ),
      cta: 'Manage users',
      ctaPath: '/admin/users',
      schedTitle: "Today's clinic load",
      actTitle: 'System activity',
      stats: [
        { num: patients, label: 'Active patients', sub: 'registry', tone: 'success', pct: patients ? 80 : 20 },
        { num: appt, label: 'Appointments today', sub: 'clinic-wide', tone: 'info', pct: appt ? 70 : 15 },
        { num: visits, label: 'Visits this week', sub: 'volume', tone: 'warning', pct: visits ? 60 : 15 },
        { num: checked, label: 'Checked in', sub: 'right now', tone: 'success', pct: checked ? 75 : 10 },
      ],
      quick: [
        { icon: '👥', label: 'Users', path: '/admin/users' },
        { icon: '🛡️', label: 'Roles', path: '/admin/roles' },
        { icon: '📋', label: 'Patients', path: '/patients' },
        { icon: '📊', label: 'Reports', path: '/reports' },
      ] as QuickAction[],
      perm: (
        <>
          <b>Admin:</b> users, roles, audit, configuration. Clinical care is still performed by clinicians and nurses.
        </>
      ),
      attn: [
        { crit: false, title: 'Review role assignments', sub: 'Users & roles' },
        { crit: false, title: 'Confirm seed accounts rotated', sub: 'Security hygiene' },
        { crit: false, title: 'Check API health', sub: 'Operations' },
      ],
      feed: [
        { text: 'Admin dashboard loaded', time: 'just now', dim: false },
        { text: `${patients} patients in system`, time: 'today', dim: false },
        { text: `${visits} visits logged this week`, time: 'this week', dim: true },
      ],
    };
  }

  return {
    eyebrow: "Today's clinical focus",
    hero: (
      <>
        <b>{appt}</b> appointments on your schedule, <b>{checked}</b> patients checked in and waiting.{' '}
        {waiting > 0 ? (
          <>
            <b>{waiting}</b> still in queue.
          </>
        ) : (
          'Queue is clear.'
        )}
      </>
    ),
    cta: 'Open chart',
    ctaPath: '/chart',
    schedTitle: 'My schedule today',
    actTitle: 'Clinical activity',
    stats: [
      { num: appt, label: 'Appointments', sub: 'today', tone: 'success', pct: appt ? 75 : 15 },
      { num: checked, label: 'Checked in', sub: 'ready to see', tone: 'success', pct: checked ? 85 : 15 },
      { num: waiting, label: 'Waiting', sub: 'in queue', tone: 'warning', pct: waiting ? 50 : 10 },
      { num: visits, label: 'Visits this week', sub: 'consultations', tone: 'info', pct: visits ? 70 : 20 },
    ],
    quick: [
      { icon: '📋', label: 'Open chart', path: '/chart' },
      { icon: '📅', label: 'Appointments', path: '/appointments' },
      { icon: '🔍', label: 'Find patient', path: '/patients' },
      { icon: '➕', label: 'New appointment', path: '/appointments/new' },
    ] as QuickAction[],
    perm: (
      <>
        <b>Clinician:</b> charts, diagnosis, notes, appointments. Not: user administration or role changes.
      </>
    ),
    attn: [
      {
        crit: waiting > 0,
        title: waiting ? `${waiting} patients waiting` : 'No waiting patients',
        sub: 'Clinic queue',
      },
      { crit: false, title: 'Review incomplete charts', sub: 'After consultation' },
      { crit: false, title: `Hello ${name.split(' ')[0]} — schedule loaded`, sub: 'Live data' },
    ],
    feed: [
      { text: 'Clinical dashboard refreshed', time: 'just now', dim: false },
      { text: `${checked} checked in · ${waiting} waiting`, time: 'today', dim: false },
      { text: `${patients} active patients in registry`, time: 'today', dim: true },
    ],
  };
}

function StatRing({ tone, pct }: { tone: string; pct: number }) {
  return (
    <div className="ring">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle className="ring-bg" cx="28" cy="28" r="24" />
        <circle
          className="ring-fg"
          cx="28"
          cy="28"
          r="24"
          stroke={`var(--status-${tone})`}
          strokeDasharray={CIRC}
          strokeDashoffset={ringOffset(pct)}
        />
      </svg>
    </div>
  );
}

function timelineTone(status: string): string {
  if (status === 'CheckedIn' || status === 'Completed' || status === 'InProgress') return 'success';
  if (status === 'Waiting') return 'warning';
  if (status === 'Cancelled' || status === 'NoShow') return 'danger';
  return 'info';
}

function timelineBlocks(schedule: Appointment[]) {
  const startMin = 8 * 60;
  const endMin = 18 * 60;
  const span = endMin - startMin;
  return schedule.map((a) => {
    const parts = a.startTime.split(':').map(Number);
    const mins = (parts[0] ?? 8) * 60 + (parts[1] ?? 0);
    const left = Math.max(0, ((mins - startMin) / span) * 100);
    const width = Math.max(4, (Math.min(a.durationMinutes || 30, 90) / span) * 100);
    return { id: a.id, left, width, tone: timelineTone(a.status) };
  });
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'));
  }, []);

  const role = primaryRole(user?.roles);
  const name = user?.fullName ?? user?.email ?? 'User';
  const cfg = useMemo(() => roleConfig(role, name, stats), [role, name, stats]);
  const schedule = stats?.todaysSchedule ?? [];
  const blocks = timelineBlocks(schedule);

  return (
    <div className="dashboard-page">
      <div className="topbar">
        <div className="greeting">
          <h1>
            {greetingPrefix()}, {name}
          </h1>
          <div className="date">{formatLongDate()}</div>
        </div>
        <div className="top-actions">
          <button type="button" className="search-box" onClick={() => navigate('/patients')}>
            <span aria-hidden>🔍</span>
            <span>Search patients…</span>
          </button>
          <div className="icon-btn" title="Notifications">
            <span aria-hidden>🔔</span>
            <div className="dot" />
          </div>
        </div>
      </div>

      {error && <div className="dash-error">{error}</div>}

      <div className="hero">
        <div>
          <div className="hero-eyebrow">{cfg.eyebrow}</div>
          <div className="hero-title">{cfg.hero}</div>
        </div>
        <button type="button" className="hero-cta" onClick={() => navigate(cfg.ctaPath)}>
          {cfg.cta}
        </button>
      </div>

      <div className="stat-row">
        {cfg.stats.map((s) => (
          <div key={s.label} className="stat-card">
            <StatRing tone={s.tone} pct={s.pct} />
            <div className="stat-meta">
              <div className="stat-num" style={{ color: `var(--status-${s.tone})` }}>
                {stats ? s.num : '—'}
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">{cfg.schedTitle}</div>
            <button type="button" className="panel-link" onClick={() => navigate('/appointments')}>
              View all →
            </button>
          </div>
          <div className="timeline-scale">
            <span>8am</span>
            <span>10am</span>
            <span>12pm</span>
            <span>2pm</span>
            <span>4pm</span>
            <span>6pm</span>
          </div>
          <div className="timeline-track">
            {blocks.map((b) => (
              <div
                key={b.id}
                className={`timeline-block tone-${b.tone}`}
                style={{ left: `${b.left}%`, width: `${b.width}%` }}
              />
            ))}
          </div>
          {!schedule.length ? (
            <div className="empty">No appointments scheduled for today.</div>
          ) : (
            schedule.map((a) => (
              <div key={a.id} className="appt-row">
                <div className="appt-time">{formatTime(a.startTime)}</div>
                <div className="appt-name">
                  {a.patientName}
                  <span className="muted">
                    {a.appointmentType} · {a.providerName ?? 'Provider'}
                  </span>
                </div>
                <span className={`status-pill ${statusClass(a.status)}`}>
                  <span className="dot" />
                  {statusLabel(a.status)}
                </span>
                <div className="appt-actions">
                  {(a.status === 'Scheduled' || a.status === 'Waiting') && role === 'Receptionist' && (
                    <button type="button" className="action-link" onClick={() => navigate('/appointments')}>
                      Check in
                    </button>
                  )}
                  {role === 'Nurse' && (
                    <button type="button" className="action-link" onClick={() => navigate('/vitals')}>
                      Vitals
                    </button>
                  )}
                  <button
                    type="button"
                    className="action-link"
                    onClick={() => navigate(`/patients/${a.patientId}/chart`)}
                  >
                    Chart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">{cfg.actTitle}</div>
          </div>
          {cfg.feed.map((f, i) => (
            <div key={i} className={`feed-item${f.dim ? ' dim' : ''}`}>
              <span className="feed-dot" />
              <div className="feed-text">{f.text}</div>
              <div className="feed-time">{f.time}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-bottom">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Needs attention</div>
          </div>
          {cfg.attn.map((a, i) => (
            <div key={i} className={`attn-item${a.crit ? ' crit' : ''}`}>
              <div className="attn-icon">{a.crit ? '!' : '•'}</div>
              <div>
                <div className="attn-text">{a.title}</div>
                <div className="attn-sub">{a.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Quick actions</div>
          </div>
          <div className="quick-grid">
            {cfg.quick.map((q) => (
              <button key={q.path + q.label} type="button" className="quick-btn" onClick={() => navigate(q.path)}>
                <span className="qi">{q.icon}</span>
                {q.label}
              </button>
            ))}
          </div>
          <div className="perm-bar">{cfg.perm}</div>
        </div>
      </div>
    </div>
  );
}
