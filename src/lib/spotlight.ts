// Cursor-following glow for every .spot card inside a scope: one delegated listener writes
// the pointer position into --mx / --my on the card under it (see .spot in index.css).
import { useEffect, type RefObject } from 'react';
import { hasFinePointer } from './motion';

export function useSpotlight(scope: RefObject<HTMLElement>) {
  useEffect(() => {
    const root = scope.current;
    if (!root || !hasFinePointer()) return;
    let raf = 0;
    let last: PointerEvent | null = null;
    const apply = () => {
      raf = 0;
      const e = last;
      if (!e) return;
      const card = (e.target as Element).closest<HTMLElement>('.spot');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    const move = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    root.addEventListener('pointermove', move, { passive: true });
    return () => {
      root.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, [scope]);
}
