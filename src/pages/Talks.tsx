import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { talks } from '../content/talks';
import type { Talk, TalkType } from '../content/types';
import { useLang } from '../i18n/useLang';
import { useNow } from '../hooks/useNow';
import { byDateDesc, formatDate, timing, yearOf } from '../lib/dates';
import { SELF } from '../lib/apa';
import { useGsap } from '../lib/gsap';
import { useSpotlight } from '../lib/spotlight';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import FilterChips from '../components/FilterChips';
import { LinkRow } from '../components/Ext';
import { TimingTag } from '../components/Tags';

const TYPES: TalkType[] = ['Keynote', 'Panel', 'Oral', 'Workshop', 'Chair'];
const ease = [0.2, 0.7, 0.2, 1] as const;
/** Keynotes and panels get a larger card. */
const featured = (x: Talk) => x.type === 'Keynote' || x.type === 'Panel';

function TalkItem({ talk, now }: { talk: Talk; now: number }) {
  const { t, lang } = useLang();
  const when = timing(talk.date, talk.endDate, now);
  const others = talk.authors?.filter((a) => a !== SELF) ?? [];
  const big = featured(talk);

  return (
    <div className="relative grid grid-cols-1 gap-x-8 gap-y-2 pl-8 sm:grid-cols-[9rem_1fr] sm:pl-0">
      {/* timeline dot */}
      <span
        aria-hidden="true"
        className={`absolute left-[3px] top-[1.65rem] h-[11px] w-[11px] rotate-45 rounded-[2px] sm:left-[calc(9rem+1.5rem)] sm:-translate-x-1/2 ${
          when === 'past' ? 'border border-amber/60 bg-paper' : 'bg-amber shadow-[0_0_14px_3px_rgb(245_158_59/0.7)]'
        }`}
      />
      <p className="num pt-5 text-sm text-ink3 sm:text-right">{talk.dateLabel ?? formatDate(talk.date, lang, talk.endDate)}</p>
      <div
        lang={talk.lang}
        className={`sm:ml-12 ${big ? 'card-dark spot group p-6 md:p-7' : 'rounded-3xl border border-transparent px-0 py-4 transition-colors duration-500 hover:border-ink/10 hover:bg-ink/[0.03] sm:px-6'}`}
      >
        <div className="relative z-10">
          <div className="mb-3 flex flex-wrap items-center gap-2" lang={lang}>
            <TimingTag timing={when} />
            <span className={`tag ${big ? 'border-amber/60 text-amber' : 'text-ink3'}`}>{t.talks.types[talk.type]}</span>
          </div>
          <h3 className={`font-serif font-normal leading-snug ${big ? 'text-[1.5rem] md:text-[1.875rem]' : 'text-[1.1875rem]'}`}>
            {talk.title ?? talk.event}
          </h3>
          {talk.title && <p className="prose-measure mt-2 text-ink2">{talk.event}</p>}
          <p className="mt-1 text-sm text-ink3">
            {[talk.location, talk.virtual ? t.talks.virtual : null].filter(Boolean).join(' · ')}
          </p>
          {others.length > 0 && (
            <p className="mt-1 text-sm text-ink3" lang={lang}>
              {t.talks.withAuthors} {others.join('; ')}
            </p>
          )}
          {talk.note && <p className="mt-2 text-sm text-ink2">{talk.note}</p>}
          {talk.links && <LinkRow links={talk.links} className="mt-3" />}
        </div>
      </div>
    </div>
  );
}

export function Component() {
  const { t } = useLang();
  const now = useNow();
  const [type, setType] = useState<TalkType | 'all'>('all');
  const root = useRef<HTMLDivElement>(null);
  useSpotlight(root);

  const counts = useMemo(() => {
    const c: Partial<Record<TalkType, number>> = {};
    for (const x of talks) c[x.type] = (c[x.type] ?? 0) + 1;
    return c;
  }, []);

  const years = talks.map((x) => yearOf(x.date));
  const span = `${Math.min(...years)} → ${Math.max(...years)}`;

  const groups = useMemo(() => {
    const list = talks.filter((x) => type === 'all' || x.type === type).sort(byDateDesc);
    const m = new Map<number, Talk[]>();
    for (const x of list) m.set(yearOf(x.date), [...(m.get(yearOf(x.date)) ?? []), x]);
    return [...m.entries()];
  }, [type]);

  // The rail draws itself down the page as you scroll (re-measured when the filter changes).
  useGsap(
    ({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.talks-progress',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: '.talks-list', start: 'top 70%', end: 'bottom 70%', scrub: true, invalidateOnRefresh: true },
          },
        );
      });
    },
    root,
    [type],
  );

  return (
    <div ref={root}>
      <Seo title={t.talks.metaTitle} description={t.talks.metaDescription} path="/talks" />
      <PageHero eyebrow={`${talks.length} · ${span}`} title={t.talks.title} intro={t.talks.intro}>
        <FilterChips
          id="talk-type"
          label={t.talks.filter}
          value={type}
          onChange={setType}
          options={[
            { value: 'all', label: t.common.all, count: talks.length },
            ...TYPES.filter((ty) => counts[ty]).map((ty) => ({ value: ty, label: t.talks.types[ty], count: counts[ty] })),
          ]}
        />
      </PageHero>

      <div className="page relative pb-28 pt-8">
        <div className="talks-list relative">
          {/* rail + scroll progress */}
          <span aria-hidden="true" className="absolute bottom-0 left-[8px] top-0 w-px bg-ink/10 sm:left-[calc(9rem+1.5rem)]">
            <span className="talks-progress absolute inset-0 origin-top bg-gradient-to-b from-vivid to-amber shadow-[0_0_14px_rgb(245_158_59/0.7)]" />
          </span>

          <MotionConfig reducedMotion="user">
            <AnimatePresence initial={false} mode="popLayout">
              {groups.map(([year, items]) => (
                <motion.section
                  key={year}
                  layout="position"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease }}
                  aria-labelledby={`talks-${year}`}
                  className="relative pb-10"
                >
                  <h2 id={`talks-${year}`} className="relative pl-8 pt-6 sm:pl-[calc(9rem+3rem)]">
                    <span className="num display block text-[4rem] leading-none tracking-[-0.05em] md:text-[6rem]">
                      <span className="year-outline">{year}</span>
                    </span>
                  </h2>
                  <ol className="mt-2 space-y-3">
                    <AnimatePresence initial={false} mode="popLayout">
                      {items.map((x) => (
                        <motion.li
                          key={x.id}
                          layout="position"
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.4, ease }}
                        >
                          <TalkItem talk={x} now={now} />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ol>
                </motion.section>
              ))}
            </AnimatePresence>
          </MotionConfig>
        </div>
      </div>
    </div>
  );
}
