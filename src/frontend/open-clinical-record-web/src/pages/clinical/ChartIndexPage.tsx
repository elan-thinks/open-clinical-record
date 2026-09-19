import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPatients, type Patient } from '../../services/patientsApi';
import './PatientChartPage.css';
import './ClinicalIndexPages.css';
import { PageLoader } from '../../components/PageLoader';

export function ChartIndexPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  // No artificial hold — show data as soon as the API responds

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const items = await listPatients(undefined, 'active');
        if (!cancelled) setPatients(items);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load patients');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setPatients(await listPatients(q, 'active'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chart-page clinical-index">
      <header className="ci-header">
        <h1 className="ci-title">Medical Chart</h1>
        <p className="ci-lead">
          Open a patient&apos;s full clinical chart — overview, history, vitals, visits, and notes in one place.
        </p>
        <p className="ci-hint">
          For visit-only documentation and consultation forms, use <strong>Medical Records</strong> instead.
        </p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <form className="ci-search" onSubmit={onSearch}>
        <label className="ci-search-label" htmlFor="chart-search">
          Search patients
        </label>
        <div className="ci-search-row">
          <input
            id="chart-search"
            className="ci-search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, MRN, or phone"
            autoComplete="off"
          />
          <button type="submit" className="ci-search-btn" disabled={loading}>
            Search
          </button>
        </div>
      </form>

      <div className="panel ci-list-panel">
        <div className="panel-head ci-list-head">
          <div className="panel-title">Patients</div>
          {!loading && (
            <span className="ci-count">
              {patients.length} {patients.length === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>
        {loading ? (
          <PageLoader variant="skeleton" label="Loading charts…" rows={5} />
        ) : patients.length === 0 ? (
          <div className="empty">No patients found. Register a patient first.</div>
        ) : (
          <ul className="ci-patient-list">
            {patients.map((p) => (
              <li key={p.id} className="ci-patient-row">
                <div className="ci-patient-main">
                  <div className="ci-patient-name">
                    {p.firstName} {p.lastName}
                  </div>
                  <div className="ci-patient-meta">
                    <span>{p.medicalRecordNumber}</span>
                    {p.phone ? <span>{p.phone}</span> : null}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-primary ci-action-primary"
                  onClick={() => navigate(`/patients/${p.id}/chart`)}
                >
                  Open chart
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
