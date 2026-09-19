import { useEffect, useRef, useState } from 'react';
import './PageLoader.css';

export type LoaderVariant = 'pulse' | 'skeleton' | 'inline' | 'session';

interface PageLoaderProps {
  /** Short message under the animation */
  label?: string;
  variant?: LoaderVariant;
  /** Number of skeleton rows (skeleton variant) */
  rows?: number;
  className?: string;
}

/**
 * Keep a loading flag true for at least `minMs` so the cute loader
 * stays on screen even when the API is very fast.
 * Default ~2.8s — enough time to enjoy the animation.
 */
export function useHoldLoading(isLoading: boolean, minMs = 2800): boolean {
  const [held, setHeld] = useState(isLoading);
  const startedAt = useRef<number | null>(isLoading ? Date.now() : null);

  useEffect(() => {
    if (isLoading) {
      startedAt.current = Date.now();
      setHeld(true);
      return;
    }

    if (startedAt.current == null) {
      setHeld(false);
      return;
    }

    const elapsed = Date.now() - startedAt.current;
    const wait = Math.max(0, minMs - elapsed);
    const t = window.setTimeout(() => {
      setHeld(false);
      startedAt.current = null;
    }, wait);

    return () => window.clearTimeout(t);
  }, [isLoading, minMs]);

  return held;
}

/**
 * Shared loading UI — pulse (hero), skeleton (lists), inline (compact), session (auth).
 * Centered on the viewport for pulse/session variants.
 */
export function PageLoader({
  label = 'Loading…',
  variant = 'pulse',
  rows = 4,
  className,
}: PageLoaderProps) {
  if (variant === 'skeleton') {
    return (
      <div
        className={`ocr-loader ocr-loader-skeleton ocr-loader-centered${className ? ` ${className}` : ''}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">{label}</span>
        <div className="ocr-skel-inner">
          <div className="ocr-skel-header">
            <div className="ocr-skel-avatar ocr-shimmer" />
            <div className="ocr-skel-lines">
              <div className="ocr-skel-line w-40 ocr-shimmer" />
              <div className="ocr-skel-line w-24 ocr-shimmer" />
            </div>
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="ocr-skel-row">
              <div className={`ocr-skel-line ocr-shimmer w-${[55, 70, 45, 80, 60][i % 5]}`} />
              <div className="ocr-skel-pill ocr-shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`ocr-loader ocr-loader-inline${className ? ` ${className}` : ''}`} role="status" aria-live="polite">
        <span className="ocr-spinner" aria-hidden="true" />
        <span className="ocr-loader-label">{label}</span>
      </div>
    );
  }

  // pulse | session — centered in the viewport
  return (
    <div
      className={`ocr-loader ocr-loader-pulse ocr-loader-viewport-center${variant === 'session' ? ' session' : ''}${className ? ` ${className}` : ''}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="ocr-pulse-stage" aria-hidden="true">
        <span className="ocr-ring r1" />
        <span className="ocr-ring r2" />
        <span className="ocr-ring r3" />
        <span className="ocr-core">
          <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
            <path
              d="M16 6v8M12 10h8M8 18c0 4.4 3.6 8 8 8s8-3.6 8-8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M6 18h4l2-3 3 6 2-4h9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ocr-ecg"
            />
          </svg>
        </span>
      </div>
      <p className="ocr-loader-label">{label}</p>
      <p className="ocr-loader-hint">Fetching clinical data securely…</p>
    </div>
  );
}
