import { useEffect, useId, useLayoutEffect, useMemo, useState, type CSSProperties } from 'react';
import { Search } from 'lucide-react';
import { profile } from '../content/profile';
import { publications } from '../content/publications';
import type { Publication, PublicationType } from '../content/types';
import { useLang } from '../i18n/useLang';
import { monthYear } from '../lib/dates';
import { prefersReducedMotion } from '../lib/motion';
import Seo from '../components/Seo';
import FilterChips from '../components/FilterChips';
import { Ext } from '../components/Ext';
import Marquee from '../components/publications/Marquee';
import PubIndex from '../components/publications/PubIndex';

const TYPES: PublicationType[] = ['article', 'chapter', 'proceedings', 'report', 'thesis'];
const yearKey = (p: Publication) => (p.year === 'in press' ? 'in press' : String(p.year));
const yearSort = (k: string) => (k === 'in press' ? 9999 : Number(k));

/** Lower-case, accent-insensitive text for searching. */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** The giant total: pre-rendered as the real number, counted up from zero on arrival. */
function GiantCount({ value }: { value: number }) {
  const [n, setN] = useState(value);
  useIsoLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    setN(0);
    let raf = 0;
    const t0 = performance.now() + 250;
    const step = (now: number) => {
      const k = Math.max(0, Math.min(1, (now - t0) / 1600));
      setN(Math.round(value * (1 - (1 - k) ** 4)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span role="img" aria-label={String(value)} className="num">
      <span aria-hidden="true">{n}</span>
    </span>
  );
}

export function Component() {
  const { t, lang } = useLang();
  const [type, setType] = useState<PublicationType | 'all'>('all');
  const [year, setYear] = useState('all');
  const [query, setQuery] = useState('');
  const searchId = useId();
  const yearId = useId();

  const years = useMemo(() => [...new Set(publications.map(yearKey))].sort((a, b) => yearSort(b) - yearSort(a)), []);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of publications) c[p.type] = (c[p.type] ?? 0) + 1;
    return c;
  }, []);
  // Marquee names come from the data: journals on one row, publishers on the other.
  const journals = useMemo(() => [...new Set(publications.map((p) => p.journal).filter(Boolean) as string[])], []);
  const publishers = useMemo(() => [...new Set(publications.map((p) => p.publisher).filter(Boolean) as string[])], []);

  const filtered = useMemo(() => {
    const q = fold(query.trim());
    return publications
      .filter((p) => {
        if (type !== 'all' && p.type !== type) return false;
        if (year !== 'all' && yearKey(p) !== year) return false;
        if (!q) return true;
        const hay = fold([p.title, p.authors.join(' '), p.journal, p.container, p.publisher, p.doi].join(' '));
        return q.split(/\s+/).every((w) => hay.includes(w));
      })
      .sort((a, b) => yearSort(yearKey(b)) - yearSort(yearKey(a)));
  }, [type, year, query]);

  const filtersOn = type !== 'all' || year !== 'all' || query !== '';
  const clear = () => {
    setType('all');
    setYear('all');
    setQuery('');
  };

  return (
    <>
      <Seo title={t.publications.metaTitle} description={t.publications.metaDescription} path="/publications" />

      {/* -------------------------------------------- opening: the number + venues */}
      <section aria-labelledby="pub-title" className="tone-dark blend-b relative isolate overflow-hidden pb-20 pt-28 md:pb-24 md:pt-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_50%_at_22%_40%,rgb(226_87_43/0.22),transparent_70%)]"
        />
        <div className="page flex flex-col gap-6 md:flex-row md:items-end md:gap-12">
          <p aria-hidden="true" className="kin-fade display text-glow text-[clamp(9rem,4rem+26vw,26rem)] leading-[0.78] tracking-[-0.07em]">
            <GiantCount value={publications.length} />
          </p>
          <div className="kin-fade max-w-[26rem] pb-4 md:pb-10" style={{ '--d': '200ms' } as CSSProperties}>
            <h1 id="pub-title" className="display text-[clamp(2.5rem,1.5rem+3vw,4.5rem)] leading-[0.9] tracking-[-0.045em]">
              <span className="sr-only">{publications.length} </span>
              {t.publications.title}
            </h1>
            <p className="mt-4 text-ink2">{t.publications.intro}</p>
            <p className="mt-5 text-sm text-ink3">
              <span className="num text-ink">{profile.metrics.citations}</span> {t.home.citations} · h-index{' '}
              <span className="num text-ink">{profile.metrics.hIndex}</span> · {t.publications.i10}{' '}
              <span className="num text-ink">{profile.metrics.i10Index}</span> —{' '}
              <Ext href={profile.links.scholar} className="link-quiet">
                {profile.metrics.source}
              </Ext>
              , {monthYear(profile.metrics.asOf, lang)}
            </p>
          </div>
        </div>

        <div className="mt-14 space-y-2 md:mt-20" role="group" aria-label={t.publications.venues}>
          <Marquee items={journals} duration={52} />
          <Marquee items={publishers} reverse duration={60} offset={1} />
        </div>
      </section>

      {/* ------------------------------------------------------- the index */}
      <section aria-labelledby="pub-index-title" className="tone-light blend-t pb-28 pt-8">
        <h2 id="pub-index-title" className="sr-only">
          {t.publications.index}
        </h2>
        <div className="page sticky-bar">
          <div className="glass flex min-w-0 flex-col gap-3 rounded-[2rem] p-3 xl:flex-row xl:items-center xl:justify-between">
            <FilterChips
              id="pub-type"
              bare
              scroll
              label={t.publications.filterType}
              value={type}
              onChange={setType}
              options={[
                { value: 'all', label: t.publications.types.all, count: publications.length },
                ...TYPES.filter((ty) => counts[ty]).map((ty) => ({ value: ty, label: t.publications.types[ty], count: counts[ty] })),
              ]}
            />
            <div className="flex gap-2">
              <div className="relative flex-1 xl:w-60 xl:flex-none">
                <label htmlFor={searchId} className="sr-only">
                  {t.common.search}
                </label>
                <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink3" aria-hidden="true" />
                <input
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.publications.searchPlaceholder}
                  className="field rounded-full py-2 pl-10 text-sm"
                />
              </div>
              <label htmlFor={yearId} className="sr-only">
                {t.publications.year}
              </label>
              <select id={yearId} value={year} onChange={(e) => setYear(e.target.value)} className="field w-auto rounded-full py-2 text-sm">
                <option value="all">{t.publications.allYears}</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y === 'in press' ? t.publications.inPress : y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="page pt-6">
          <p className="mb-6 px-1 text-sm text-ink3" role="status" aria-live="polite">
            {t.common.showing(filtered.length, publications.length)}
            {filtersOn && (
              <>
                {' · '}
                <button type="button" className="link-quiet" onClick={clear}>
                  {t.common.clearFilters}
                </button>
              </>
            )}
          </p>
          {filtered.length === 0 ? <p className="py-16 text-ink2">{t.common.noResults}</p> : <PubIndex items={filtered} />}
        </div>
      </section>
    </>
  );
}
