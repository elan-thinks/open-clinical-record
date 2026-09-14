import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, type DashboardStats } from '../services/appointmentsApi';
import './DashboardPage.css';

function formatTime(t: string): string {
  return t.length >= 5 ? t.slice(0, 5) : t;
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

  const role = user?.roles?.[0] ?? 'User';
  const name = user?.fullName ?? user?.email ?? 'User';

  return (
    <div className="dashboard-page">
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Today · {role}</div>
          <div className="hero-title">
            Welcome, <b>{name}</b>.{' '}
            {stats ? (
              <>
                <b>{stats.appointmentsToday}</b> appointments today, <b>{stats.checkedInCount}</b> checked
                in, <b>{stats.waitingCount}</b> waiting.
              </>
            ) : (
              'Loading schedule...'
            )}
          </div>
        </div>
        <button type="button" className="hero-cta" onClick={() => navigate('/appointments/new')}>
          + New appointment
        </button>
      </div>

      {error && <div className="dash-error">{error}</div>}

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-value">{stats?.appointmentsToday ?? '—'}</div>
          <div className="stat-label">Appointments today</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.waitingCount ?? '—'}</div>
          <div className="stat-label">Waiting / scheduled</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.activePatients ?? '—'}</div>
          <div className="stat-label">Active patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.visitsThisWeek ?? '—'}</div>
          <div className="stat-label">Visits this week</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Today&apos;s schedule</div>
            <button type="button" className="panel-link" onClick={() => navigate('/appointments')}>
              View all
            </button>
          </div>
          {!stats?.todaysSchedule?.length ? (
            <div className="empty">No appointments scheduled for today.</div>
          ) : (
            stats.todaysSchedule.map((a) => (
              <div key={a.id} className="sched-row">
                <div className="sched-time">{formatTime(a.startTime)}</div>
                <div className="sched-body">
                  <div className="sched-name">{a.patientName}</div>
                  <div className="sched-meta">
                    {a.appointmentType} · {a.status} · {a.providerName ?? 'Provider'}
                  </div>
                </div>
                <button
                  type="button"
                  className="panel-link"
                  onClick={() => navigate(`/patients/${a.patientId}/chart`)}
                >
                  Chart
                </button>
              </div>
            ))
          )}
        </div>

        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Quick actions</div>
          </div>
          <div className="quick-actions">
            <button type="button" className="quick-btn" onClick={() => navigate('/patients')}>
              Patients
            </button>
            <button type="button" className="quick-btn" onClick={() => navigate('/appointments')}>
              Appointments
            </button>
            <button type="button" className="quick-btn" onClick={() => navigate('/chart')}>
              Medical chart
            </button>
            <button type="button" className="quick-btn" onClick={() => navigate('/vitals')}>
              Record vitals
            </button>
            <button type="button" className="quick-btn" onClick={() => navigate('/patients/new')}>
              Register patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
