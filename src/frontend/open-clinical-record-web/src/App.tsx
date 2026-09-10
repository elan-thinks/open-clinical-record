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

  const statusClass =
    status === 'online'
      ? 'status-online'
      : status === 'unavailable'
        ? 'status-offline'
        : 'status-checking';

  return (
    <div className="app">
      <header className="header">
        <h1>Open Clinical Record</h1>
        <p className="subtitle">Project status: Foundation</p>
      </header>

      <main className="main">
        <section className="card">
          <h2>Backend connection</h2>
          <p className={`status ${statusClass}`}>{statusLabel}</p>
          <p className="meta">API base: <code>{getApiBaseUrl()}</code></p>
          {lastChecked && <p className="meta">Last checked: {lastChecked}</p>}
          {errorMessage && <p className="error">{errorMessage}</p>}
          <button type="button" onClick={() => void checkBackend()} className="btn">
            Refresh status
          </button>
        </section>

        <section className="card muted">
          <h2>Milestone 1</h2>
          <p>
            Application foundation only. Authentication, database, and business modules are not
            implemented yet.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
