import type { AuthUser, LoginResult } from '../types/auth';
import { getApiBaseUrl } from './api';
import { clearSession } from './authStorage';

export async function loginRequest(email: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    let message = 'Invalid email or password.';
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return (await response.json()) as LoginResult;
}

export async function fetchMe(token: string): Promise<AuthUser> {
  const response = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    clearSession();
    throw new Error('Session expired. Please sign in again.');
  }

  const body = (await response.json()) as {
    id: string;
    email: string;
    fullName: string;
    roles: string[];
  };

  return {
    id: body.id,
    email: body.email,
    fullName: body.fullName,
    roles: body.roles as AuthUser['roles'],
  };
}
