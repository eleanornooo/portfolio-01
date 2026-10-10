import { useEffect, useRef, type ReactNode } from 'react';
import { loadGsap } from '../lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '../lib/motion';

/**
 * Lets a primary button drift toward the cursor (desktop only). The wrapper is
 * `display: inline-block` and adds no semantics; keyboard focus is unaffected.
 */
export default function Magnetic({ children, strength = 0.32 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return;
    let off = () => {};
    let cancelled = false;
    loadGsap().then(({ gsap }) => {
      if (cancelled) return;
      const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * strength);
        y((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      off = () => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
        gsap.killTweensOf(el);
      };
    });
    return () => {
      cancelled = true;
      off();
    };
  }, [strength]);

  return (
    <span ref={ref} className="inline-block" data-cursor="magnetic">
      {children}
    </span>
  );
}
