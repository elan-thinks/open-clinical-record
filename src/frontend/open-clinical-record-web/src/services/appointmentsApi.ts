import { getApiBaseUrl } from './api';
import { getToken } from './authStorage';

export type ApiErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'conflict'
  | 'validation'
  | 'not_found'
  | 'network'
  | 'unknown';

/** Typed API failure used by appointment pages (e.g. AppointmentCreatePage). */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(message: string, code: ApiErrorCode = 'unknown', status = 0) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  medicalRecordNumber: string;
  appointmentDate: string;
  startTime: string;
  durationMinutes: number;
  appointmentType: string;
  status: string;
  providerName?: string | null;
  reason?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CreateAppointmentPayload {
  patientId: string;
  appointmentDate: string;
  startTime: string;
  durationMinutes?: number;
  appointmentType?: string;
  providerName?: string;
  reason?: string;
  notes?: string;
}

export interface DashboardStats {
  appointmentsToday: number;
  waitingCount: number;
  checkedInCount: number;
  activePatients: number;
  visitsThisWeek: number;
  openChartAlerts: number;
  todaysSchedule: Appointment[];
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function codeFromStatus(status: number): ApiErrorCode {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 409) return 'conflict';
  if (status === 400 || status === 422) return 'validation';
  return 'unknown';
}

async function throwApiError(response: Response): Promise<never> {
  let message = `Request failed (${response.status})`;
  try {
    const data = (await response.json()) as { message?: string; title?: string };
    if (data.message) message = data.message;
    else if (data.title) message = data.title;
  } catch {
    /* ignore body parse */
  }
  throw new ApiError(message, codeFromStatus(response.status), response.status);
}

async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch {
    throw new ApiError(
      'Cannot reach the server. Check your connection and try again.',
      'network',
      0,
    );
  }
}

export async function listAppointments(date?: string, status?: string): Promise<Appointment[]> {
  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (status) params.set('status', status);
  const qs = params.toString();
  const res = await apiFetch(`${base}/api/appointments${qs ? `?${qs}` : ''}`, { headers: authHeaders() });
  if (!res.ok) await throwApiError(res);
  return (await res.json()) as Appointment[];
}

export async function createAppointment(body: CreateAppointmentPayload): Promise<Appointment> {
  const base = getApiBaseUrl();
  const res = await apiFetch(`${base}/api/appointments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) await throwApiError(res);
  return (await res.json()) as Appointment;
}

export async function updateAppointmentStatus(
  id: string,
  status: string,
  reason?: string,
): Promise<Appointment> {
  const trimmed = (reason ?? '').trim();
  if (status.toLowerCase() === 'cancelled' && !trimmed) {
    throw new ApiError(
      'A reason is required when cancelling an appointment.',
      'validation',
      400,
    );
  }
  const base = getApiBaseUrl();
  // Always include reason as a string so model binding never drops the property
  const payload: { status: string; reason: string } = {
    status,
    reason: trimmed,
  };
  const res = await apiFetch(`${base}/api/appointments/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await throwApiError(res);
  return (await res.json()) as Appointment;
}

export interface ReschedulePayload {
  appointmentDate: string;
  startTime: string;
  durationMinutes?: number;
  providerName?: string;
  reason?: string;
}

export async function rescheduleAppointment(
  id: string,
  body: ReschedulePayload,
): Promise<Appointment> {
  const base = getApiBaseUrl();
  const res = await apiFetch(`${base}/api/appointments/${id}/reschedule`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) await throwApiError(res);
  return (await res.json()) as Appointment;
}

export interface AppointmentEvent {
  id: string;
  appointmentId: string;
  fromStatus: string;
  toStatus: string;
  reason?: string | null;
  actorName?: string | null;
  createdAt: string;
}

export async function listAppointmentEvents(id: string): Promise<AppointmentEvent[]> {
  const base = getApiBaseUrl();
  const res = await apiFetch(`${base}/api/appointments/${id}/events`, { headers: authHeaders() });
  if (!res.ok) await throwApiError(res);
  return (await res.json()) as AppointmentEvent[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const base = getApiBaseUrl();
  const res = await apiFetch(`${base}/api/dashboard/stats`, { headers: authHeaders() });
  if (!res.ok) await throwApiError(res);
  return (await res.json()) as DashboardStats;
}
