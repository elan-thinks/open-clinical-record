import { getApiBaseUrl } from './api';
import { getToken } from './authStorage';

export interface Patient {
  id: string;
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  sex?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: string;
}

export type PatientStatusFilter = 'active' | 'inactive' | 'all';

export interface PatientWritePayload {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  sex?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
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

export async function listPatients(
  q?: string,
  status: PatientStatusFilter = 'active',
): Promise<Patient[]> {
  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  if (q?.trim()) params.set('q', q.trim());
  if (status && status !== 'active') params.set('status', status);
  const qs = params.toString();
  const url = `${base}/api/patients${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Patient[];
}

export async function getPatient(id: string): Promise<Patient> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/patients/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Patient;
}

export async function createPatient(body: PatientWritePayload): Promise<Patient> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/patients`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Patient;
}

export async function updatePatient(id: string, body: PatientWritePayload): Promise<Patient> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/patients/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({
      firstName: body.firstName,
      lastName: body.lastName,
      dateOfBirth: body.dateOfBirth || null,
      sex: body.sex || null,
      phone: body.phone || null,
      email: body.email || null,
      isActive: body.isActive ?? true,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Patient;
}
