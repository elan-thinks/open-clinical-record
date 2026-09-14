import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listPatients, type Patient } from '../../services/patientsApi';
import './PatientChartPage.css';

export function ChartIndexPage() {
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
    <div className="chart-page">
      <h1 className="p-name" style={{ marginBottom: 6 }}>
        Medical Chart
      </h1>
      <p className="muted" style={{ marginBottom: 18 }}>
        Select a patient to open their clinical chart (history, vitals, visits, notes).
      </p>

      {error && <div className="error-banner">{error}</div>}

      <form className="form-grid" onSubmit={onSearch} style={{ marginBottom: 16, alignItems: 'end' }}>
        <div className="field span-2">
          <label className="label">Search patients</label>
          <input
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, MRN, or phone"
          />
        </div>
        <div className="form-actions" style={{ marginTop: 0 }}>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </div>
      </form>

      <div className="panel">
        {loading ? (
          <div className="empty">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="empty">No patients found. Register a patient first.</div>
        ) : (
          patients.map((p) => (
            <div key={p.id} className="list-row">
              <div>
                <div>
                  {p.firstName} {p.lastName}
                </div>
                <div className="muted">
                  {p.medicalRecordNumber}
                  {p.phone ? ` | ${p.phone}` : ''}
                </div>
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate(`/patients/${p.id}/chart`)}
              >
                Open chart
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
