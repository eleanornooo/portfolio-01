import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { Publication } from '../../content/types';
import { useLang } from '../../i18n/useLang';
import { SELF } from '../../lib/apa';
import { hasFinePointer, prefersReducedMotion } from '../../lib/motion';
import PubEntry from '../PubEntry';

const ease = [0.2, 0.7, 0.2, 1] as const;
const venueOf = (p: Publication) => p.journal ?? p.container ?? p.publisher ?? p.description ?? '';

/**
 * Publications as a large typographic index: one row per work (number · year · title ·
 * venue). Desktop: a preview card follows the cursor over the rows (type, venue,
 * co-authors, DOI). Every row is also a disclosure button that expands in place to the full
 * APA reference with its DOI, links and "copy citation" — the only way on touch screens,
 * and the keyboard / screen-reader path everywhere.
 */
export default function PubIndex({ items }: { items: Publication[] }) {
  const { t, lang } = useLang();
  const uid = useId();
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<Publication | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const [fine, setFine] = useState(false);

  useEffect(() => setFine(hasFinePointer()), []);

  // The preview follows the cursor with a little lag (position only; no re-render).
  useEffect(() => {
    const el = card.current;
    if (!el || !fine) return;
    const reduced = prefersReducedMotion();
    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    let first = true;
    const loop = () => {
      cx += (x - cx) * (reduced ? 1 : 0.18);
      cy += (y - cy) * (reduced ? 1 : 0.18);
      // Keep the card inside the viewport.
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const px = cx + 28 + w > window.innerWidth - 12 ? cx - w - 28 : cx + 28;
      const py = Math.min(window.innerHeight - h - 12, Math.max(12, cy - h / 2));
      el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (first) {
        cx = x;
        cy = y;
        first = false;
      }
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
    };
  }, [fine]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const others = hover ? hover.authors.filter((a) => a !== SELF) : [];

  return (
    <>
      <MotionConfig reducedMotion="user">
        <ol className="pub-index border-t border-ink/15" onPointerLeave={() => setHover(null)}>
          <AnimatePresence initial={false} mode="popLayout">
            {items.map((p, i) => {
              const on = open.has(p.id);
              const panel = `${uid}-${p.id}`;
              return (
                <motion.li
                  key={p.id}
                  layout="position"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease }}
                  className="pub-row border-b border-ink/15"
                  onPointerEnter={() => fine && setHover(p)}
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={on}
                      aria-controls={panel}
                      onClick={() => toggle(p.id)}
                      className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-4 py-5 text-left md:grid-cols-[3rem_5.5rem_1fr_minmax(0,16rem)_2rem] md:gap-x-6 md:py-6"
                    >
                      <span className="num text-xs text-ink3">{String(i + 1).padStart(2, '0')}</span>
                      <span className="num display hidden text-[1.5rem] leading-none tracking-[-0.03em] text-ink/40 transition-colors duration-300 group-hover:text-accent md:block">
                        {p.year === 'in press' ? t.publications.inPress : p.year}
                      </span>
                      <span lang={p.lang} className="pub-title font-serif text-[1.1875rem] leading-snug transition-transform duration-500 ease-out md:text-[1.625rem] md:leading-[1.2]">
                        {p.title}
                        <span className="num mt-1 block font-sans text-sm text-ink3 md:hidden">
                          {p.year === 'in press' ? t.publications.inPress : p.year} · {venueOf(p)}
                        </span>
                      </span>
                      <span className="hidden truncate text-sm italic text-ink2 md:block">{venueOf(p)}</span>
                      <Plus
                        size={18}
                        aria-hidden="true"
                        className={`self-center justify-self-end text-ink3 transition-transform duration-500 group-hover:text-accent ${on ? 'rotate-45 text-accent' : ''}`}
                      />
                    </button>
                  </h3>
                  <div
                    id={panel}
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                    {...(on ? {} : ({ inert: '' } as Record<string, string>))}
                  >
                    <div className="overflow-hidden">
                      <div className="pb-7 pl-[3.25rem] md:pl-[calc(3rem+5.5rem+3rem)] md:pr-16">
                        <PubEntry pub={p} />
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </MotionConfig>

      {/* Cursor-following preview (desktop, visual only: the row's details carry the same). */}
      {fine && (
        <div
          ref={card}
          aria-hidden="true"
          className={`tone-dark glass pointer-events-none fixed left-0 top-0 z-50 w-[22rem] rounded-[1.5rem] p-5 transition-opacity duration-300 ${
            hover && !open.has(hover.id) ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {hover && (
            <div lang={lang}>
              <div className="flex items-center justify-between gap-3">
                <span className="tag border-amber/60 text-amber">
                  {hover.year === 'in press' ? t.publications.inPress : t.publications.typeSingular[hover.type]}
                </span>
                <span className="num display text-[1.75rem] leading-none tracking-[-0.03em] text-glow">
                  {hover.year === 'in press' ? '—' : hover.year}
                </span>
              </div>
              <p className="mt-4 font-serif text-[1.0625rem] italic leading-snug text-ink">{venueOf(hover)}</p>
              {hover.publisher && hover.publisher !== venueOf(hover) && <p className="text-sm text-ink3">{hover.publisher}</p>}
              <p className="mt-3 text-sm text-ink2">
                {others.length ? (
                  <>
                    <span className="text-ink3">{t.publications.coauthors} </span>
                    {others.join('; ')}
                  </>
                ) : (
                  t.publications.soleAuthor
                )}
              </p>
              {hover.doi && (
                <p className="num mt-3 truncate text-sm text-amber">
                  {t.publications.doi} {hover.doi}
                </p>
              )}
              <p className="mt-4 border-t border-ink/10 pt-3 text-xs text-ink3">{t.publications.previewHint}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
