import type { AppRole } from '../types/auth';
import { getApiBaseUrl } from './api';
import { getToken } from './authStorage';

export interface UserListItem {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export interface RoleItem {
  id: string;
  name: string;
  userCount: number;
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
    const body = (await response.json()) as { message?: string };
    if (body.message) return body.message;
  } catch {
    /* ignore */
  }
  return `Request failed (${response.status})`;
}

export async function listUsers(): Promise<UserListItem[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/users`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as UserListItem[];
}

export async function createUser(input: {
  email: string;
  fullName: string;
  password: string;
  roles: AppRole[];
}): Promise<UserListItem> {
  const response = await fetch(`${getApiBaseUrl()}/api/users`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as UserListItem;
}

export async function setUserActive(id: string, isActive: boolean): Promise<UserListItem> {
  const response = await fetch(`${getApiBaseUrl()}/api/users/${id}/active`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ isActive }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as UserListItem;
}

export async function updateUserRoles(id: string, roles: string[]): Promise<UserListItem> {
  const response = await fetch(`${getApiBaseUrl()}/api/users/${id}/roles`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ roles }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as UserListItem;
}

export async function updateUserProfile(id: string, fullName: string): Promise<UserListItem> {
  const response = await fetch(`${getApiBaseUrl()}/api/users/${id}/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ fullName }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as UserListItem;
}

export async function resetUserPassword(id: string, newPassword: string): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/api/users/${id}/reset-password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ newPassword }),
  });
  if (!response.ok) throw new Error(await parseError(response));
}

export async function listRoles(): Promise<RoleItem[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/roles`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return (await response.json()) as RoleItem[];
}
