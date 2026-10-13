import { useId, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import type { NewsItem } from '../content/types';
import { useLang } from '../i18n/useLang';
import { formatDate, timing } from '../lib/dates';
import { photoSrc, photoSrcSet, photos, type Photo } from '../lib/photos';
import { ArrowUpRight, ChevronDown } from 'lucide-react';

/** Bento layout: which highlights get a bigger tile, and which carry a photo or a giant mark. */
const FEATURES: Record<string, { span: string; photo?: Photo; big?: boolean; mark?: [string, string] }> = {
  'unu-macau': {
    span: 'sm:col-span-2 lg:row-span-2',
    big: true,
    mark: ['MACAU', '2026'],
  },
  'qs-judge': { span: 'sm:col-span-2', photo: photos.scienceWeekPanelC },
  phd: { span: 'sm:col-span-2' },
};

/** The six strongest highlights, shown first; the others open with "See all highlights". */
const TOP = new Set(['unu-macau', 'innovenssup', 'assistant-professor', 'phd', 'qs-judge', 'qq-article']);

/**
 * The year's highlights as a bento grid: one large feature tile (a glow and a giant
 * display mark), a few wide tiles (one with a photo) and small ones. Dark cards with a glow that follows the cursor; "Upcoming" glows.
 */
export default function Highlights({ items, now }: { items: NewsItem[]; now: number }) {
  const { t, pick, lang } = useLang();
  const listId = useId();
  const [all, setAll] = useState(false);
  const top = items.filter((n) => TOP.has(n.id));
  const rest = items.filter((n) => !TOP.has(n.id));
  const shown = all ? [...top, ...rest] : top;

  return (
    <MotionConfig reducedMotion="user">
      <ol
        id={listId}
        data-reveal="stagger"
        className="grid grid-flow-row-dense auto-rows-[minmax(12.5rem,auto)] grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4"
      >
        <AnimatePresence initial={false}>
          {shown.map((n, i) => {
            const f = FEATURES[n.id];
            const when = timing(n.date, n.endDate, now);
            const title = pick(n.title);
            return (
              <motion.li
                key={n.id}
                initial={{ opacity: 0, y: 28, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: 12,
                  scale: 0.98,
                  transition: { duration: 0.25 },
                }}
                transition={{
                  duration: 0.55,
                  ease: [0.2, 0.7, 0.2, 1],
                  delay: TOP.has(n.id) ? 0 : (i - top.length) * 0.06,
                }}
                className={`card-dark spot group flex min-h-[12.5rem] flex-col hover:-translate-y-1 ${f?.span ?? ''} ${
                  f?.big ? 'min-h-[26rem]' : ''
                }`}
              >
                {f?.photo && (
                  <>
                    <img
                      src={photoSrc(f.photo)}
                      srcSet={photoSrcSet(f.photo)}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      width={f.photo.w}
                      height={f.photo.h}
                      alt={pick(f.photo.alt)}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover object-[50%_80%] opacity-70 grayscale transition-[transform,filter] duration-[1.4s] ease-out group-hover:scale-[1.05] group-hover:grayscale-0"
                    />
                    {/* Warm duotone: the grey photo is tinted by an amber glow, then fades into the card. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-[radial-gradient(80%_70%_at_70%_20%,rgb(226_87_43/0.35),transparent_70%)] mix-blend-color"
                    />
                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-paper via-paper/80 to-paper/25" />
                  </>
                )}
                {f?.mark && (
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="glow-field opacity-90" />
                    <p className="display absolute inset-x-5 top-14 text-[clamp(4.25rem,2rem+6.5vw,8.75rem)] leading-[0.84] tracking-[-0.05em] md:inset-x-6">
                      <span className="block text-ink/90">{f.mark[0]}</span>
                      <span className="text-glow block">{f.mark[1]}</span>
                    </p>
                  </div>
                )}
                <div className="relative z-10 flex flex-1 flex-col p-5 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="eyebrow">{n.kind}</span>
                    {when !== 'past' && (
                      <span className="badge-glow rounded-full bg-amber px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#160b05]">
                        {when === 'upcoming' ? t.common.upcoming : t.common.ongoing}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto pt-8">
                    <p className="num text-sm text-ink3">{formatDate(n.date, lang, n.endDate)}</p>
                    <h3
                      className={`mt-2 font-serif font-normal leading-[1.12] tracking-[-0.015em] ${
                        f?.big ? 'text-[1.75rem] md:text-[2.375rem]' : f ? 'text-[1.5rem]' : 'text-[1.1875rem]'
                      }`}
                    >
                      {n.url ? (
                        // The whole tile is the link (stretched); the arrow shows it.
                        <a
                          href={n.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-amber"
                        >
                          {title}
                          <ArrowUpRight
                            size="0.8em"
                            aria-hidden="true"
                            className="ml-1 inline-block align-[-0.05em] text-amber transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                          <span className="sr-only"> {t.common.opensNewTab}</span>
                        </a>
                      ) : (
                        title
                      )}
                    </h3>
                    {n.detail && (
                      <p className={`mt-2 text-ink2 ${f?.big ? 'max-w-[44ch] text-base' : 'text-sm'}`}>{pick(n.detail)}</p>
                    )}
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
      {rest.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            className="btn-ghost"
            aria-expanded={all}
            aria-controls={listId}
            onClick={() => setAll((v) => !v)}
          >
            {all ? t.home.fewerHighlights : t.home.allHighlights(items.length)}
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={`transition-transform duration-300 ${all ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      )}
    </MotionConfig>
  );
}
