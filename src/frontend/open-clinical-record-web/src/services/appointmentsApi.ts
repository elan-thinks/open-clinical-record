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
    const data = (await response.json()) as { message?: string; title?: string };
    if (data.message) return data.message;
    if (data.title) return data.title;
  } catch {
    /* ignore */
  }
  return `Request failed (${response.status})`;
}

export async function listAppointments(date?: string, status?: string): Promise<Appointment[]> {
  const base = getApiBaseUrl();
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (status) params.set('status', status);
  const qs = params.toString();
  const res = await fetch(`${base}/api/appointments${qs ? `?${qs}` : ''}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as Appointment[];
}

export async function createAppointment(body: CreateAppointmentPayload): Promise<Appointment> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/appointments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await parseError(res));
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
  if (!res.ok) throw new Error(await parseError(res));
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
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as AppointmentEvent[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/dashboard/stats`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as DashboardStats;
}
