import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

/** Words already lit when the page opens (so the first line never starts dark). */
const START = 0.22;

/**
 * The Teaching opening: the statement in large italic serif, revealed word by word as you
 * scroll. Each word goes from dim to bright; the progress is one CSS variable (--p) on the
 * stage, and each word's opacity is computed in CSS from its index (see .ws-word), so a
 * scroll only writes one style. On desktop the stage is taller than the screen and its
 * content sticks (CSS sticky), so the words light up while the page seems to stand still;
 * on phones the words light up as the text passes. Reduced motion: every word is bright.
 */
export default function StatementReveal({ text, lang, aside, header }: { text: string; lang: string; aside: ReactNode; header: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const words = text.split(' ');

  useEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    const quote = el.querySelector<HTMLElement>('.ws-quote')!;
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const box = el.getBoundingClientRect();
      let k: number;
      if (box.height > vh * 1.2) {
        // Sticky stage: progress through the extra height.
        k = -box.top / (box.height - vh);
      } else {
        const q = quote.getBoundingClientRect();
        k = (vh * 0.85 - q.top) / (q.height + vh * 0.35);
      }
      k = Math.max(0, Math.min(1, k));
      el.style.setProperty('--p', (START + (1 - START) * k).toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <div ref={stage} className="ws-stage" style={{ '--n': words.length, '--p': START } as CSSProperties}>
      <div className="ws-sticky">
        <div className="page grid h-full items-center gap-y-12 pb-16 pt-28 md:grid-cols-12 md:gap-x-10 md:pb-10 md:pt-24">
          <div className="md:col-span-7">
            {header}
            <blockquote className="ws-quote mt-6" lang={lang}>
              <p className="font-serif text-[clamp(1.5rem,0.75rem+1.55vw,2.375rem)] font-light italic leading-[1.24] tracking-[-0.012em]">
                {words.map((w, i) => (
                  <span key={i} className="ws-word" style={{ '--i': i } as CSSProperties}>
                    {w}{' '}
                  </span>
                ))}
              </p>
            </blockquote>
          </div>
          <div className="md:col-span-5">{aside}</div>
        </div>
      </div>
    </div>
  );
}
