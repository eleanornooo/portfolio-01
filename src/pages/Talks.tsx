import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { X } from 'lucide-react';
import { talks } from '../content/talks';
import type { TalkType } from '../content/types';
import { useLang } from '../i18n/useLang';
import { useNow } from '../hooks/useNow';
import { timing, yearOf } from '../lib/dates';
import { SELF } from '../lib/apa';
import { scrollToElement } from '../lib/smooth';
import { entryCities, entryTypes, talkCities, talkDate, talkEntries, type TalkEntry } from '../lib/talk-cities';
import Seo from '../components/Seo';
import FilterChips from '../components/FilterChips';
import { LinkRow } from '../components/Ext';
import { TimingTag } from '../components/Tags';
import TourPoster from '../components/talks/TourPoster';
import Ticket from '../components/talks/Ticket';
import { Place } from '../components/talks/Place';

const TYPES: TalkType[] = ['Keynote', 'Panel', 'Oral', 'Workshop', 'Chair'];
const ease = [0.2, 0.7, 0.2, 1] as const;
/** Keynotes and panels get a ticket; the rest are compact rows. */
const featured = (e: TalkEntry) => e.talks[0].type === 'Keynote' || e.talks[0].type === 'Panel';

/**
 * A compact row. One entry can hold the same talk given at several venues (each venue
 * listed with its date, event, place and links) or several roles at one event.
 */
function Row({ entry, now }: { entry: TalkEntry; now: number }) {
  const { t, lang } = useLang();
  const [main] = entry.talks;
  const others = main.authors?.filter((a) => a !== SELF) ?? [];
  const types = entryTypes(entry);

  return (
    <div className="grid gap-x-8 gap-y-1 py-5 md:grid-cols-[10rem_1fr_9rem]">
      <p className="num text-sm text-ink3">
        {entry.kind === 'venues'
          ? entry.talks.map((x) => (
              <span key={x.id} className="block">
                {talkDate(x, lang)}
              </span>
            ))
          : talkDate(main, lang)}
      </p>
      <div lang={main.lang}>
        <h3 className="font-serif text-[1.1875rem] font-normal leading-snug">{main.title ?? main.event}</h3>

        {entry.kind === 'venues' ? (
          <>
            <p className="eyebrow mt-2 text-[0.625rem] text-accent" lang={lang}>
              {t.talks.venues(entry.talks.length)}
            </p>
            <ol className="mt-2 space-y-3 border-l border-ink/15 pl-4">
              {entry.talks.map((x) => (
                <li key={x.id} lang={x.lang}>
                  <p className="text-[0.9375rem] text-ink2">
                    <span className="num text-ink3" lang={lang}>
                      {talkDate(x, lang)} ·{' '}
                    </span>
                    {x.event}
                  </p>
                  <Place talk={x} className="mt-0.5" />
                  {x.links && <LinkRow links={x.links} className="mt-1" />}
                </li>
              ))}
            </ol>
          </>
        ) : (
          <>
            {main.title && <p className="mt-1 text-[0.9375rem] text-ink2">{main.event}</p>}
            {entry.kind === 'roles' && (
              <p className="mt-1 text-sm text-ink2" lang={lang}>
                {entry.talks.map((x) => t.talks.roles[x.type]).join(' · ')}
                {entry.talks
                  .slice(1)
                  .filter((x) => x.title)
                  .map((x) => (
                    <span key={x.id} className="text-ink3" lang={x.lang}>
                      {' '}
                      — {x.title}
                    </span>
                  ))}
              </p>
            )}
            <Place talk={main} className="mt-1" />
          </>
        )}

        {others.length > 0 && (
          <p className="mt-1 text-sm text-ink3" lang={lang}>
            {t.talks.withAuthors} {others.join('; ')}
          </p>
        )}
        {main.note && <p className="mt-1 text-sm text-ink2">{main.note}</p>}
        {entry.kind !== 'venues' && <LinkRow links={entry.talks.flatMap((x) => x.links ?? [])} className="mt-2" />}
      </div>
      <p className="flex flex-wrap items-start gap-2 md:justify-end" lang={lang}>
        <TimingTag timing={timing(main.date, main.endDate, now)} />
        {types.map((ty) => (
          <span key={ty} className="tag text-ink3">
            {t.talks.types[ty]}
          </span>
        ))}
      </p>
    </div>
  );
}

export function Component() {
  const { t } = useLang();
  const now = useNow();
  const [type, setType] = useState<TalkType | 'all'>('all');
  const [city, setCity] = useState<string | null>(null);
  const listRef = useRef<HTMLElement>(null);
  const cities = useMemo(() => talkCities(), []);
  const entries = useMemo(() => talkEntries(), []);
  const cityName = (id: string) => cities.find((x) => x.id === id)?.name ?? t.talks.online;

  const counts = useMemo(() => {
    const c: Partial<Record<TalkType, number>> = {};
    for (const e of entries) for (const ty of entryTypes(e)) c[ty] = (c[ty] ?? 0) + 1;
    return c;
  }, [entries]);
  const years = talks.map((x) => yearOf(x.date));
  const span = `${Math.min(...years)} → ${Math.max(...years)}`;

  // The type filter and the city filter work together.
  const list = useMemo(
    () => entries.filter((e) => (type === 'all' || entryTypes(e).includes(type)) && (city === null || entryCities(e).has(city))),
    [entries, type, city],
  );
  const tickets = list.filter(featured);
  const rows = list.filter((e) => !featured(e));

  /** A city on the poster filters the list below (again: clears it) and scrolls there. */
  const chooseCity = (id: string) => {
    setCity((c) => (c === id ? null : id));
    if (listRef.current) scrollToElement(listRef.current);
  };

  const motionList = (items: TalkEntry[], render: (x: TalkEntry) => JSX.Element, className: string) => (
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
            <div className="max-w-[26rem]">
              <p className="text-ink2">{t.talks.intro}</p>
              <p className="mt-2 text-sm text-ink3">{t.talks.cityHint}</p>
            </div>
          </header>
          <h2 className="sr-only">{t.talks.cities}</h2>
          <TourPoster cities={cities} selected={city} onSelect={chooseCity} />
        </div>
      </section>

      {/* ------------------------------------------------- tickets and rows */}
      <section ref={listRef} aria-label={t.talks.title} className="tone-light blend-t pb-28 pt-16">
        <div className="page">
          <div className="sticky-bar flex flex-wrap items-center gap-3">
            <FilterChips
              id="talk-type"
              label={t.talks.filter}
              value={type}
              onChange={setType}
              options={[
                { value: 'all', label: t.common.all, count: entries.length },
                ...TYPES.filter((ty) => counts[ty]).map((ty) => ({ value: ty, label: t.talks.types[ty], count: counts[ty] })),
              ]}
            />
            {city && (
              <button
                type="button"
                onClick={() => setCity(null)}
                aria-label={t.talks.clearCity(cityName(city))}
                className="kin-fade glass inline-flex items-center gap-2 rounded-full py-2.5 pl-4 pr-3 text-sm"
              >
                <span className="text-ink3">{t.talks.showing}</span>
                <span className="font-semibold">{cityName(city)}</span>
                <X size={15} aria-hidden="true" className="text-amber" />
              </button>
            )}
          </div>
          <p className="sr-only" role="status" aria-live="polite">
            {t.common.showing(list.length, entries.length)}
          </p>

          <MotionConfig reducedMotion="user">
            {tickets.length > 0 && (
              <div className="mt-14">
                <h2 className="eyebrow mb-6 font-sans">{t.talks.featured}</h2>
                {motionList(tickets, (x) => <Ticket talk={x.talks[0]} now={now} />, 'grid gap-5 lg:grid-cols-2')}
              </div>
            )}
            {rows.length > 0 && (
              <div className="mt-16">
                <h2 className="eyebrow mb-2 font-sans">{t.talks.others}</h2>
                {motionList(rows, (x) => <Row entry={x} now={now} />, 'divide-y divide-ink/10 border-y border-ink/10')}
              </div>
            )}
          </MotionConfig>
        </div>
      </section>
    </>
  );
}
