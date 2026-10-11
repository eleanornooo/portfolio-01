import { useEffect, useRef } from 'react';
import { hasFinePointer, prefersReducedMotion } from '../lib/motion';

const INTERACTIVE = 'a, button, [role="button"], label, summary, [data-cursor]';

/**
 * Custom cursor (desktop with a fine pointer only, never with reduced motion): a dot that
 * tracks the pointer exactly and a ring that follows with a little lag. Both use
 * `mix-blend-mode: difference`, so they read on dark and light sections alike. The ring
 * grows over links and buttons. Text fields keep the native cursor.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = dot.current;
    const r = ring.current;
    if (!d || !r || !hasFinePointer() || prefersReducedMotion()) return;
    const html = document.documentElement;
    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let raf = 0;
    let shown = false;

    const loop = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      r.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    const show = (on: boolean) => {
      shown = on;
      d.style.opacity = r.style.opacity = on ? '1' : '0';
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        rx = x;
        ry = y;
        show(true);
        html.classList.add('has-cursor');
      }
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      const hot = (e.target as Element | null)?.closest?.(INTERACTIVE);
      r.toggleAttribute('data-hover', Boolean(hot));
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const leave = () => show(false);
    const down = () => r.setAttribute('data-down', '');
    const up = () => r.removeAttribute('data-down');

    show(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
    };
  }, []);

  return (
    <>
      <div ref={ring} aria-hidden="true" className="cursor-ring opacity-0" />
      <div ref={dot} aria-hidden="true" className="cursor-dot opacity-0" />
    </>
  );
}
