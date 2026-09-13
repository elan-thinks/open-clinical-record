export type AppRole = 'Doctor' | 'Nurse' | 'Receptionist' | 'Admin';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roles: AppRole[];
}

export interface LoginResult {
  accessToken: string;
  expiresAt: string;
  email: string;
  fullName: string;
  roles: string[];
}
