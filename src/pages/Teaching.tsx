import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { ArrowUpRight, Search } from 'lucide-react';
import { courses, teachingStatement } from '../content/courses';
import type { Course } from '../content/types';
import { useLang } from '../i18n/useLang';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import Heading from '../components/SectionHeading';
import FilterChips from '../components/FilterChips';
import Dialog from '../components/Dialog';
import { useReveals } from '../lib/reveal';
import { useSpotlight } from '../lib/spotlight';
import { Ext } from '../components/Ext';
import Timetable from '../timetable/Timetable';

type Sort = 'recent' | 'az' | 'za';
const ease = [0.2, 0.7, 0.2, 1] as const;

const latestYear = (c: Course) => Math.max(0, ...c.years.map((y) => Number(y.slice(0, 4))));
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

function CourseDetails({ course }: { course: Course }) {
  const { t } = useLang();
  const rows: [string, string | undefined][] = [
    [t.teaching.programme, course.programme],
    [t.teaching.level, course.level],
    [t.teaching.term, course.term ?? (course.years.length ? course.years.join(', ') : undefined)],
    [t.teaching.credits, course.credits],
    [t.teaching.place, course.place],
  ];
  return (
    <div className="overflow-y-auto">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-y border-ink/10 py-4 text-sm">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="label pt-0.5">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
      </dl>
      <p className="mt-5 text-ink2">{course.description}</p>
      {course.topics && (
        <>
          <h3 className="label mb-2 mt-6 font-sans">{t.teaching.topics}</h3>
          <ul className="space-y-1.5">
            {course.topics.map((x) => (
              <li key={x} className="flex gap-3">
                <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-amber shadow-[0_0_8px_rgb(245_158_59/0.8)]" aria-hidden="true" />
                {x}
              </li>
            ))}
          </ul>
        </>
      )}
      {course.materialsUrl && (
        <p className="mt-6">
          <Ext href={course.materialsUrl} className="btn-ghost">
            {t.teaching.materials}
          </Ext>
        </p>
      )}
    </div>
  );
}

function Courses() {
  const { t } = useLang();
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [grid, setGrid] = useState(false);
  const [open, setOpen] = useState<Course | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const ids = { search: useId(), year: useId(), sort: useId() };

  // Filter options come from the data, so they always match what is listed.
  const years = useMemo(() => [...new Set(courses.flatMap((c) => c.years))].sort().reverse(), []);

  const list = useMemo(() => {
    const q = fold(query.trim());
    return courses
      .filter((c) => year === 'all' || c.years.includes(year))
      .filter((c) => !q || fold(`${c.code ?? ''} ${c.title} ${c.programme} ${c.level}`).includes(q))
      .sort((a, b) =>
        sort === 'az'
          ? a.title.localeCompare(b.title)
          : sort === 'za'
            ? b.title.localeCompare(a.title)
            : latestYear(b) - latestYear(a) || a.title.localeCompare(b.title),
      );
  }, [query, year, sort]);

  return (
    <>
      <div data-reveal="up" className="glass mb-4 flex flex-col gap-3 rounded-[2rem] p-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative sm:w-64">
          <label htmlFor={ids.search} className="sr-only">
            {t.common.search}
          </label>
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink3" aria-hidden="true" />
          <input
            id={ids.search}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.teaching.searchPlaceholder}
            className="field rounded-full py-2 pl-10 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <label htmlFor={ids.year} className="sr-only">
            {t.teaching.year}
          </label>
          <select id={ids.year} value={year} onChange={(e) => setYear(e.target.value)} className="field w-auto rounded-full py-2 text-sm">
            <option value="all">{t.teaching.allYears}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <label htmlFor={ids.sort} className="sr-only">
            {t.teaching.sort}
          </label>
          <select id={ids.sort} value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field w-auto rounded-full py-2 text-sm">
            <option value="recent">{t.teaching.sortRecent}</option>
            <option value="az">{t.teaching.sortAz}</option>
            <option value="za">{t.teaching.sortZa}</option>
          </select>
        </div>
        <FilterChips
          id="course-view"
          bare
          label={t.teaching.view}
          className="sm:ml-auto"
          value={grid ? 'grid' : 'list'}
          onChange={(v) => setGrid(v === 'grid')}
          options={[
            { value: 'list', label: t.teaching.list },
            { value: 'grid', label: t.teaching.grid },
          ]}
        />
      </div>
      <p className="mb-8 px-3 text-sm text-ink3" role="status" aria-live="polite">
        {t.common.showing(list.length, courses.length)}
      </p>

      {list.length === 0 && <p className="text-ink2">{t.common.noResults}</p>}

      <MotionConfig reducedMotion="user">
        <motion.ul layout className={grid ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((c) => (
              <motion.li
                key={c.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(c)}
                  aria-haspopup="dialog"
                  className={`group relative w-full overflow-hidden rounded-3xl border border-ink/10 bg-white/60 text-left transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_40px_70px_-40px_rgb(120_50_20/0.45)] ${
                    grid
                      ? 'flex h-full min-h-[14rem] flex-col p-6'
                      : 'grid grid-cols-1 gap-x-6 gap-y-1 p-5 sm:grid-cols-[9rem_1fr_auto] sm:items-center md:px-7'
                  }`}
                >
                  <span className="eyebrow num text-accent">{c.code ?? c.level}</span>
                  <span className={grid ? 'mt-4 flex-1' : ''}>
                    <span className="block font-serif text-[1.3125rem] leading-snug transition-colors group-hover:text-accent">
                      {c.title}
                    </span>
                    <span className="mt-1 block text-sm text-ink2">{c.programme}</span>
                  </span>
                  <span className={`num flex items-center gap-3 text-sm text-ink3 ${grid ? 'mt-5 justify-between' : ''}`}>
                    {c.term ?? (c.years.length ? c.years.join(', ') : t.teaching.yearUnknown)}
                    <ArrowUpRight
                      size={18}
                      aria-hidden="true"
                      className="text-accent transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </MotionConfig>

      <Dialog
        open={open !== null}
        onClose={close}
        title={
          open && (
            <>
              {open.code && <span className="label mb-1 block font-sans text-accent">{open.code}</span>}
              {open.title}
            </>
          )
        }
      >
        {open && <CourseDetails course={open} />}
      </Dialog>
    </>
  );
}

export function Component() {
  const { t, pick } = useLang();
  const root = useRef<HTMLDivElement>(null);
  useReveals(root);
  useSpotlight(root);
  return (
    <div ref={root}>
      <Seo title={t.teaching.metaTitle} description={t.teaching.metaDescription} path="/teaching" />
      <PageHero
        eyebrow={`${courses.length} · ${t.teaching.courses} · ${t.teaching.timetable}`}
        title={t.teaching.title}
        intro={<p className="font-serif text-[clamp(1.375rem,1rem+1vw,1.875rem)] font-light italic leading-snug text-ink">{pick(teachingStatement)}</p>}
      />

      <section id="courses" aria-labelledby="courses-title" className="tone-light blend-y no-print py-28 md:py-36">
        <div className="page">
          <Heading id="courses" index="01" label={t.teaching.courses} lines={[t.teaching.courses]} />
          <Courses />
        </div>
      </section>

      <section id="timetable" aria-labelledby="timetable-title" className="page pb-28 pt-8 md:pb-36">
        <Heading id="timetable" index="02" label={t.teaching.timetable} lines={[t.teaching.timetable]} intro={t.timetable.intro} />
        <div data-reveal="up" className="rounded-[2rem] border border-ink/10 bg-ink/[0.025] p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] md:p-6">
          <Timetable />
        </div>
      </section>
    </div>
  );
}
