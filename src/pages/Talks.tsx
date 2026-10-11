import { useMemo, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { talks } from '../content/talks';
import type { Talk, TalkType } from '../content/types';
import { useLang } from '../i18n/useLang';
import { useNow } from '../hooks/useNow';
import { byDateDesc, formatDate, timing, yearOf } from '../lib/dates';
import { SELF } from '../lib/apa';
import { talkCities } from '../lib/talk-cities';
import Seo from '../components/Seo';
import FilterChips from '../components/FilterChips';
import { LinkRow } from '../components/Ext';
import { TimingTag } from '../components/Tags';
import TourPoster from '../components/talks/TourPoster';
import Ticket from '../components/talks/Ticket';

const TYPES: TalkType[] = ['Keynote', 'Panel', 'Oral', 'Workshop', 'Chair'];
const ease = [0.2, 0.7, 0.2, 1] as const;
/** Keynotes and panels get a ticket; the rest are compact rows. */
const featured = (x: Talk) => x.type === 'Keynote' || x.type === 'Panel';

function Row({ talk, now }: { talk: Talk; now: number }) {
  const { t, lang } = useLang();
  const others = talk.authors?.filter((a) => a !== SELF) ?? [];
  return (
    <div className="grid gap-x-8 gap-y-1 py-5 md:grid-cols-[9rem_1fr_8rem]">
      <p className="num text-sm text-ink3">{talk.dateLabel ?? formatDate(talk.date, lang, talk.endDate)}</p>
      <div lang={talk.lang}>
        <h3 className="font-serif text-[1.1875rem] font-normal leading-snug">{talk.title ?? talk.event}</h3>
        {talk.title && <p className="mt-1 text-[0.9375rem] text-ink2">{talk.event}</p>}
        <p className="mt-1 text-sm text-ink3" lang={lang}>
          {[talk.location, talk.virtual ? t.talks.virtual : null].filter(Boolean).join(' · ')}
          {others.length > 0 && ` · ${t.talks.withAuthors} ${others.join('; ')}`}
        </p>
        {talk.note && <p className="mt-1 text-sm text-ink2">{talk.note}</p>}
        {talk.links && <LinkRow links={talk.links} className="mt-2" />}
      </div>
      <p className="flex flex-wrap items-start gap-2 md:justify-end" lang={lang}>
        <TimingTag timing={timing(talk.date, talk.endDate, now)} />
        <span className="tag text-ink3">{t.talks.types[talk.type]}</span>
      </p>
    </div>
  );
}

export function Component() {
  const { t } = useLang();
  const now = useNow();
  const [type, setType] = useState<TalkType | 'all'>('all');
  const cities = useMemo(() => talkCities(), []);

  const counts = useMemo(() => {
    const c: Partial<Record<TalkType, number>> = {};
    for (const x of talks) c[x.type] = (c[x.type] ?? 0) + 1;
    return c;
  }, []);
  const years = talks.map((x) => yearOf(x.date));
  const span = `${Math.min(...years)} → ${Math.max(...years)}`;

  const list = useMemo(() => talks.filter((x) => type === 'all' || x.type === type).sort(byDateDesc), [type]);
  const tickets = list.filter(featured);
  const rows = list.filter((x) => !featured(x));

  const motionList = (items: Talk[], render: (x: Talk) => JSX.Element, className: string) => (
    <ol className={className}>
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
            {render(x)}
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>
  );

  return (
    <>
      <Seo title={t.talks.metaTitle} description={t.talks.metaDescription} path="/talks" />

      {/* ------------------------------------------------- opening: tour poster */}
      <section aria-labelledby="talks-title" className="tone-dark blend-b relative isolate overflow-hidden pb-24 pt-28 md:pt-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(35%_45%_at_80%_30%,rgb(226_87_43/0.18),transparent_70%)]"
        />
        <div className="page">
          <header className="kin-fade mb-10 flex flex-wrap items-end justify-between gap-x-10 gap-y-4 border-b border-ink/20 pb-6">
            <div>
              <p className="eyebrow num text-amber">
                {t.talks.onStage} · {span} · {t.talks.dates(talks.length)}
              </p>
              <h1 id="talks-title" className="display mt-3 text-[clamp(2.75rem,1.5rem+3.4vw,5rem)] leading-[0.9] tracking-[-0.045em]">
                {t.talks.title}
              </h1>
            </div>
            <p className="max-w-[26rem] text-ink2">{t.talks.intro}</p>
          </header>
          <h2 className="sr-only">{t.talks.cities}</h2>
          <TourPoster cities={cities} />
        </div>
      </section>

      {/* ------------------------------------------------- tickets and rows */}
      <section aria-label={t.talks.title} className="tone-light blend-t pb-28 pt-10">
        <div className="page">
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

          <MotionConfig reducedMotion="user">
            {tickets.length > 0 && (
              <div className="mt-14">
                <h2 className="eyebrow mb-6 font-sans">{t.talks.featured}</h2>
                {motionList(tickets, (x) => <Ticket talk={x} now={now} />, 'grid gap-5 lg:grid-cols-2')}
              </div>
            )}
            {rows.length > 0 && (
              <div className="mt-16">
                <h2 className="eyebrow mb-2 font-sans">{t.talks.others}</h2>
                {motionList(rows, (x) => <Row talk={x} now={now} />, 'divide-y divide-ink/10 border-y border-ink/10')}
              </div>
            )}
          </MotionConfig>
        </div>
      </section>
    </>
  );
}
