// Scroll reveals for every [data-reveal] element inside a scope (see .rv-* in index.css).
// Content is visible by default: elements are only hidden ("armed") after hydration, when
// they start below the fold and motion is allowed, so the pre-rendered HTML, reduced motion
// and no-JS visitors always get the full page.
import { useEffect, type RefObject } from 'react';
import { prefersReducedMotion } from './motion';

/** Arms the reveals under `root`; returns the cleanup. */
export function armReveals(root: ParentNode): () => void {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return () => {};
  const timers: number[] = [];
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        io.unobserve(el);
        el.classList.add('rv-in');
        // Once played, drop the reveal styles so hover transitions are not delayed.
        timers.push(window.setTimeout(() => el.classList.remove('rv-armed', 'rv-in'), 1800));
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.08 },
  );
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    if (el.classList.contains('rv-armed')) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // on screen at load
    if (el.dataset.reveal === 'stagger') {
      Array.from(el.children).forEach((c, i) => (c as HTMLElement).style.setProperty('--i', String(i)));
    }
    if (el.dataset.reveal === 'mask') {
      el.querySelectorAll<HTMLElement>('.rv-line').forEach((l, i) => l.style.setProperty('--l', String(i)));
    }
    el.classList.add('rv-armed');
    io.observe(el);
  });
  return () => {
    io.disconnect();
    timers.forEach((t) => window.clearTimeout(t));
  };
}

export function useReveals(scope: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    return armReveals(el);
  }, [scope]);
}
