import type { DeathRecord } from '../../services/patientsApi';
import type { Appointment } from '../../services/appointmentsApi';

function formatDob(dob?: string | null): string {
  if (!dob) return '-';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return dob;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDate(value?: string | null): string {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ageFromDob(dob?: string | null): string {
  if (!dob) return '-';
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return '-';
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return `${age}`;
}

export interface DeceasedTabPanelProps {
  isDeceased: boolean;
  patient: {
    patientId: string;
    firstName: string;
    lastName: string;
    medicalRecordNumber: string;
    sex?: string | null;
    dateOfBirth?: string | null;
  };
  deathRecord: DeathRecord | null;
  appointments: Appointment[];
  saving: boolean;
  onClear: () => void;
}

export function DeceasedTabPanel({
  isDeceased,
  patient,
  deathRecord,
  appointments,
  saving,
  onClear,
}: DeceasedTabPanelProps) {
  const cancelled = appointments.filter((a) => a.status === 'Cancelled').length;

  return (
    <div className="deceased-tab">
      <div className="panel">
        <div className="panel-title">Deceased status</div>
        {!isDeceased ? (
          <div className="empty">
            Patient is active. Use <strong>Mark deceased</strong> in the header to record a death
            (date, notes, and staff attribution are stored).
          </div>
        ) : (
          <>
            <div className="death-status-pill active-death">
              <span className="death-status-dot" />
              Active deceased record
            </div>

            <div className="death-grid">
              <div className="death-field">
                <span className="death-label">Patient</span>
                <span className="death-value">
                  {patient.firstName} {patient.lastName}
                </span>
                <span className="death-sub">{patient.medicalRecordNumber}</span>
              </div>
              <div className="death-field">
                <span className="death-label">Sex / age</span>
                <span className="death-value">
                  {patient.sex || '—'} · {ageFromDob(patient.dateOfBirth)} yrs
                </span>
                <span className="death-sub">DOB {formatDob(patient.dateOfBirth)}</span>
              </div>
              <div className="death-field">
                <span className="death-label">Date of death</span>
                <span className="death-value">
                  {deathRecord?.dateOfDeath ? formatDob(deathRecord.dateOfDeath) : 'Not specified'}
                </span>
              </div>
              <div className="death-field">
                <span className="death-label">Recorded at</span>
                <span className="death-value">
                  {deathRecord ? fmtDate(deathRecord.recordedAt) : '—'}
                </span>
              </div>
              <div className="death-field">
                <span className="death-label">Recorded by</span>
                <span className="death-value">{deathRecord?.recordedByName || 'Staff'}</span>
              </div>
              <div className="death-field">
                <span className="death-label">Record status</span>
                <span className="death-value">{deathRecord?.isActive ? 'Active' : 'Cleared'}</span>
              </div>
            </div>

            <div className="death-notes-block">
              <div className="death-label">Clinical / administrative notes</div>
              {deathRecord?.note ? (
                <p className="death-notes-body">{deathRecord.note}</p>
              ) : (
                <p className="muted">No note was recorded when this status was set.</p>
              )}
            </div>

            <div className="death-impact">
              <div className="death-label">Impact on care</div>
              <ul className="death-impact-list">
                <li>Historical chart, visits, and notes are retained for audit</li>
                <li>New appointments cannot be booked for this patient</li>
                <li>New clinical activity (vitals, visits, allergies) is blocked</li>
                <li>
                  Future / open appointments were cancelled when status was set ({cancelled} cancelled
                  on file)
                </li>
              </ul>
            </div>

            {deathRecord?.clearedAt && (
              <div className="death-cleared-box">
                <div className="death-label">Previously cleared</div>
                <p>
                  Cleared {fmtDate(deathRecord.clearedAt)}
                  {deathRecord.clearedByName ? ` by ${deathRecord.clearedByName}` : ''}
                </p>
              </div>
            )}

            <p className="muted death-clear-hint">
              Clear deceased only if this was recorded in error. The clearance is logged with your name
              and timestamp.
            </p>
            <button type="button" className="btn-primary" disabled={saving} onClick={onClear}>
              Clear deceased status
            </button>
          </>
        )}
      </div>

      {!isDeceased && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-title">How marking works</div>
          <ul className="death-impact-list">
            <li>You can enter an optional date of death and a free-text note</li>
            <li>Your name is stored as the recording clinician</li>
            <li>Details appear on this tab for audit and administrative review</li>
          </ul>
        </div>
      )}
    </div>
  );
}
