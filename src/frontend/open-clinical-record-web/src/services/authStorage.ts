import type { AppRole, AuthUser } from '../types/auth';

const TOKEN_KEY = 'ocr_access_token';
const USER_KEY = 'ocr_user';

export function saveSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/** Demo user when not logged in yet — layout still works. */
export function demoUser(role: AppRole): AuthUser {
  const names: Record<AppRole, string> = {
    Doctor: 'Dr. Samuel Clinician',
    Nurse: 'Nurse Ayana',
    Receptionist: 'Front Desk',
    Admin: 'System Administrator',
  };
  return {
    id: 'demo',
    email: `${role.toLowerCase()}@clinic.local`,
    fullName: names[role],
    roles: [role],
  };
}
