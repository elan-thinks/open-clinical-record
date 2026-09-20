import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPatients, type Patient } from '../../services/patientsApi';
import './PatientChartPage.css';
import './ClinicalIndexPages.css';

/**
 * Medical Records — visit history & consultation entry (Week 4).
 * Distinct from Medical Chart (full chart workspace with all tabs).
 */
export function MedicalRecordsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');

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
        <h1 className="ci-title">Medical Records</h1>
        <p className="ci-lead">Visit records, diagnosis, clinical notes, and consultation documentation.</p>
        <p className="ci-hint">
          This is not the full Medical Chart. Use <strong>Medical Chart</strong> for overview, history, and
          vitals together — use this page to open visit / consultation records.
        </p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <form className="ci-search" onSubmit={onSearch}>
        <label className="ci-search-label" htmlFor="records-search">
          Find patient records
        </label>
        <div className="ci-search-row">
          <input
            id="records-search"
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
          <div className="panel-title">Patients with clinical records</div>
          {!loading && (
            <span className="ci-count">
              {patients.length} {patients.length === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>
        {loading ? (
          <div className="empty">Loading patients…</div>
        ) : patients.length === 0 ? (
          <div className="empty">No patients found. Register a patient first.</div>
        ) : (
          <div className="ci-list-scroll">
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
                  <div className="ci-actions">
                    <button
                      type="button"
                      className="btn-ghost ci-action-ghost"
                      onClick={() => navigate(`/patients/${p.id}/chart?tab=visits`)}
                    >
                      Visit history
                    </button>
                    <button
                      type="button"
                      className="btn-primary ci-action-primary"
                      onClick={() => navigate(`/patients/${p.id}/chart?tab=consultation`)}
                    >
                      Consultation
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
