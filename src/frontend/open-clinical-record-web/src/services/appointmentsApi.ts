import { getToken } from './authStorage';

export type ApiErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'validation'
  | 'network'
  | 'unknown';

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(message: string, code: ApiErrorCode, status: number) {
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
  /** Today's appointments still Scheduled (not yet waiting/checked in). */
  scheduledCount: number;
  waitingCount: number;
  checkedInCount: number;
  inProgressCount?: number;
  activePatients: number;
  visitsThisWeek: number;
  /** Distinct patients with at least one recorded allergy. */
  patientsWithAllergies: number;
  /** @deprecated Prefer patientsWithAllergies — kept optional for older API payloads. */
  openChartAlerts?: number;
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

async function parseError(res: Response): Promise<never> {
  let message = `Request failed (${res.status})`;
  try {
    const body = await res.json();
    if (body && typeof body.message === 'string') message = body.message;
    else if (body && typeof body.title === 'string') message = body.title;
  } catch {
    /* ignore */
  }
  throw new ApiError(message, codeFromStatus(res.status), res.status);
}

export async function listAppointments(date?: string): Promise<Appointment[]> {
  const q = date ? `?date=${encodeURIComponent(date)}` : '';
  const res = await fetch(`/api/appointments${q}`, { headers: authHeaders() });
  if (!res.ok) await parseError(res);
  return (await res.json()) as Appointment[];
}

export async function createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
  return (await res.json()) as Appointment;
}

export async function updateAppointmentStatus(
  id: string,
  status: string,
  reason?: string,
): Promise<Appointment> {
  const res = await fetch(`/api/appointments/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status, reason: reason ?? '' }),
  });
  if (!res.ok) await parseError(res);
  return (await res.json()) as Appointment;
}

export interface ReschedulePayload {
  appointmentDate: string;
  startTime: string;
  durationMinutes?: number;
  providerName?: string;
  reason?: string;
}

export async function rescheduleAppointment(id: string, payload: ReschedulePayload): Promise<Appointment> {
  const res = await fetch(`/api/appointments/${id}/reschedule`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
  return (await res.json()) as Appointment;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats', { headers: authHeaders() });
  if (!res.ok) await parseError(res);
  return (await res.json()) as DashboardStats;
}
