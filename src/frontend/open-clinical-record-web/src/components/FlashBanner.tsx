import type { ReactNode } from 'react';
import { useScrollMessageIntoView } from '../hooks/useScrollMessageIntoView';
import './FlashBanner.css';

export type FlashTone = 'error' | 'success' | 'warning' | 'info';

interface FlashBannerProps {
  tone?: FlashTone;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Shared page message. Always scrolls into view when shown so the user does not need to hunt for it.
 */
export function FlashBanner({ tone = 'error', title, children, actions, className }: FlashBannerProps) {
  const ref = useScrollMessageIntoView<HTMLDivElement>(true);

  return (
    <div
      ref={ref}
      className={`flash-banner flash-${tone}${className ? ` ${className}` : ''}`}
      role="alert"
      data-flash="true"
    >
      {title && <div className="flash-title">{title}</div>}
      <div className="flash-body">{children}</div>
      {actions && <div className="flash-actions">{actions}</div>}
    </div>
  );
}
