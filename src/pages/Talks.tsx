import { useMemo, useState } from 'react';
import { talks } from '../content/talks';
import type { Talk, TalkType } from '../content/types';
import { useLang } from '../i18n/useLang';
import { useNow } from '../hooks/useNow';
import { byDateDesc, formatDate, timing, yearOf } from '../lib/dates';
import { SELF } from '../lib/apa';
import Seo from '../components/Seo';
import { PageHeader } from '../components/Section';
import { LinkRow } from '../components/Ext';
import { TimingTag } from '../components/Tags';
import Reveal from '../components/Reveal';

const TYPES: TalkType[] = ['Keynote', 'Panel', 'Oral', 'Workshop', 'Chair'];

function TalkItem({ talk, now }: { talk: Talk; now: number }) {
  const { t, lang } = useLang();
  const when = timing(talk.date, talk.endDate, now);
  const others = talk.authors?.filter((a) => a !== SELF) ?? [];
  const typeTone = talk.type === 'Keynote' || talk.type === 'Panel' ? 'text-accent' : 'text-ink3';

  return (
    <li className="relative grid grid-cols-1 gap-x-8 gap-y-2 pb-10 pl-6 sm:grid-cols-[10rem_1fr] sm:pl-0">
      {/* timeline tick */}
      <span
        aria-hidden="true"
        className={`absolute left-0 top-[0.55rem] h-2 w-2 -translate-x-[3.5px] rotate-45 sm:left-[10rem] sm:translate-x-[1.25rem] ${
          when === 'past' ? 'bg-rule' : 'bg-vivid'
        }`}
      />
      <p className="num text-sm text-ink3 sm:pt-0.5">{talk.dateLabel ?? formatDate(talk.date, lang, talk.endDate)}</p>
      <div className="sm:border-l sm:border-rule sm:pl-10" lang={talk.lang}>
        <div className="mb-2 flex flex-wrap items-center gap-2" lang={lang}>
          <TimingTag timing={when} />
          <span className={`tag ${typeTone}`}>{t.talks.types[talk.type]}</span>
        </div>
        <h3 className="text-[1.25rem] font-normal leading-snug">{talk.title ?? talk.event}</h3>
        {talk.title && <p className="prose-measure mt-1.5 text-ink2">{talk.event}</p>}
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
    </li>
  );
}

export function Component() {
  const { t } = useLang();
  const now = useNow();
  const [type, setType] = useState<TalkType | 'all'>('all');

  const counts = useMemo(() => {
    const c: Partial<Record<TalkType, number>> = {};
    for (const x of talks) c[x.type] = (c[x.type] ?? 0) + 1;
    return c;
  }, []);

  const groups = useMemo(() => {
    const list = talks.filter((x) => type === 'all' || x.type === type).sort(byDateDesc);
    const m = new Map<number, Talk[]>();
    for (const x of list) m.set(yearOf(x.date), [...(m.get(yearOf(x.date)) ?? []), x]);
    return [...m.entries()];
  }, [type]);

  return (
    <>
      <Seo title={t.talks.metaTitle} description={t.talks.metaDescription} path="/talks" />
      <PageHeader title={t.talks.title} intro={t.talks.intro}>
        <div role="group" aria-label={t.talks.filter} className="mt-10 flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed={type === 'all'} onClick={() => setType('all')}>
            {t.common.all}
            <span className="num ml-1.5">{talks.length}</span>
          </button>
          {TYPES.filter((ty) => counts[ty]).map((ty) => (
            <button key={ty} type="button" className="chip" aria-pressed={type === ty} onClick={() => setType(ty)}>
              {t.talks.types[ty]}
              <span className="num ml-1.5">{counts[ty]}</span>
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="page pb-24">
        {groups.map(([year, items]) => (
          <Reveal as="section" key={year} className="grid-12 border-t border-rule pt-8" aria-labelledby={`talks-${year}`}>
            <h2
              id={`talks-${year}`}
              className="num col-span-4 mb-6 font-serif text-h2 font-light text-ink3 md:col-span-3 md:mb-0"
            >
              <span className="md:sticky md:top-24">{year}</span>
            </h2>
            <ol className="col-span-4 md:col-span-9">
              {items.map((x) => (
                <TalkItem key={x.id} talk={x} now={now} />
              ))}
            </ol>
          </Reveal>
        ))}
      </div>
    </>
  );
}
