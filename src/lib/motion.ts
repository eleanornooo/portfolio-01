import { useEffect, useState } from 'react';

export const canUseDOM = typeof window !== 'undefined';

const REDUCED = '(prefers-reduced-motion: reduce)';
const FINE = '(hover: hover) and (pointer: fine)';
/** Phones and touch-first devices get the lighter versions of the heavy visuals. */
const LITE = '(max-width: 767px), (pointer: coarse)';

const query = (q: string) => canUseDOM && window.matchMedia(q).matches;

export const prefersReducedMotion = () => query(REDUCED);
export const hasFinePointer = () => query(FINE);
export const isLiteDevice = () => query(LITE);

function useMedia(q: string): boolean {
  // False while pre-rendering and hydrating, so the server and first client render match.
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [q]);
  return match;
}

export const useReducedMotion = () => useMedia(REDUCED);
export const useFinePointer = () => useMedia(FINE);

/** Runs `fn` once the browser is idle after the first paint (with a deadline). */
export function whenIdle(fn: () => void, timeout = 1800): () => void {
  let cancelled = false;
  let idleId = 0;
  const run = () => {
    if (cancelled) return;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) idleId = w.requestIdleCallback(() => !cancelled && fn(), { timeout });
    else idleId = window.setTimeout(() => !cancelled && fn(), 200);
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener('load', run);
    const w = window as Window & { cancelIdleCallback?: (id: number) => void };
    if (w.cancelIdleCallback) w.cancelIdleCallback(idleId);
    else window.clearTimeout(idleId);
  };
}

/** Calls `fn` the first time `el` comes within `margin` of the viewport. */
export function whenNear(el: Element, fn: () => void, margin = '300px'): () => void {
  if (!('IntersectionObserver' in window)) {
    fn();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        fn();
      }
    },
    { rootMargin: margin },
  );
  io.observe(el);
  return () => io.disconnect();
}
