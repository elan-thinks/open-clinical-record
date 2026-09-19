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
  scheduledCount: number;
  waitingCount: number;
  checkedInCount: number;
  inProgressCount: number;
  activePatients: number;
  visitsThisWeek: number;
  /** Patients with at least one allergy on chart (not "open alerts"). */
  patientsWithAllergies: number;
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
      'You do not have permission for this appointment action with this account. Use Reception, Doctor, or Nurse for status changes; Admin may book/reschedule only.',
      'forbidden',
      403,
    );
  }
  if (response.status === 409) {
    let msg = 'That time slot conflicts with another appointment. Choose a different time.';
    try {
      const body = await response.json();
      if (body?.message) msg = String(body.message);
    } catch {
      /* ignore */
    }
    return new ApiError(msg, 'conflict', 409);
  }
  let message = `Request failed (${response.status})`;
  try {
    const body = await response.json();
    if (body?.message) message = String(body.message);
    else if (body?.title) message = String(body.title);
  } catch {
    /* ignore */
  }
  return new ApiError(message, response.status >= 400 && response.status < 500 ? 'validation' : 'unknown', response.status);
}

export async function listAppointments(date?: string, status?: string): Promise<Appointment[]> {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (status) params.set('status', status);
  const q = params.toString();
  const res = await fetch(`${getApiBaseUrl()}/api/appointments${q ? `?${q}` : ''}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as Appointment[];
}

export async function getAppointment(id: string): Promise<Appointment> {
  const res = await fetch(`${getApiBaseUrl()}/api/appointments/${id}`, { headers: authHeaders() });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as Appointment;
}

export async function createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
  const res = await fetch(`${getApiBaseUrl()}/api/appointments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as Appointment;
}

export async function updateAppointmentStatus(
  id: string,
  status: string,
  reason?: string,
): Promise<Appointment> {
  const res = await fetch(`${getApiBaseUrl()}/api/appointments/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status, reason }),
  });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as Appointment;
}

export async function rescheduleAppointment(
  id: string,
  payload: {
    appointmentDate: string;
    startTime: string;
    durationMinutes?: number;
    providerName?: string;
    reason?: string;
  },
): Promise<Appointment> {
  const res = await fetch(`${getApiBaseUrl()}/api/appointments/${id}/reschedule`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as Appointment;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${getApiBaseUrl()}/api/dashboard/stats`, { headers: authHeaders() });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as DashboardStats;
}
