import { useEffect, useRef, type ReactNode } from 'react';
import './ConfirmDialog.css';

export type ConfirmTone = 'danger' | 'warning' | 'default';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * In-app confirmation modal (replaces window.confirm).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', onKey);

    // Focus primary action area
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="ocr-confirm-root" role="presentation">
      <button
        type="button"
        className="ocr-confirm-backdrop"
        aria-label="Close dialog"
        disabled={busy}
        onClick={() => {
          if (!busy) onCancel();
        }}
      />
      <div
        ref={panelRef}
        className={`ocr-confirm-panel tone-${tone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="ocr-confirm-title"
        aria-describedby={description ? 'ocr-confirm-desc' : undefined}
        tabIndex={-1}
      >
        <div className="ocr-confirm-icon" aria-hidden="true">
          {tone === 'danger' ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
              <path d="M12 8v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1" fill="currentColor" />
            </svg>
          )}
        </div>

        <h2 id="ocr-confirm-title" className="ocr-confirm-title">
          {title}
        </h2>

        {description && (
          <div id="ocr-confirm-desc" className="ocr-confirm-desc">
            {description}
          </div>
        )}

        <div className="ocr-confirm-actions">
          <button type="button" className="ocr-confirm-btn ghost" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`ocr-confirm-btn solid ${tone === 'danger' ? 'danger' : ''}`}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
