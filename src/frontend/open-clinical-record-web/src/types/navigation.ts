import type { AppRole } from './auth';

export interface NavItem {
  path: string;
  label: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export type RoleNavMap = Record<AppRole, NavGroup[]>;
