import { Icon } from '../components/Icon';

/** Sidebar nav icons — thin wrapper over shared Icon set */
export function NavIcon({ name }: { name: string }) {
  return <Icon name={name} size={16} strokeWidth={1.8} />;
}
