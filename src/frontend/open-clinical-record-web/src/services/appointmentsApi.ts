import { getApiBaseUrl } from './api';
import { getToken } from './authStorage';

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

export type ApiErrorCode = 'unauthorized' | 'forbidden' | 'conflict' | 'validation' | 'network' | 'unknown';

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

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseError(response: Response): Promise<ApiError> {
  if (response.status === 401) {
    return new ApiError(
      'Your session has expired. Please sign in again to continue.',
      'unauthorized',
      401,
    );
  }
  if (response.status === 403) {
    return new ApiError(
      'You do not have permission to book appointments with this account. Sign out, then sign in again with a staff account (Reception, Doctor, Nurse, or Admin).',
      'forbidden',
      403,
    );
  }
  if (response.status === 409) {
    let msg = 'That time slot conflicts with another appointment. Choose a different time.';
    try {
      const data = (await response.json()) as { message?: string };
      if (data.message) msg = data.message;
    } catch {
      /* ignore */
    }
    return new ApiError(msg, 'conflict', 409);
  }
  try {
    const data = (await response.json()) as { message?: string; title?: string };
    if (data.message) return new ApiError(data.message, 'validation', response.status);
    if (data.title) return new ApiError(data.title, 'validation', response.status);
  } catch {
    /* ignore */
  }
  return new ApiError('Something went wrong while saving. Please try again.', 'unknown', response.status);
}

export async function listAppointments(date?: string, status?: string): Promise<Appointment[]> {
  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (status) params.set('status', status);
  const qs = params.toString();
  const res = await fetch(`${base}/api/appointments${qs ? `?${qs}` : ''}`, { headers: authHeaders() });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as Appointment[];
}

export async function createAppointment(body: CreateAppointmentPayload): Promise<Appointment> {
  const base = getApiBaseUrl();
  let res: Response;
  try {
    res = await fetch(`${base}/api/appointments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check that the API is running, then try again.', 'network', 0);
  }
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as Appointment;
}

export async function updateAppointmentStatus(
  id: string,
  status: string,
  reason?: string,
): Promise<Appointment> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/appointments/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status, reason }),
  });
  if (!res.ok) throw await parseError(res);
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
  const res = await fetch(`${base}/api/appointments/${id}/events`, { headers: authHeaders() });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as AppointmentEvent[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/dashboard/stats`, { headers: authHeaders() });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as DashboardStats;
}
