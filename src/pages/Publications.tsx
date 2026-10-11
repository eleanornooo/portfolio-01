import { useId, useMemo, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { Search } from 'lucide-react';
import { profile } from '../content/profile';
import { publications } from '../content/publications';
import type { Publication, PublicationType } from '../content/types';
import { useLang } from '../i18n/useLang';
import { monthYear } from '../lib/dates';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import FilterChips from '../components/FilterChips';
import PubEntry from '../components/PubEntry';
import { Ext } from '../components/Ext';
import { CountUp } from '../components/Figures';

const TYPES: PublicationType[] = ['article', 'chapter', 'proceedings', 'report', 'thesis'];
const yearKey = (p: Publication) => (p.year === 'in press' ? 'in press' : String(p.year));
const yearSort = (k: string) => (k === 'in press' ? 9999 : Number(k));
const ease = [0.2, 0.7, 0.2, 1] as const;

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
    { v: profile.metrics.citations, l: t.home.citations },
    { v: profile.metrics.hIndex, l: 'h-index' },
    { v: profile.metrics.i10Index, l: t.publications.i10 },
  ];
  const filtersOn = type !== 'all' || year !== 'all' || query !== '';
  const clear = () => {
    setType('all');
    setYear('all');
    setQuery('');
  };

  return (
    <>
      <Seo title={t.publications.metaTitle} description={t.publications.metaDescription} path="/publications" />
      <PageHero
        eyebrow={`${profile.honorific} ${profile.name} · ${publications.length}`}
        title={t.publications.title}
        intro={t.publications.intro}
        aside={
          <div>
            <h2 className="sr-only">{t.publications.metrics}</h2>
            <dl className="grid grid-cols-3 gap-3">
              {metrics.map((m, i) => (
                <div key={m.l} className="glass flex flex-col-reverse justify-end gap-2 rounded-3xl p-4 md:p-5">
                  <dt className="text-sm leading-snug text-ink2">{m.l}</dt>
                  <dd className="num display text-[2.75rem] leading-[0.9] tracking-[-0.04em] md:text-[3.5rem]">
                    <span className="text-glow">
                      <CountUp value={m.v} delay={i * 90} />
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-ink3">
              <Ext href={profile.links.scholar} className="link-quiet">
                {profile.metrics.source}
              </Ext>
              , {monthYear(profile.metrics.asOf, lang)}
            </p>
          </div>
        }
      />

      <div className="tone-light blend-t pb-28">
        {/* ------------------------------------------------------------ filters */}
        <div className="page sticky top-[4.75rem] z-30 pt-10 md:top-[5.25rem]">
          <div className="glass flex flex-col gap-3 rounded-[2rem] p-3 xl:flex-row xl:items-center xl:justify-between">
            <FilterChips
              id="pub-type"
              label={t.publications.filterType}
              value={type}
              onChange={setType}
              bare
              options={[
                { value: 'all', label: t.publications.types.all, count: publications.length },
                ...TYPES.filter((ty) => counts[ty]).map((ty) => ({
                  value: ty,
                  label: t.publications.types[ty],
                  count: counts[ty],
                })),
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

        {/* --------------------------------------------------------- bibliography */}
        <div className="page pt-2">
          <p className="mt-3 px-3 text-sm text-ink3" role="status" aria-live="polite">
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
          {groups.length === 0 && <p className="py-16 text-ink2 md:pl-[25%]">{t.common.noResults}</p>}
          <MotionConfig reducedMotion="user">
            <AnimatePresence initial={false} mode="popLayout">
              {groups.map(([y, items]) => (
                <motion.section
                  key={y}
                  layout="position"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease }}
                  className="grid-12 border-b border-ink/10 py-10"
                  aria-labelledby={`y-${y}`}
                >
                  <h2 id={`y-${y}`} className="col-span-4 mb-4 md:col-span-3 md:mb-0">
                    <span
                      className={`num display block leading-none tracking-[-0.05em] text-ink/20 md:sticky md:top-56 ${
                        y === 'in press' ? 'text-[2.5rem] md:text-[3rem]' : 'text-[3.5rem] md:text-[5rem]'
                      }`}
                    >
                      {y === 'in press' ? t.publications.inPress : y}
                    </span>
                  </h2>
                  <ol className="col-span-4 space-y-2 md:col-span-9">
                    <AnimatePresence initial={false} mode="popLayout">
                      {items.map((p) => (
                        <motion.li
                          key={p.id}
                          layout="position"
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.4, ease }}
                          className="-mx-4 rounded-3xl border border-transparent px-4 py-4 transition-[background-color,border-color,box-shadow] duration-500 hover:border-ink/10 hover:bg-white/70 hover:shadow-[0_30px_60px_-40px_rgb(120_50_20/0.45)] md:-mx-6 md:px-6"
                        >
                          <PubEntry pub={p} />
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
    </>
  );
}
