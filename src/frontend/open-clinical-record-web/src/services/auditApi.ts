import { getApiBaseUrl } from './api';
import { getToken } from './authStorage';

export interface AuditEventItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorUserId: string | null;
  actorName: string | null;
  summary: string | null;
  createdAt: string;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string };
    if (body.message) return body.message;
  } catch {
    /* ignore */
  }
  if (response.status === 403) return 'Admin role required to view audit logs.';
  if (response.status === 401) return 'Session expired. Please sign in again.';
  return `Request failed (${response.status})`;
}

export async function listAuditEvents(opts?: {
  entityType?: string;
  entityId?: string;
  take?: number;
}): Promise<AuditEventItem[]> {
  const params = new URLSearchParams();
  if (opts?.entityType) params.set('entityType', opts.entityType);
  if (opts?.entityId) params.set('entityId', opts.entityId);
  params.set('take', String(opts?.take ?? 50));

  const response = await fetch(`${getApiBaseUrl()}/api/audit?${params}`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as AuditEventItem[];
}
