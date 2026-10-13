import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { ArrowUpRight, Search } from 'lucide-react';
import { courses as coursesData, teachingStatement } from '../content/courses';
import { txDeep } from '../lib/tx';
import type { Course } from '../content/types';
import { useLang } from '../i18n/useLang';
import { photoSrc, photoSrcSet, photos } from '../lib/photos';
import Seo from '../components/Seo';
import StatementReveal from '../components/teaching/StatementReveal';
import FlipCard from '../components/teaching/FlipCard';
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
  const { t, tx } = useLang();
  const courses = useMemo(() => txDeep(coursesData, tx), [tx]);
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [grid, setGrid] = useState(true);
  const [open, setOpen] = useState<Course | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const ids = { search: useId(), year: useId(), sort: useId() };

  // Filter options come from the data, so they always match what is listed.
  const years = useMemo(() => [...new Set(courses.flatMap((c) => c.years))].sort().reverse(), [courses]);

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
  }, [courses, query, year, sort]);

  return (
    <>
      <div data-reveal="up" className="glass sticky-bar mb-4 flex flex-col gap-3 rounded-[2rem] p-3 sm:flex-row sm:flex-wrap sm:items-center">
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
            { value: 'grid', label: t.teaching.grid },
            { value: 'list', label: t.teaching.list },
          ]}
        />
      </div>
      <p className="mb-8 px-3 text-sm text-ink3" role="status" aria-live="polite">
        {t.common.showing(list.length, courses.length)}
      </p>

      {list.length === 0 && <p className="text-ink2">{t.common.noResults}</p>}

      {grid && list.length > 0 && <p className="-mt-4 mb-6 px-3 text-sm text-ink3">{t.teaching.flipHint}</p>}

      <MotionConfig reducedMotion="user">
        <motion.ul layout className={grid ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
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
                {grid ? (
                  <FlipCard course={c} index={courses.indexOf(c)} onDetails={() => setOpen(c)} />
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpen(c)}
                    aria-haspopup="dialog"
                    className="group relative grid w-full grid-cols-1 gap-x-6 gap-y-1 overflow-hidden rounded-3xl border border-ink/10 bg-white/60 p-5 text-left transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_40px_70px_-40px_rgb(120_50_20/0.45)] sm:grid-cols-[9rem_1fr_auto] sm:items-center md:px-7"
                  >
                    <span className="eyebrow num text-accent">{c.code ?? c.level}</span>
                    <span>
                      <span className="block font-serif text-[1.3125rem] leading-snug transition-colors group-hover:text-accent">
                        {c.title}
                      </span>
                      <span className="mt-1 block text-sm text-ink2">{c.programme}</span>
                    </span>
                    <span className="num flex items-center gap-3 text-sm text-ink3">
                      {c.term ?? (c.years.length ? c.years.join(', ') : null)}
                      <ArrowUpRight
                        size={18}
                        aria-hidden="true"
                        className="text-accent transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </button>
                )}
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

/** Two photos taken while teaching, overlapping: the opener's right half. */
function Photos() {
  const { pick } = useLang();
  const main = photos.teaching;
  const room = photos.teachingRoom;
  return (
    <figure className="relative mx-auto max-w-[26rem] pb-14 md:max-w-none md:pb-20">
      <div aria-hidden="true" className="hero-rim absolute inset-x-[-10%] top-[-8%] h-[85%]" />
      <img
        src={photoSrc(main)}
        srcSet={photoSrcSet(main)}
        sizes="(min-width: 768px) 34vw, 80vw"
        width={main.w}
        height={main.h}
        alt={pick(main.alt)}
        decoding="async"
        {...{ fetchpriority: 'high' }}
        className="relative aspect-square w-[82%] -rotate-[2deg] rounded-[2rem] object-cover shadow-[0_60px_100px_-40px_rgb(0_0_0/0.95),0_0_0_1px_rgb(255_255_255/0.1)]"
      />
      <img
        src={photoSrc(room)}
        srcSet={photoSrcSet(room)}
        sizes="(min-width: 768px) 24vw, 60vw"
        width={room.w}
        height={room.h}
        alt={pick(room.alt)}
        loading="lazy"
        decoding="async"
        className="absolute bottom-0 right-0 w-[62%] rotate-[3deg] rounded-2xl border-4 border-paper object-cover shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]"
      />
      <figcaption className="sr-only">
        {pick(main.caption)} · {pick(room.caption)}
      </figcaption>
    </figure>
  );
}

export function Component() {
  const { t, lang, pick } = useLang();
  const courses = coursesData;
  const root = useRef<HTMLDivElement>(null);
  useReveals(root);
  useSpotlight(root);
  return (
    <div ref={root}>
      <Seo title={t.teaching.metaTitle} description={t.teaching.metaDescription} path="/teaching" />

      {/* ------------------------------------- opening: the statement, word by word */}
      <section aria-labelledby="page-title" className="tone-dark blend-b relative isolate overflow-x-clip">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_45%_at_78%_45%,rgb(226_87_43/0.22),transparent_70%),radial-gradient(30%_30%_at_10%_20%,rgb(245_158_59/0.08),transparent_70%)]"
        />
        <StatementReveal
          text={pick(teachingStatement)}
          lang={lang}
          header={
            <div className="kin-fade">
              <p className="eyebrow num text-amber">
                {courses.length} · {t.teaching.courses} · {t.teaching.timetable}
              </p>
              <h1 id="page-title" className="display mt-3 text-[clamp(2.75rem,1.5rem+3.4vw,5rem)] leading-[0.9] tracking-[-0.045em]">
                {t.teaching.title}
              </h1>
              <p className="eyebrow mt-8">{t.teaching.statement}</p>
            </div>
          }
          aside={<Photos />}
        />
      </section>

      <section id="courses" aria-labelledby="courses-title" className="tone-light blend-y no-print py-28 md:py-36">
        <div className="page">
          <Heading id="courses" index="01" label={t.teaching.courses} lines={[t.teaching.courses]} />
          <Courses />
        </div>
      </section>

      {/* ------------------------------------- the timetable as a framed app */}
      <section id="timetable" aria-labelledby="timetable-title" className="tone-dark blend-t relative isolate pb-28 pt-28 md:pb-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_30%,rgb(226_87_43/0.12),transparent_70%)]"
        />
        <div className="page">
          <Heading id="timetable" index="02" label={t.teaching.timetable} lines={[t.teaching.timetable]} intro={t.timetable.intro} />
          <div data-reveal="up" className="tt-app">
            <div aria-hidden="true" className="tt-app-bar">
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-vivid" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber" />
                <span className="h-2.5 w-2.5 rounded-full bg-ink/25" />
              </span>
              <span className="num text-xs tracking-[0.08em] text-ink3">{t.teaching.timetable} — Aziz Mimoudi · ISE – UM6P</span>
              <span className="w-10" />
            </div>
            <div className="p-4 md:p-6">
              <Timetable />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
