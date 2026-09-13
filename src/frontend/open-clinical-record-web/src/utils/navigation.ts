import type { AppRole } from '../types/auth';
import type { NavGroup, RoleNavMap } from '../types/navigation';

export const ROLE_NAV: RoleNavMap = {
  Doctor: [
    {
      label: 'Overview',
      items: [{ path: '/dashboard', label: 'Dashboard' }],
    },
    {
      label: 'Patient care',
      items: [
        { path: '/patients', label: 'Patients' },
        { path: '/chart', label: 'Medical Chart' },
        { path: '/records', label: 'Medical Records' },
        { path: '/appointments', label: 'Appointments' },
      ],
    },
    {
      label: 'Insights',
      items: [
        { path: '/reports', label: 'Reports' },
        { path: '/profile', label: 'Profile' },
      ],
    },
  ],
  Nurse: [
    {
      label: 'Overview',
      items: [{ path: '/dashboard', label: 'Dashboard' }],
    },
    {
      label: 'Patient care',
      items: [
        { path: '/patients', label: 'Patients' },
        { path: '/chart', label: 'Medical Chart' },
        { path: '/vitals', label: 'Record vitals' },
        { path: '/records', label: 'Medical Records' },
        { path: '/appointments', label: 'Appointments' },
      ],
    },
    {
      label: 'Account',
      items: [{ path: '/profile', label: 'Profile' }],
    },
  ],
  Receptionist: [
    {
      label: 'Overview',
      items: [{ path: '/dashboard', label: 'Dashboard' }],
    },
    {
      label: 'Front desk',
      items: [
        { path: '/patients', label: 'Patients' },
        { path: '/appointments', label: 'Appointments' },
        { path: '/register', label: 'Registration' },
        { path: '/checkin', label: 'Check-in / Queue' },
      ],
    },
    {
      label: 'Account',
      items: [{ path: '/profile', label: 'Profile' }],
    },
  ],
  Admin: [
    {
      label: 'Overview',
      items: [{ path: '/dashboard', label: 'Dashboard' }],
    },
    {
      label: 'Administration',
      items: [
        { path: '/admin/users', label: 'Users' },
        { path: '/admin/roles', label: 'Roles & Permissions' },
        { path: '/patients', label: 'Patients' },
        { path: '/admin/audit', label: 'Audit Logs' },
        { path: '/reports', label: 'Reports' },
      ],
    },
    {
      label: 'Account',
      items: [{ path: '/profile', label: 'Profile' }],
    },
  ],
};

export function getNavForRole(role: AppRole): NavGroup[] {
  return ROLE_NAV[role] ?? ROLE_NAV.Doctor;
}

export function primaryRole(roles: string[]): AppRole {
  const order: AppRole[] = ['Admin', 'Doctor', 'Nurse', 'Receptionist'];
  for (const r of order) {
    if (roles.includes(r)) return r;
  }
  return 'Doctor';
}

/** Simple geometric icons matching mock intent. */
export function navIcon(path: string): string {
  const map: Record<string, string> = {
    '/dashboard': 'grid',
    '/patients': 'person',
    '/chart': 'doc',
    '/records': 'folder',
    '/appointments': 'cal',
    '/vitals': 'pulse',
    '/register': 'plus',
    '/checkin': 'list',
    '/reports': 'chart',
    '/profile': 'user',
    '/admin/users': 'users',
    '/admin/roles': 'shield',
    '/admin/audit': 'audit',
  };
  return map[path] ?? 'dot';
}
