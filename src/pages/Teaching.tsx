import { useCallback, useId, useMemo, useState } from 'react';
import { LayoutGrid, List, Search } from 'lucide-react';
import { courses, teachingStatement } from '../content/courses';
import type { Course } from '../content/types';
import { useLang } from '../i18n/useLang';
import Seo from '../components/Seo';
import Section, { PageHeader } from '../components/Section';
import Dialog from '../components/Dialog';
import { Ext } from '../components/Ext';

type Sort = 'recent' | 'az' | 'za';

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
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-y border-rule py-4 text-sm">
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
                <span className="mt-[0.8rem] h-px w-3 shrink-0 bg-vivid" aria-hidden="true" />
                {x}
              </li>
            ))}
          </ul>
        </>
      )}
      {course.materialsUrl && (
        <p className="mt-6">
          <Ext href={course.materialsUrl} className="btn-line">
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
      <div className="mb-8 flex flex-col gap-3 border-y border-rule py-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative sm:w-64">
          <label htmlFor={ids.search} className="sr-only">
            {t.common.search}
          </label>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink3" aria-hidden="true" />
          <input
            id={ids.search}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.teaching.searchPlaceholder}
            className="field py-2 pl-9 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <label htmlFor={ids.year} className="sr-only">
            {t.teaching.year}
          </label>
          <select id={ids.year} value={year} onChange={(e) => setYear(e.target.value)} className="field w-auto py-2 text-sm">
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
          <select id={ids.sort} value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field w-auto py-2 text-sm">
            <option value="recent">{t.teaching.sortRecent}</option>
            <option value="az">{t.teaching.sortAz}</option>
            <option value="za">{t.teaching.sortZa}</option>
          </select>
        </div>
        <div role="group" aria-label={t.teaching.view} className="flex gap-1 sm:ml-auto">
          <button type="button" className="chip inline-flex items-center gap-1.5" aria-pressed={!grid} onClick={() => setGrid(false)}>
            <List size={15} aria-hidden="true" /> {t.teaching.list}
          </button>
          <button type="button" className="chip inline-flex items-center gap-1.5" aria-pressed={grid} onClick={() => setGrid(true)}>
            <LayoutGrid size={15} aria-hidden="true" /> {t.teaching.grid}
          </button>
        </div>
        <p className="w-full text-sm text-ink3" role="status" aria-live="polite">
          {t.common.showing(list.length, courses.length)}
        </p>
      </div>

      {list.length === 0 && <p className="text-ink2">{t.common.noResults}</p>}

      <ul className={grid ? 'grid gap-px bg-rule sm:grid-cols-2' : 'divide-y divide-rule border-y border-rule'}>
        {list.map((c) => (
          <li key={c.id} className={grid ? 'bg-paper' : ''}>
            <button
              type="button"
              onClick={() => setOpen(c)}
              aria-haspopup="dialog"
              className={`group w-full text-left transition-colors hover:bg-paper2/70 ${
                grid
                  ? 'flex h-full flex-col p-5'
                  : 'grid grid-cols-1 gap-x-6 gap-y-1 py-5 sm:grid-cols-[8.5rem_1fr_auto] sm:items-baseline sm:px-2'
              }`}
            >
              <span className="label num text-accent">{c.code ?? c.level}</span>
              <span className={grid ? 'mt-3 flex-1' : ''}>
                <span className="block font-serif text-[1.25rem] leading-snug group-hover:text-accent">{c.title}</span>
                <span className="mt-1 block text-sm text-ink2">{c.programme}</span>
              </span>
              <span className={`num text-sm text-ink3 ${grid ? 'mt-4' : ''}`}>
                {c.term ?? (c.years.length ? c.years.join(', ') : t.teaching.yearUnknown)}
              </span>
            </button>
          </li>
        ))}
      </ul>

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
  return (
    <>
      <Seo title={t.teaching.metaTitle} description={t.teaching.metaDescription} path="/teaching" />
      <PageHeader title={t.teaching.title} intro={pick(teachingStatement)} />
      <Section id="courses" index="01" label={t.teaching.courses}>
        <Courses />
      </Section>
    </>
  );
}
