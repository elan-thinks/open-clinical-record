import { useState } from 'react';
import type { PatientChart, Visit } from '../../services/clinicalApi';
import './VisitHistoryPanel.css';

function fmtVisitWhen(value?: string | null): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  if (isToday) return `Today · ${time}`;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props {
  /** Preferred: full chart (has visits + patientId). */
  chart?: PatientChart;
  /** Alternate shape used by PatientChartPage. */
  patientId?: string;
  visits?: Visit[];
  isDeceased?: boolean;
  onNewConsultation?: () => void;
  /** Called after creating a draft consultation when onNewConsultation is not provided. */
  onChanged?: () => void | Promise<void>;
}

export function VisitHistoryPanel({
  chart,
  patientId,
  visits: visitsProp,
  isDeceased,
  onNewConsultation,
  onChanged,
}: Props) {
  const visits = chart?.visits ?? visitsProp ?? [];
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(visits[0]?.id ?? null);

  function handleNewConsultation() {
    if (isDeceased) return;
    if (onNewConsultation) {
      onNewConsultation();
      return;
    }
    // Fallback: parent may only pass onChanged after they create the visit elsewhere
    void onChanged?.();
  }

  return (
    <div className="visit-layout">
      <div className="panel visit-list-panel">
        <div className="panel-head">
          <div className="panel-title">Visit history</div>
          <button
            type="button"
            className="panel-link"
            onClick={handleNewConsultation}
            disabled={isDeceased}
          >
            + New consultation
          </button>
        </div>
        <p className="visit-hint">
          Same patient, many visits. Each attendance keeps its own encounter — history is never overwritten.
        </p>
        {visits.length === 0 ? (
          <div className="empty">
            No visits yet. Check in an appointment or record vitals / a consultation to create the first visit.
          </div>
        ) : (
          <div className="visit-timeline">
            {visits.map((v) => {
              const primaryDx = v.diagnoses.find((d) => d.isPrimary) ?? v.diagnoses[0];
              const active = (selectedVisitId ?? visits[0]?.id) === v.id;
              const statusClass =
                v.status === 'Final' || v.status === 'Completed'
                  ? 'done'
                  : v.status === 'Cancelled'
                    ? 'cancelled'
                    : 'open';
              return (
                <button
                  key={v.id}
                  type="button"
                  className={`visit-timeline-item${active ? ' active' : ''}`}
                  onClick={() => setSelectedVisitId(v.id)}
                >
                  <div className="vti-top">
                    <span className="vti-date">{fmtVisitWhen(v.visitDate)}</span>
                    <span className={`status-pill ${statusClass}`}>{v.status}</span>
                  </div>
                  <div className="vti-type">{v.visitType}</div>
                  <div className="vti-complaint">
                    {v.chiefComplaint || primaryDx?.description || 'No complaint recorded'}
                  </div>
                  <div className="vti-meta">
                    {v.clinicianName ?? 'Unassigned'}
                    {v.location ? ` · ${v.location}` : ''}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="panel visit-detail-panel">
        {(() => {
          const v: Visit | null =
            visits.find((x) => x.id === selectedVisitId) ?? visits[0] ?? null;
          if (!v) {
            return (
              <>
                <div className="panel-title">Encounter detail</div>
                <div className="empty">Select a visit to view its clinical encounter.</div>
              </>
            );
          }
          const vs = v.vitalSigns;
          return (
            <>
              <div className="panel-head">
                <div>
                  <div className="panel-title">Encounter detail</div>
                  <div className="visit-detail-sub">
                    {fmtVisitWhen(v.visitDate)} · {v.visitType}
                    {v.episodeLabel ? ` · Episode: ${v.episodeLabel}` : ''}
                  </div>
                </div>
                <span
                  className={`status-pill ${
                    v.status === 'Final' || v.status === 'Completed'
                      ? 'done'
                      : v.status === 'Cancelled'
                        ? 'cancelled'
                        : 'open'
                  }`}
                >
                  {v.status}
                </span>
              </div>

              <div className="visit-detail-grid">
                <div className="vd-field">
                  <div className="vd-label">Chief complaint</div>
                  <div className="vd-value">{v.chiefComplaint || '—'}</div>
                </div>
                <div className="vd-field">
                  <div className="vd-label">Clinician</div>
                  <div className="vd-value">{v.clinicianName || '—'}</div>
                </div>
                <div className="vd-field">
                  <div className="vd-label">Location</div>
                  <div className="vd-value">{v.location || v.department || '—'}</div>
                </div>
                <div className="vd-field">
                  <div className="vd-label">Check-in</div>
                  <div className="vd-value">{v.checkInAt ? fmtVisitWhen(v.checkInAt) : '—'}</div>
                </div>
              </div>

              <div className="vd-section">
                <div className="vd-section-title">Vitals</div>
                {!vs ? (
                  <div className="empty">No vitals recorded on this visit.</div>
                ) : (
                  <div className="vitals-readout">
                    <div className="vr-item">
                      <span className="vr-k">BP</span>
                      <span className="vr-v">{vs.bloodPressure ?? '—'}</span>
                    </div>
                    <div className="vr-item">
                      <span className="vr-k">Pulse</span>
                      <span className="vr-v">{vs.pulse != null ? `${vs.pulse}` : '—'}</span>
                    </div>
                    <div className="vr-item">
                      <span className="vr-k">Temp</span>
                      <span className="vr-v">
                        {vs.temperatureC != null ? `${vs.temperatureC}°C` : '—'}
                      </span>
                    </div>
                    <div className="vr-item">
                      <span className="vr-k">SpO₂</span>
                      <span className="vr-v">{vs.spo2 != null ? `${vs.spo2}%` : '—'}</span>
                    </div>
                    <div className="vr-item">
                      <span className="vr-k">Resp</span>
                      <span className="vr-v">
                        {vs.respiratoryRate != null ? `${vs.respiratoryRate}` : '—'}
                      </span>
                    </div>
                    <div className="vr-item">
                      <span className="vr-k">Weight</span>
                      <span className="vr-v">{vs.weightKg != null ? `${vs.weightKg} kg` : '—'}</span>
                    </div>
                    <div className="vr-item">
                      <span className="vr-k">Height</span>
                      <span className="vr-v">{vs.heightCm != null ? `${vs.heightCm} cm` : '—'}</span>
                    </div>
                    <div className="vr-item">
                      <span className="vr-k">Recorded by</span>
                      <span className="vr-v">{vs.recordedByName ?? '—'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="vd-section">
                <div className="vd-section-title">Diagnoses</div>
                {v.diagnoses.length === 0 ? (
                  <div className="empty">No diagnosis on this visit.</div>
                ) : (
                  <ul className="vd-list">
                    {v.diagnoses.map((d) => (
                      <li key={d.id}>
                        <strong>{d.isPrimary ? 'Primary' : 'Secondary'}</strong>
                        {d.code ? ` (${d.code})` : ''}: {d.description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="vd-section">
                <div className="vd-section-title">Clinical notes</div>
                {(v.notes?.length ?? 0) === 0 ? (
                  <div className="empty">No notes on this visit.</div>
                ) : (
                  <div className="vd-notes">
                    {v.notes.map((n) => (
                      <div key={n.id} className="vd-note">
                        <div className="vd-note-meta">
                          {n.noteType} · {n.authorName ?? 'Author'} · {fmtVisitWhen(n.createdAt)}
                        </div>
                        <div className="vd-note-body">{n.content}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="vd-section">
                <div className="vd-section-title">Plan & instructions</div>
                <div className="visit-detail-grid">
                  <div className="vd-field span2">
                    <div className="vd-label">Plan</div>
                    <div className="vd-value">{v.plan || '—'}</div>
                  </div>
                  <div className="vd-field span2">
                    <div className="vd-label">Instructions</div>
                    <div className="vd-value">{v.instructions || '—'}</div>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
