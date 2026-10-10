import { useId, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { profile } from '../content/profile';
import { publications } from '../content/publications';
import type { Publication, PublicationType } from '../content/types';
import { useLang } from '../i18n/useLang';
import { monthYear } from '../lib/dates';
import Seo from '../components/Seo';
import { PageHeader } from '../components/Section';
import PubEntry from '../components/PubEntry';
import { Ext } from '../components/Ext';
import Reveal from '../components/Reveal';

const TYPES: PublicationType[] = ['article', 'chapter', 'proceedings', 'report', 'thesis'];
const yearKey = (p: Publication) => (p.year === 'in press' ? 'in press' : String(p.year));
const yearSort = (k: string) => (k === 'in press' ? 9999 : Number(k));

/** Lower-case, accent-insensitive text for searching. */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export function Component() {
  const { t, lang } = useLang();
  const [type, setType] = useState<PublicationType | 'all'>('all');
  const [year, setYear] = useState('all');
  const [query, setQuery] = useState('');
  const searchId = useId();
  const yearId = useId();

  const years = useMemo(
    () => [...new Set(publications.map(yearKey))].sort((a, b) => yearSort(b) - yearSort(a)),
    [],
  );
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of publications) c[p.type] = (c[p.type] ?? 0) + 1;
    return c;
  }, []);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return publications.filter((p) => {
      if (type !== 'all' && p.type !== type) return false;
      if (year !== 'all' && yearKey(p) !== year) return false;
      if (!q) return true;
      const hay = fold([p.title, p.authors.join(' '), p.journal, p.container, p.publisher, p.doi].join(' '));
      return q.split(/\s+/).every((w) => hay.includes(w));
    });
  }, [type, year, query]);

  const groups = useMemo(() => {
    const m = new Map<string, Publication[]>();
    for (const p of filtered) m.set(yearKey(p), [...(m.get(yearKey(p)) ?? []), p]);
    return [...m.entries()].sort((a, b) => yearSort(b[0]) - yearSort(a[0]));
  }, [filtered]);

  const metrics = [
    { v: profile.metrics.hIndex, l: 'h-index' },
    { v: profile.metrics.i10Index, l: t.publications.i10 },
    { v: profile.metrics.citations, l: t.home.citations },
  ];
  const filtersOn = type !== 'all' || year !== 'all' || query !== '';

  return (
    <>
      <Seo title={t.publications.metaTitle} description={t.publications.metaDescription} path="/publications" />
      <PageHeader title={t.publications.title} intro={t.publications.intro}>
        <div className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-4 border-t border-rule pt-5">
          <h2 className="sr-only">{t.publications.metrics}</h2>
          <dl className="flex gap-x-10">
            {metrics.map((m) => (
              <div key={m.l} className="flex flex-col-reverse">
                <dt className="text-sm text-ink2">{m.l}</dt>
                <dd className="num font-serif text-[2.5rem] font-light leading-none">{m.v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-ink3">
            <Ext href={profile.links.scholar} className="link-quiet">
              {profile.metrics.source}
            </Ext>
            , {monthYear(profile.metrics.asOf, lang)}
          </p>
        </div>
      </PageHeader>

      {/* ------------------------------------------------------------ filters */}
      <div className="page">
        <div className="grid-12 border-y border-rule py-5">
          <div className="col-span-4 md:col-span-9 md:col-start-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div role="group" aria-label={t.publications.filterType} className="flex flex-wrap gap-2">
                <button type="button" className="chip" aria-pressed={type === 'all'} onClick={() => setType('all')}>
                  {t.publications.types.all}
                  <span className="num ml-1.5">{publications.length}</span>
                </button>
                {TYPES.filter((ty) => counts[ty]).map((ty) => (
                  <button key={ty} type="button" className="chip" aria-pressed={type === ty} onClick={() => setType(ty)}>
                    {t.publications.types[ty]}
                    <span className="num ml-1.5">{counts[ty]}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <div className="relative flex-1 lg:w-64 lg:flex-none">
                  <label htmlFor={searchId} className="sr-only">
                    {t.common.search}
                  </label>
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink3"
                    aria-hidden="true"
                  />
                  <input
                    id={searchId}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.publications.searchPlaceholder}
                    className="field py-2 pl-9 text-sm"
                  />
                </div>
                <label htmlFor={yearId} className="sr-only">
                  {t.publications.year}
                </label>
                <select
                  id={yearId}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="field w-auto py-2 text-sm"
                >
                  <option value="all">{t.publications.allYears}</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y === 'in press' ? t.publications.inPress : y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="mt-4 text-sm text-ink3" role="status" aria-live="polite">
              {t.common.showing(filtered.length, publications.length)}
              {filtersOn && (
                <>
                  {' · '}
                  <button
                    type="button"
                    className="link-quiet"
                    onClick={() => {
                      setType('all');
                      setYear('all');
                      setQuery('');
                    }}
                  >
                    {t.common.clearFilters}
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------- bibliography */}
      <div className="page pb-24 pt-4">
        {groups.length === 0 && (
          <div className="grid-12 py-16">
            <p className="col-span-4 text-ink2 md:col-span-9 md:col-start-4">{t.common.noResults}</p>
          </div>
        )}
        {groups.map(([y, items]) => (
          <Reveal as="section" key={y} className="grid-12 border-b border-rule py-10" aria-labelledby={`y-${y}`}>
            <h2
              id={`y-${y}`}
              className="num col-span-4 mb-6 font-serif text-h2 font-light text-ink3 md:col-span-3 md:mb-0"
            >
              <span className="md:sticky md:top-24">{y === 'in press' ? t.publications.inPress : y}</span>
            </h2>
            <ol className="col-span-4 space-y-8 md:col-span-9">
              {items.map((p) => (
                <li key={p.id}>
                  <PubEntry pub={p} />
                </li>
              ))}
            </ol>
          </Reveal>
        ))}
      </div>
    </>
  );
}
