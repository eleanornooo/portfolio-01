import { useEffect, useState } from 'react';

/**
 * Current time in ms. Starts at the build time so the pre-rendered HTML and the first
 * client render match, then switches to the real clock and ticks every `intervalMs`.
 */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState<number>(__BUILD_TIME__);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** False during pre-rendering and the hydration pass, true afterwards. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
