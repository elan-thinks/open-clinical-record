import { useCallback, useEffect, useState } from 'react';
import { listAuditEvents, type AuditEventItem } from '../../services/auditApi';
import '../admin/UsersPage.css';
import './AuditLogsPage.css';

const ENTITY_FILTERS = ['', 'Auth', 'Patient', 'Appointment', 'Clinical'] as const;

function formatWhen(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

function actionTone(action: string): string {
  const a = action.toLowerCase();
  if (a.includes('fail') || a.includes('denied')) return 'tone-bad';
  if (a.includes('login') || a.includes('create')) return 'tone-ok';
  if (a.includes('password') || a.includes('update') || a.includes('change')) return 'tone-warn';
  return 'tone-neutral';
}

export function AuditLogsPage() {
  const [items, setItems] = useState<AuditEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entityType, setEntityType] = useState('');
  const [take, setTake] = useState(50);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(
        await listAuditEvents({
          entityType: entityType || undefined,
          take,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit events');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, take]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="admin-page audit-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Audit logs</h1>
          <p className="page-sub">
            Append-only security and clinical activity trail (Admin only).
          </p>
        </div>
        <button type="button" className="admin-btn" onClick={() => void load()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div className="audit-filters">
        <label className="audit-filter">
          Entity type
          <select value={entityType} onChange={(e) => setEntityType(e.target.value)}>
            <option value="">All types</option>
            {ENTITY_FILTERS.filter(Boolean).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="audit-filter">
          Rows
          <select value={take} onChange={(e) => setTake(Number(e.target.value))}>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </label>
      </div>

      {error && <p className="admin-error">{error}</p>}

      <div className="admin-panel audit-panel">
        {loading && items.length === 0 ? (
          <div className="audit-empty">Loading audit events…</div>
        ) : items.length === 0 ? (
          <div className="audit-empty">
            No audit events yet. Sign-ins, password changes, and patient updates will appear here.
          </div>
        ) : (
          <div className="audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Actor</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {items.map((e) => (
                  <tr key={e.id}>
                    <td className="audit-when">{formatWhen(e.createdAt)}</td>
                    <td>
                      <span className={`audit-pill ${actionTone(e.action)}`}>{e.action}</span>
                    </td>
                    <td className="audit-entity">
                      <span className="audit-type">{e.entityType}</span>
                      {e.entityId && (
                        <span className="audit-id" title={e.entityId}>
                          {e.entityId.slice(0, 8)}…
                        </span>
                      )}
                    </td>
                    <td className="audit-actor">{e.actorName || e.actorUserId || '—'}</td>
                    <td className="audit-summary">{e.summary || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
