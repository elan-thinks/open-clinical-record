import type { AuthUser, LoginResult } from '../types/auth';
import { getApiBaseUrl } from './api';
import { clearSession, getToken } from './authStorage';

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
    mustChangePassword?: boolean;
  };

  return {
    id: body.id,
    email: body.email,
    fullName: body.fullName,
    roles: body.roles as AuthUser['roles'],
    mustChangePassword: body.mustChangePassword ?? false,
  };
}

export async function changePasswordRequest(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error('Not signed in.');

  const response = await fetch(`${getApiBaseUrl()}/api/auth/change-password`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });

  if (!response.ok) {
    let message = 'Could not change password.';
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
}
