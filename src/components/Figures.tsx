import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../lib/motion';

export interface Figure {
  value: number;
  suffix?: string;
  label: string;
}

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * A number that counts up when it scrolls into view. The real value is rendered on the
 * server; screen readers get it from aria-label, and the animated digits are aria-hidden.
 */
export function CountUp({ value, suffix = '', delay = 0 }: { value: number; suffix?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    // Numbers already on screen at load keep their value (no flash back to 0).
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    setShown(0);
    let raf = 0;
    let timer = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        el.closest('[data-count]')?.setAttribute('data-counting', '');
        timer = window.setTimeout(() => {
          const t0 = performance.now();
          const dur = 1500 + Math.min(value, 100) * 6;
          const step = (now: number) => {
            const k = easeOutExpo((now - t0) / dur);
            setShown(Math.round(value * k));
            if (k < 1) raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        }, delay);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  return (
    // Assistive tech gets the final value only (aria-label); the animated digits are hidden.
    <span role="img" aria-label={`${value}${suffix}`}>
      <span ref={ref} aria-hidden="true">
        {shown}
        {suffix}
      </span>
    </span>
  );
}

/**
 * Key figures: a row of glass cards floating over a slowly drifting glow. Numbers count up
 * in the display face; hovering a card lifts it and its glow follows the cursor (.spot).
 */
export default function Figures({ figures, note }: { figures: Figure[]; note?: string }) {
  return (
    <div className="relative isolate">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="glow-field" />
      </div>
      <dl data-reveal="stagger" className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-6">
        {figures.map((f, i) => (
          <div
            key={f.label}
            data-count
            className="glass spot group relative flex flex-col-reverse justify-end gap-3 overflow-hidden rounded-3xl p-5 transition-transform duration-500 ease-out hover:-translate-y-2 md:p-6"
          >
            <dt className="relative z-10 max-w-[18ch] text-sm leading-snug text-ink2">{f.label}</dt>
            <dd className="num display relative z-10 text-[3.25rem] leading-[0.9] tracking-[-0.04em] md:text-[4.25rem]">
              <span className="text-glow">
                <CountUp value={f.value} suffix={f.suffix} delay={i * 90} />
              </span>
            </dd>
          </div>
        ))}
      </dl>
      {note && <p className="mt-4 text-sm text-ink3">{note}</p>}
    </div>
  );
}
