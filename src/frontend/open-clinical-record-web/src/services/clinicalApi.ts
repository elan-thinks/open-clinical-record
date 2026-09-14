import { getApiBaseUrl } from './api';
import { getToken } from './authStorage';

export interface Allergy {
  id: string;
  substance: string;
  reaction?: string | null;
  severity: string;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  category: string;
  description: string;
  onsetDate?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface VitalSigns {
  id: string;
  bloodPressure?: string | null;
  pulse?: number | null;
  temperatureC?: number | null;
  respiratoryRate?: number | null;
  spo2?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;
  recordedByName?: string | null;
  recordedAt: string;
}

export interface Diagnosis {
  id: string;
  isPrimary: boolean;
  code?: string | null;
  description: string;
}

export interface ClinicalNote {
  id: string;
  noteType: string;
  content: string;
  authorName?: string | null;
  createdAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  visitDate: string;
  visitType: string;
  status: string;
  chiefComplaint?: string | null;
  plan?: string | null;
  instructions?: string | null;
  clinicianName?: string | null;
  createdAt: string;
  vitalSigns?: VitalSigns | null;
  diagnoses: Diagnosis[];
  notes: ClinicalNote[];
}

export interface PatientChart {
  patientId: string;
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  sex?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  status: string;
  allergies: Allergy[];
  medicalHistory: HistoryItem[];
  visits: Visit[];
}

export interface CreateVisitPayload {
  visitType?: string;
  chiefComplaint?: string;
  bloodPressure?: string;
  pulse?: number;
  temperatureC?: number;
  respiratoryRate?: number;
  spo2?: number;
  weightKg?: number;
  heightCm?: number;
  primaryDiagnosisCode?: string;
  primaryDiagnosis?: string;
  secondaryDiagnosisCode?: string;
  secondaryDiagnosis?: string;
  clinicalNote?: string;
  plan?: string;
  instructions?: string;
  status?: string;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      message?: string;
      title?: string;
      errors?: Record<string, string[]>;
    };
    if (data.message) return data.message;
    if (data.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (first) return first;
    }
    if (data.title) return data.title;
  } catch {
    /* ignore */
  }
  return `Request failed (${response.status})`;
}

export async function getPatientChart(patientId: string): Promise<PatientChart> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/patients/${patientId}/chart`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as PatientChart;
}

export async function addAllergy(
  patientId: string,
  body: { substance: string; reaction?: string; severity?: string },
): Promise<Allergy> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/patients/${patientId}/chart/allergies`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Allergy;
}

export async function addHistoryItem(
  patientId: string,
  body: { category?: string; description: string; onsetDate?: string },
): Promise<HistoryItem> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/patients/${patientId}/chart/history`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as HistoryItem;
}

export async function createVisit(patientId: string, body: CreateVisitPayload): Promise<Visit> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/patients/${patientId}/chart/visits`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Visit;
}
