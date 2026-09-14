import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, type DashboardStats } from '../services/appointmentsApi';
import './DashboardPage.css';

function formatTime(t: string) { return t.length >= 5 ? t.slice(0, 5) : t; }
function todayLabel() { return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date()); }

type QuickAction = [string, string, string];

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getDashboardStats().then(setStats).catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'));
  }, []);

  const role = user?.roles?.[0] ?? 'User';
  const name = user?.fullName ?? user?.email ?? 'User';
  const firstName = name.split(' ')[0];

  const roleContent = useMemo((): { eyebrow: string; title: string; description: string; primaryLabel: string; primaryPath: string; quick: QuickAction[] } => {
    switch (role.toLowerCase()) {
      case 'doctor':
      case 'clinician':
        return { eyebrow: 'Clinical workspace', title: 'Your clinical day at a glance.', description: 'Review today’s consultations, patient charts, and clinical documentation from one place.', primaryLabel: 'Open appointments', primaryPath: '/appointments', quick: [['Patient chart', '/chart', 'Review longitudinal records'], ['Appointments', '/appointments', 'Review consultation queue'], ['Medical records', '/records', 'Continue documentation'], ['Patient search', '/patients', 'Find a patient']] };
      case 'nurse':
      case 'clinical staff':
        return { eyebrow: 'Clinical workspace', title: 'Keep today’s care moving.', description: 'See arrivals, prepare patients, and capture the observations needed before consultation.', primaryLabel: 'Open today’s queue', primaryPath: '/appointments', quick: [['Record vitals', '/vitals', 'Capture observations'], ['Appointments', '/appointments', 'Review arrivals'], ['Patients', '/patients', 'Open a patient'], ['Medical chart', '/chart', 'Review patient history']] };
      case 'receptionist':
      case 'front desk':
        return { eyebrow: 'Front desk workspace', title: 'Today’s patient flow, in one view.', description: 'Register patients, manage appointments, and keep check-in moving smoothly.', primaryLabel: 'Check-in / Queue', primaryPath: '/checkin', quick: [['Register patient', '/patients/new', 'Create a patient record'], ['New appointment', '/appointments/new', 'Schedule a consultation'], ['Check-in / Queue', '/checkin', 'Manage arrivals'], ['Patients', '/patients', 'Search the registry']] };
      default:
        return { eyebrow: 'System workspace', title: 'Keep the clinical system healthy.', description: 'Monitor users, access, system activity, and operational information from one workspace.', primaryLabel: 'View users', primaryPath: '/admin/users', quick: [['Users', '/admin/users', 'Manage system accounts'], ['Roles & permissions', '/admin/roles', 'Review access control'], ['Audit logs', '/admin/audit', 'Review system activity'], ['Reports', '/reports', 'Review operations']] };
    }
  }, [role]);

  const schedule = stats?.todaysSchedule ?? [];
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div><div className="dashboard-kicker">{roleContent.eyebrow}</div><h1>Good morning, {firstName}.</h1><p>{todayLabel()}</p></div>
        <div className="dashboard-header-actions">
          <button type="button" className="dashboard-search" onClick={() => navigate('/patients')}><span className="search-icon">⌕</span><span>Find a patient</span><kbd>⌘ K</kbd></button>
          <button type="button" className="dashboard-notification" aria-label="Notifications"><span>●</span></button>
        </div>
      </header>
      {error && <div className="dash-error">{error}</div>}

      <section className="dashboard-hero">
        <div className="hero-copy"><div className="hero-eyebrow">Today · {role}</div><h2>{roleContent.title}</h2><p>{roleContent.description}</p></div>
        <button type="button" className="hero-cta" onClick={() => navigate(roleContent.primaryPath)}>{roleContent.primaryLabel} <span>→</span></button>
      </section>

      <section className="stat-row">
        <div className="stat-card stat-card-accent"><div className="stat-icon">◷</div><div><strong>{stats?.appointmentsToday ?? '—'}</strong><span>Appointments today</span></div></div>
        <div className="stat-card"><div className="stat-icon">◌</div><div><strong>{stats?.waitingCount ?? '—'}</strong><span>Waiting / scheduled</span></div></div>
        <div className="stat-card"><div className="stat-icon">✓</div><div><strong>{stats?.checkedInCount ?? '—'}</strong><span>Checked in</span></div></div>
        <div className="stat-card"><div className="stat-icon">＋</div><div><strong>{stats?.activePatients ?? '—'}</strong><span>Active patients</span></div></div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel schedule-panel">
          <div className="panel-head"><div><h3>Today’s schedule</h3><p>{schedule.length ? `${schedule.length} appointments on the board` : 'No appointments scheduled'}</p></div><button type="button" className="panel-link" onClick={() => navigate('/appointments')}>View all →</button></div>
          <div className="schedule-list">
            {!schedule.length ? <div className="schedule-empty"><div className="empty-mark">◷</div><div><strong>Your schedule is clear</strong><span>No appointments are scheduled for today.</span></div></div> : schedule.slice(0, 7).map((a) => (
              <button type="button" key={a.id} className="schedule-row" onClick={() => navigate(`/patients/${a.patientId}/chart`)}>
                <span className="schedule-time">{formatTime(a.startTime)}</span><span className="schedule-line" />
                <span className="schedule-main"><strong>{a.patientName}</strong><small>{a.appointmentType} · {a.providerName ?? 'Provider'}</small></span>
                <span className="status"><i />{a.status}</span><span className="row-arrow">→</span>
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-side">
          <div className="dashboard-panel attention-panel">
            <div className="panel-head"><div><h3>Needs attention</h3><p>Useful signals for today</p></div></div>
            <div className="attention-list">
              <button type="button" onClick={() => navigate('/appointments')}><span className="attention-icon amber">!</span><span><strong>{stats?.waitingCount ?? 0} patients</strong><small>waiting or scheduled</small></span><b>→</b></button>
              <button type="button" onClick={() => navigate('/appointments')}><span className="attention-icon">◷</span><span><strong>{stats?.appointmentsToday ?? 0} appointments</strong><small>planned for today</small></span><b>→</b></button>
              <button type="button" onClick={() => navigate('/patients')}><span className="attention-icon">⌕</span><span><strong>Patient records</strong><small>Search or review a chart</small></span><b>→</b></button>
            </div>
          </div>
          <div className="dashboard-panel quick-panel">
            <div className="panel-head"><div><h3>Quick actions</h3><p>Common tasks for your role</p></div></div>
            <div className="quick-grid">{roleContent.quick.map(([label, path, description]) => <button type="button" key={path} onClick={() => navigate(path)}><span className="quick-arrow">↗</span><span><strong>{label}</strong><small>{description}</small></span></button>)}</div>
          </div>
        </div>
      </section>
      <div className="dashboard-footer-note"><span className="secure-dot" /> Open Clinical Record · Role-aware clinical workspace</div>
    </div>
  );
}
