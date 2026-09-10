import { useCallback, useEffect, useState } from 'react';
import { fetchHealth, getApiBaseUrl, type HealthStatus } from './services/api';
import './App.css';

function App() {
  const [status, setStatus] = useState<HealthStatus>('checking');
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkBackend = useCallback(async () => {
    setStatus('checking');
    setErrorMessage(null);

    try {
      const data = await fetchHealth();
      if (data?.status === 'ok') {
        setStatus('online');
      } else {
        setStatus('unavailable');
        setErrorMessage('Unexpected response from health endpoint');
      }
    } catch (err) {
      setStatus('unavailable');
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLastChecked(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => {
    void checkBackend();
  }, [checkBackend]);

  const statusLabel =
    status === 'online'
      ? 'Backend Online'
      : status === 'unavailable'
        ? 'Backend Unavailable'
        : 'Checking backend…';

  const statusKey =
    status === 'online' ? 'online' : status === 'unavailable' ? 'offline' : 'checking';

  return (
    <div className="app">
      <header className="header">
        <div className="brand-mark" aria-hidden>
          OCR
        </div>
        <div className="brand-text">
          <h1 className="brand-name">Open Clinical Record</h1>
          <p className="brand-sub">Project status: Foundation</p>
        </div>
      </header>

      <main className="main">
        <div className="hero">
          <p className="hero-eyebrow">Milestone 1</p>
          <h2 className="hero-title">
            Application foundation is <b>running</b>
          </h2>
          <p className="hero-desc">
            Backend API and frontend shell are connected. Authentication, database, and business
            modules are not implemented yet.
          </p>
        </div>

        <section className="card">
          <h2>Backend connection</h2>
          <div className="status-row">
            <span className={`status-dot ${statusKey}`} aria-hidden />
            <p className={`status-label ${statusKey}`}>{statusLabel}</p>
          </div>
          <p className="meta">
            API base: <code>{getApiBaseUrl()}</code>
          </p>
          {lastChecked && <p className="meta">Last checked: {lastChecked}</p>}
          {errorMessage && <p className="error">{errorMessage}</p>}
          <button type="button" onClick={() => void checkBackend()} className="btn">
            Refresh status
          </button>
        </section>

        <section className="card muted">
          <h2>What comes next</h2>
          <p>
            Later milestones will add the role-aware shell, login, patient management, medical
            chart, and appointments — matching the approved UI mocks.
          </p>
        </section>

        <p className="footer-note">Open Clinical Record · Internship MVP</p>
      </main>
    </div>
  );
}

export default App;
