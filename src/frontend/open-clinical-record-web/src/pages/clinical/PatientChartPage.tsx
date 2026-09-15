import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getPatientChart, type PatientChart } from '../../services/clinicalApi';
import './PatientChartPage.css';
import { VisitHistoryPanel } from './VisitHistoryPanel';

type TabId = 'overview' | 'visits' | 'consultation';

function initials(first: string, last: string): string {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

export function PatientChartPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [chart, setChart] = useState<PatientChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>((searchParams.get('tab') as TabId) || 'overview');

  const load = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      setChart(await getPatientChart(patientId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart');
      setChart(null);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  function selectTab(next: TabId) {
    setTab(next);
    setSearchParams(next === 'overview' ? {} : { tab: next });
  }

  if (loading) {
    return (
      <div className="chart-page">
        <div className="empty">Loading chart...</div>
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="chart-page">
        {error && <div className="error-banner">{error}</div>}
        <button type="button" className="breadcrumb" onClick={() => navigate('/patients')}>
          Patients
        </button>
        <div className="empty">Chart not found.</div>
      </div>
    );
  }

  return (
    <div className="chart-page">
      <div className="breadcrumb">
        <button type="button" onClick={() => navigate('/patients')}>
          Patients
        </button>
        {' \u00b7 '}Chart
      </div>

      <div className="patient-header">
        <div className="patient-identity">
          <div className="avatar-lg">{initials(chart.firstName, chart.lastName)}</div>
          <div>
            <div className="p-name">
              {chart.firstName} {chart.lastName}
            </div>
            <div className="p-meta">
              <span>{chart.medicalRecordNumber}</span>
              <span>{chart.sex ?? '-'}</span>
              <span>{chart.phone ?? '-'}</span>
              <span className="badge">{chart.status}</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-primary" onClick={() => navigate('/appointments/new')}>
            + New appointment
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="tabs">
        {(
          [
            ['overview', 'Overview'],
            ['visits', 'Visit history'],
            ['consultation', 'Consultation'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`tab${tab === id ? ' active' : ''}`}
            onClick={() => selectTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Recent visits</div>
            <button type="button" className="panel-link" onClick={() => selectTab('visits')}>
              Open visit history
            </button>
          </div>
          <p className="muted" style={{ marginBottom: 12 }}>
            Each return to the clinic is a new visit. Prior encounters are never overwritten.
          </p>
          {chart.visits.length === 0 ? (
            <div className="empty">No visits yet. Check in an appointment or save a consultation.</div>
          ) : (
            <div className="list-rows">
              {chart.visits.slice(0, 8).map((v) => (
                <div key={v.id} className="list-row">
                  <div>
                    <div>
                      {new Date(v.visitDate).toLocaleString()} — {v.visitType}
                    </div>
                    <div className="muted">
                      {v.chiefComplaint || 'No complaint'} · {v.clinicianName ?? 'Clinician'} · {v.status}
                    </div>
                  </div>
                  <span
                    className={`status-pill ${
                      v.status === 'Final' || v.status === 'Completed' ? 'done' : 'open'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'visits' && (
        <VisitHistoryPanel chart={chart} onNewConsultation={() => selectTab('consultation')} />
      )}

      {tab === 'consultation' && (
        <div className="panel">
          <div className="panel-title">Consultation</div>
          <p className="muted">
            Save clinical documentation from Record vitals or continue in visit workflows. Visit history
            lists every attendance for this patient.
          </p>
          <button type="button" className="btn-primary" onClick={() => selectTab('visits')}>
            Back to visit history
          </button>
        </div>
      )}
    </div>
  );
}
