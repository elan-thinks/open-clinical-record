import { useEffect, useRef } from 'react';

/** Scroll a flash/error/success element into view whenever `active` becomes true or message text changes. */
export function useScrollMessageIntoView<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    // Wait one frame so layout is ready (banner just mounted).
    const id = window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    });
    return () => window.cancelAnimationFrame(id);
  }, [active]);

  return ref;
}
