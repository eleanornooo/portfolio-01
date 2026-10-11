import { useEffect, useRef } from 'react';
import { hasFinePointer, prefersReducedMotion } from '../lib/motion';

const INTERACTIVE = 'a, button, [role="button"], label, summary, [data-cursor]';

/**
 * Custom cursor (desktop with a fine pointer only, never with reduced motion): a dot that
 * tracks the pointer exactly and a ring that follows with a little lag. Both use
 * `mix-blend-mode: difference`, so they read on dark and light sections alike. The ring
 * grows over links and buttons. Text fields keep the native cursor.
 * Both stay `hidden` (display: none) until the first mouse move, and again whenever the
 * mouse leaves the window, so they never sit at the top-left corner.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = dot.current;
    const r = ring.current;
    if (!d || !r || !hasFinePointer() || prefersReducedMotion()) return;
    const html = document.documentElement;
    let x = 0;
    let y = 0;
    let rx = 0;
    let ry = 0;
    let raf = 0;
    let shown = false;

    const place = (el: HTMLElement, px: number, py: number) =>
      (el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`);
    const loop = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      place(r, rx, ry);
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(loop) : 0;
    };
    const show = (on: boolean) => {
      if (on === shown) return;
      shown = on;
      d.hidden = r.hidden = !on;
      html.classList.toggle('has-cursor', on);
      if (!on) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        // Appear where the mouse is: no glide in from the corner.
        rx = x;
        ry = y;
        place(r, rx, ry);
        show(true);
      }
      place(d, x, y);
      const hot = (e.target as Element | null)?.closest?.(INTERACTIVE);
      r.toggleAttribute('data-hover', Boolean(hot));
      if (!raf) raf = requestAnimationFrame(loop);
    };
    // The mouse left the window (relatedTarget is null when it leaves the document).
    const out = (e: MouseEvent) => {
      if (!e.relatedTarget) show(false);
    };
    const hide = () => show(false);
    const down = () => r.setAttribute('data-down', '');
    const up = () => r.removeAttribute('data-down');

    window.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseout', out);
    window.addEventListener('blur', hide);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    return () => {
      show(false);
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseout', out);
      window.removeEventListener('blur', hide);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  return (
    <>
      <div ref={ring} aria-hidden="true" hidden className="cursor-ring" />
      <div ref={dot} aria-hidden="true" hidden className="cursor-dot" />
    </>
  );
}
