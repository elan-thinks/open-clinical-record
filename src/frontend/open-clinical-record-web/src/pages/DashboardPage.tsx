import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { primaryRole } from '../utils/navigation';
import './DashboardPage.css';

function greetingName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) return parts[0];
  return fullName;
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
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    [],
  );

  const hero =
    role === 'Receptionist'
      ? {
          eyebrow: "Today's front desk",
          title: (
            <>
              Manage <b>check-in</b>, registration, and the appointment board from this workspace.
            </>
          ),
          cta: 'Open appointments',
          ctaPath: '/appointments',
        }
      : role === 'Nurse'
        ? {
            eyebrow: "Today's nursing focus",
            title: (
              <>
                Capture <b>vitals</b>, support the chart, and keep the queue moving.
              </>
            ),
            cta: 'Record vitals',
            ctaPath: '/vitals',
          }
        : role === 'Admin'
          ? {
              eyebrow: 'System overview',
              title: (
                <>
                  Manage <b>users</b>, roles, and clinic configuration.
                </>
              ),
              cta: 'Manage users',
              ctaPath: '/admin/users',
            }
          : {
              eyebrow: "Today's clinical focus",
              title: (
                <>
                  Review <b>patients</b>, open the <b>chart</b>, and keep appointments on track.
                </>
              ),
              cta: '+ Register patient',
              ctaPath: '/patients',
            };

  const stats =
    role === 'Admin'
      ? [
          { num: '-', label: 'Active users' },
          { num: '4', label: 'Roles' },
          { num: '-', label: 'Audit events' },
          { num: 'OK', label: 'API health' },
        ]
      : [
          { num: '-', label: 'Appointments today' },
          { num: '-', label: 'Waiting' },
          { num: '-', label: 'Chart alerts' },
          { num: '-', label: 'Open notes' },
        ];

  return (
    <div className="dash">
      <div className="topbar">
        <div className="greeting">
          <h1>
            {timeGreeting()}, {greetingName(name)}
          </h1>
          <div className="date">{dateLabel}</div>
        </div>
        <div className="top-actions">
          <div className="search-box">Search patients...</div>
        </div>
      </div>

      <div className="hero">
        <div>
          <div className="hero-eyebrow">{hero.eyebrow}</div>
          <div className="hero-title">{hero.title}</div>
        </div>
        <button type="button" className="hero-cta" onClick={() => navigate(hero.ctaPath)}>
          {hero.cta}
        </button>
      </div>

      <div className="stat-row">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Workspace</div>
          </div>
          <div className="panel-body">
            Signed in as <b style={{ color: 'var(--text)' }}>{name}</b> ({role === 'Doctor' ? 'Clinician' : role}).
            Use the sidebar for Patients, Chart, Appointments, and admin tools. Live schedule and
            queue widgets will connect when those modules are built.
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Quick links</div>
          </div>
          <div className="panel-body">
            <button
              type="button"
              className="hero-cta"
              style={{ marginRight: 8, marginBottom: 8 }}
              onClick={() => navigate('/patients')}
            >
              Patients
            </button>
            <button
              type="button"
              className="hero-cta"
              style={{
                background: 'var(--surface-2)',
                color: 'var(--text-dim)',
                border: '1px solid var(--line)',
              }}
              onClick={() => navigate('/appointments')}
            >
              Appointments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
