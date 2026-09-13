import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { primaryRole } from '../utils/navigation';
import './DashboardPage.css';

function greetingName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts.length >= 2 ? parts[0] : fullName;
}

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user ? primaryRole(user.roles) : 'Doctor';
  const name = user?.fullName ?? 'User';

  const dateLabel = useMemo(
    () => new Date().toLocaleDateString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    }),
    [],
  );

  const workspace = role === 'Receptionist'
    ? { eyebrow: "Today's front desk", title: <>Keep <b>check-in</b>, registration, and appointments moving smoothly.</>, cta: 'Open appointments', path: '/appointments' }
    : role === 'Nurse'
      ? { eyebrow: "Today's nursing focus", title: <>Capture <b>vitals</b>, support the chart, and keep the queue moving.</>, cta: 'Record vitals', path: '/vitals' }
      : role === 'Admin'
        ? { eyebrow: 'System overview', title: <>Manage <b>users</b>, roles, access, and system activity.</>, cta: 'Manage users', path: '/admin/users' }
        : { eyebrow: "Today's clinical focus", title: <>Review <b>patients</b>, open the <b>chart</b>, and keep care on track.</>, cta: '+ Register patient', path: '/patients' };

  const stats = role === 'Admin'
    ? [
        { num: '—', label: 'Active users', sub: 'Connected accounts', progress: 68 },
        { num: '4', label: 'Roles', sub: 'Access groups', progress: 100 },
        { num: '—', label: 'Audit events', sub: 'Recent activity', progress: 42 },
        { num: 'OK', label: 'API health', sub: 'Backend status', progress: 100 },
      ]
    : [
        { num: '—', label: 'Appointments today', sub: 'Live schedule', progress: 62 },
        { num: '—', label: 'Waiting', sub: 'Current queue', progress: 34 },
        { num: '—', label: 'Chart alerts', sub: 'Needs attention', progress: 24 },
        { num: '—', label: 'Open notes', sub: 'Draft documentation', progress: 48 },
      ];

  return (
    <div className="dash">
      <div className="topbar">
        <div className="greeting">
          <h1>{timeGreeting()}, {greetingName(name)}</h1>
          <div className="date">{dateLabel}</div>
        </div>
        <div className="top-actions">
          <div className="search-box"><span aria-hidden="true">⌕</span> Search patients...</div>
          <button type="button" className="icon-btn" aria-label="Notifications"><span aria-hidden="true">♢</span><span className="dot" /></button>
        </div>
      </div>

      <div className="hero">
        <div>
          <div className="hero-eyebrow">{workspace.eyebrow}</div>
          <div className="hero-title">{workspace.title}</div>
        </div>
        <button type="button" className="hero-cta" onClick={() => navigate(workspace.path)}>{workspace.cta}</button>
      </div>

      <div className="stat-row">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-ring" style={{ '--progress': `${stat.progress}%` } as React.CSSProperties}><span>{stat.num}</span></div>
            <div><div className="stat-num">{stat.num}</div><div className="stat-label">{stat.label}</div><div className="stat-sub">{stat.sub}</div></div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head"><div className="panel-title">Today's appointments</div><button type="button" className="panel-link" onClick={() => navigate('/appointments')}>View all →</button></div>
          <div className="timeline-scale"><span>08:00</span><span>10:00</span><span>12:00</span><span>14:00</span><span>16:00</span></div>
          <div className="timeline-track"><span className="timeline-block first" /><span className="timeline-block second" /><span className="timeline-block third" /></div>
          <div className="appt-row"><span className="appt-time">09:00</span><div className="appt-name">Tadesse Girma<span className="muted">Follow-up · Dr. Samuel</span></div><span className="status-pill status-checked"><span className="dot" /> Checked-in</span><button type="button" className="row-link" onClick={() => navigate('/appointments')}>Open</button></div>
          <div className="appt-row"><span className="appt-time">10:30</span><div className="appt-name">Almaz Bekele<span className="muted">Consultation · Dr. Samuel</span></div><span className="status-pill status-waiting"><span className="dot" /> Waiting</span><button type="button" className="row-link" onClick={() => navigate('/appointments')}>Open</button></div>
          <div className="appt-row"><span className="appt-time">14:00</span><div className="appt-name">Mekdes Tesfaye<span className="muted">Follow-up · Dr. Samuel</span></div><span className="status-pill status-scheduled"><span className="dot" /> Scheduled</span><button type="button" className="row-link" onClick={() => navigate('/appointments')}>Open</button></div>
        </section>

        <section className="panel">
          <div className="panel-head"><div className="panel-title">Front desk activity</div><span className="live-label">● Live</span></div>
          <div className="feed-item"><span className="feed-dot" /><div className="feed-text"><b>Tadesse Girma</b> checked in<span className="feed-time">08:42</span></div></div>
          <div className="feed-item"><span className="feed-dot" /><div className="feed-text"><b>New patient</b> registered<span className="feed-time">08:35</span></div></div>
          <div className="feed-item dim"><span className="feed-dot" /><div className="feed-text"><b>Appointment</b> rescheduled<span className="feed-time">08:21</span></div></div>
          <div className="feed-item dim"><span className="feed-dot" /><div className="feed-text"><b>Patient</b> marked no-show<span className="feed-time">08:05</span></div></div>
        </section>
      </div>

      <div className="grid-bottom">
        <section className="panel">
          <div className="panel-head"><div className="panel-title">Needs attention</div><span className="count-badge">3</span></div>
          <div className="attn-item"><div className="attn-icon">!</div><div className="attn-text">Allergy alert<span>Patient chart requires review</span></div></div>
          <div className="attn-item"><div className="attn-icon">◷</div><div className="attn-text">Follow-up due<span>Clinical documentation reminder</span></div></div>
          <div className="attn-item crit"><div className="attn-icon">!</div><div className="attn-text">Incomplete note<span>Finalization is still pending</span></div></div>
        </section>

        <section className="panel">
          <div className="panel-head"><div className="panel-title">Quick actions</div></div>
          <div className="quick-grid">
            <button type="button" className="quick-btn" onClick={() => navigate('/patients')}><span className="quick-ico">＋</span> Register patient</button>
            <button type="button" className="quick-btn" onClick={() => navigate('/appointments')}><span className="quick-ico">◷</span> New appointment</button>
            <button type="button" className="quick-btn" onClick={() => navigate('/patients')}><span className="quick-ico">⌕</span> Find patient</button>
            <button type="button" className="quick-btn" onClick={() => navigate('/vitals')}><span className="quick-ico">♡</span> Record vitals</button>
          </div>
        </section>
      </div>

      <div className="perm-bar">Your workspace is role-aware. Clinical permissions follow the signed-in role; system administration remains separate from clinical authority.</div>
    </div>
  );
}
