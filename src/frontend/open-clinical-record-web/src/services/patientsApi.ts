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
    const body = (await response.json()) as { message?: string; title?: string };
    if (body.message) return body.message;
    if (body.title) return body.title;
  } catch {
    /* ignore */
  }
  return `Request failed (${response.status})`;
}

export async function listPatients(q?: string): Promise<Patient[]> {
  const url = new URL(`${getApiBaseUrl()}/api/patients`);
  if (q?.trim()) url.searchParams.set('q', q.trim());

  const response = await fetch(url.toString(), { headers: authHeaders() });
  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as Patient[];
}

export async function createPatient(input: {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  sex?: string;
  phone?: string;
  email?: string;
}): Promise<Patient> {
  const response = await fetch(`${getApiBaseUrl()}/api/patients`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as Patient;
}
