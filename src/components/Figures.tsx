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
 * server and is what screen readers get; only the visible digits animate.
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
    <>
      <span ref={ref} aria-hidden="true">
        {shown}
        {suffix}
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </>
  );
}

/** The key-figures band: big tabular numerals with a hairline that draws as they count. */
export default function Figures({ figures, note }: { figures: Figure[]; note?: string }) {
  return (
    <>
      <dl className="grid grid-cols-2 gap-px border-y border-rule bg-rule md:grid-cols-3 xl:grid-cols-6">
        {figures.map((f, i) => (
          <div
            key={f.label}
            data-count
            className="relative flex flex-col-reverse justify-end gap-2 overflow-hidden bg-paper px-4 py-7 md:px-6 md:py-10"
          >
            <dt className="max-w-[16ch] text-sm leading-snug text-ink2">{f.label}</dt>
            <dd className="num font-serif text-[3rem] font-light leading-none tracking-[-0.02em] md:text-[4rem]">
              <CountUp value={f.value} suffix={f.suffix} delay={i * 90} />
            </dd>
            <span aria-hidden="true" className="figure-line absolute bottom-0 left-0 h-[2px] w-full bg-vivid" />
          </div>
        ))}
      </dl>
      {note && <p className="mt-3 text-sm text-ink3">{note}</p>}
    </>
  );
}
