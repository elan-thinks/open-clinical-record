import type { FormEvent } from 'react';

type Props = {
  saving: boolean;
  chiefComplaint: string;
  setChiefComplaint: (v: string) => void;
  cBp: string;
  setCBp: (v: string) => void;
  cPulse: string;
  setCPulse: (v: string) => void;
  cTemp: string;
  setCTemp: (v: string) => void;
  cSpo2: string;
  setCSpo2: (v: string) => void;
  primaryDx: string;
  setPrimaryDx: (v: string) => void;
  secondaryDx: string;
  setSecondaryDx: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  plan: string;
  setPlan: (v: string) => void;
  instructions: string;
  setInstructions: (v: string) => void;
  onSave: (e: FormEvent) => void;
  onCancel: () => void;
};

export function ConsultationForm(p: Props) {
  return (
    <form onSubmit={p.onSave}>
      <div className="panel">
        <div className="section-title">1. Visit</div>
        <div className="form-grid">
          <div className="field span-2">
            <label className="label">Chief complaint</label>
            <input
              className="input"
              value={p.chiefComplaint}
              onChange={(e) => p.setChiefComplaint(e.target.value)}
              placeholder="Reason for visit"
            />
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="section-title">2. Vital signs</div>
        <div className="form-grid">
          <div className="field">
            <label className="label">BP</label>
            <input className="input" value={p.cBp} onChange={(e) => p.setCBp(e.target.value)} placeholder="120/80" />
          </div>
          <div className="field">
            <label className="label">Pulse</label>
            <input className="input" value={p.cPulse} onChange={(e) => p.setCPulse(e.target.value)} placeholder="72" />
          </div>
          <div className="field">
            <label className="label">Temp C</label>
            <input className="input" value={p.cTemp} onChange={(e) => p.setCTemp(e.target.value)} placeholder="36.8" />
          </div>
          <div className="field">
            <label className="label">SpO2 %</label>
            <input className="input" value={p.cSpo2} onChange={(e) => p.setCSpo2(e.target.value)} placeholder="98" />
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="section-title">3. Diagnosis</div>
        <div className="form-grid">
          <div className="field span-2">
            <label className="label">Primary diagnosis (code or free text)</label>
            <input
              className="input"
              value={p.primaryDx}
              onChange={(e) => p.setPrimaryDx(e.target.value)}
              placeholder="e.g. I10 Essential hypertension"
            />
          </div>
          <div className="field span-2">
            <label className="label">Secondary / other</label>
            <input className="input" value={p.secondaryDx} onChange={(e) => p.setSecondaryDx(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="section-title">4. Clinical notes (doctor notes)</div>
        <textarea
          className="textarea"
          value={p.note}
          onChange={(e) => p.setNote(e.target.value)}
          placeholder="SOAP or free-text note..."
        />
      </div>
      <div className="panel">
        <div className="section-title">5. Plan / follow-up</div>
        <div className="form-grid">
          <div className="field span-2">
            <label className="label">Plan</label>
            <input className="input" value={p.plan} onChange={(e) => p.setPlan(e.target.value)} />
          </div>
          <div className="field span-2">
            <label className="label">Instructions to patient</label>
            <input className="input" value={p.instructions} onChange={(e) => p.setInstructions(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={p.onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={p.saving}>
          {p.saving ? 'Saving...' : 'Save consultation'}
        </button>
      </div>
    </form>
  );
}
