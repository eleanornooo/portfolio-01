import { useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { methods, projects, researchInterests } from '../content/projects';
import { publications } from '../content/publications';
import type { Project } from '../content/types';
import { useLang } from '../i18n/useLang';
import { projectText, pubText, themesOf } from '../lib/related';
import { useReveals } from '../lib/reveal';
import { scrollToElement } from '../lib/smooth';
import Seo from '../components/Seo';
import Heading from '../components/SectionHeading';
import ResearchMap from '../components/research/ResearchMap';
import ProjectCases from '../components/research/ProjectCases';

const STATUS_ORDER = { Active: 0, Pending: 1, Completed: 2 } as const;
const GROUP_ORDER = { funded: 0, research: 1, digital: 2 } as const;

function shortRef(id: string): string | null {
  const p = publications.find((x) => x.id === id);
  if (!p) return null;
  const first = p.authors[0].split(',')[0];
  const etal = p.authors.length > 2 ? ' et al.' : p.authors.length === 2 ? ` & ${p.authors[1].split(',')[0]}` : '';
  return `${first}${etal}, ${p.year === 'in press' ? 'in press' : p.year}`;
}

export function Component() {
  const { t, pick } = useLang();
  const root = useRef<HTMLDivElement>(null);
  useReveals(root);
  const [theme, setTheme] = useState<number | null>(null);

  const all = useMemo(
    () =>
      [...projects].sort(
        (a, b) => GROUP_ORDER[a.group] - GROUP_ORDER[b.group] || (a.group === 'funded' ? STATUS_ORDER[a.status] - STATUS_ORDER[b.status] : 0),
      ),
    [],
  );
  const projectThemes = useMemo(() => new Map(all.map((p) => [p.id, themesOf(projectText(p))])), [all]);
  const shown = theme === null ? all : all.filter((p) => projectThemes.get(p.id)!.includes(theme));
  // Works per theme, for the phone theme cloud (bigger pill = more work).
  const weight = useMemo(
    () =>
      researchInterests.map(
        (_, i) =>
          publications.filter((p) => themesOf(pubText(p), p.id).includes(i)).length +
          all.filter((p) => projectThemes.get(p.id)!.includes(i)).length,
      ),
    [all, projectThemes],
  );
  const groupLabel = (p: Project) =>
    p.group === 'funded' ? t.research.funded : p.group === 'research' ? t.research.collaborations : t.research.digital;

  const choose = (i: number | null, scroll = true) => {
    setTheme((prev) => (i === null || prev === i ? null : i));
    if (scroll) {
      const el = document.getElementById('interests');
      if (el) scrollToElement(el);
    }
  };
  const goToCase = (id: string) => {
    const el = document.getElementById(`case-${id}`);
    if (el) scrollToElement(el);
  };

  return (
    <div ref={root}>
      <Seo title={t.research.metaTitle} description={t.research.metaDescription} path="/research" />

      {/* ------------------------------------------------------- the map (opening) */}
      <section aria-labelledby="research-title" className="tone-dark blend-b relative isolate overflow-hidden md:h-[100svh] md:min-h-[44rem]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(45%_55%_at_62%_50%,rgb(226_87_43/0.16),transparent_70%),radial-gradient(25%_30%_at_15%_85%,rgb(245_158_59/0.08),transparent_70%)]"
        />
        <div className="rmap-in absolute inset-0 hidden md:block">
          <ResearchMap active={theme} onTheme={(i) => choose(i)} onProject={goToCase} />
        </div>

        <div className="page pointer-events-none relative flex h-full flex-col justify-end pb-12 pt-28 md:pb-14">
          <div className="pointer-events-auto max-w-[23rem]">
            <p className="eyebrow kin-fade">{t.research.mapTitle}</p>
            <h1 id="research-title" className="display kin-fade mt-4 text-[clamp(3rem,1.6rem+3.4vw,5rem)] leading-[0.9] tracking-[-0.045em]">
              {t.research.title}
            </h1>
            <p className="kin-fade mt-5 text-[0.9375rem] leading-relaxed text-ink2" style={{ '--d': '150ms' } as CSSProperties}>
              {t.research.intro}
            </p>
            {/* legend (desktop, where the map is) */}
            <div className="kin-fade mt-6 hidden md:block" style={{ '--d': '300ms' } as CSSProperties}>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink3">
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-[#f7c27a] to-vivid shadow-[0_0_10px_rgb(245_158_59/0.7)]" />
                  {t.research.mapLegend.theme}
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-vivid" />
                  {t.research.mapLegend.project}
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ink2" />
                  {t.research.mapLegend.publication}
                </li>
              </ul>
              <p className="mt-3 text-xs text-ink3">{t.research.mapHint}</p>
            </div>
          </div>

          {/* phones: a tappable theme cloud instead of the graph */}
          <ul className="pointer-events-auto mt-8 flex flex-wrap gap-2 md:hidden" aria-label={t.research.themes}>
            {researchInterests.map((r, i) => (
              <li key={r.title.en}>
                <button
                  type="button"
                  aria-pressed={theme === i}
                  onClick={() => choose(i)}
                  className={`rounded-full border px-3.5 py-2 text-left leading-tight transition-colors ${
                    theme === i ? 'border-amber bg-amber text-[#160b05]' : 'border-amber/30 bg-amber/[0.07] text-ink hover:border-amber/70'
                  }`}
                  style={{ fontSize: `${0.8 + Math.min(weight[i], 12) * 0.03}rem` }}
                >
                  {pick(r.title)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------- themes */}
      <section id="interests" aria-labelledby="interests-title" className="tone-light blend-y scroll-mt-16 py-32 md:py-40">
        <div className="page">
          <Heading
            id="interests"
            index="01"
            label={t.research.interests}
            lines={[t.research.themes]}
            aside={
              theme !== null && (
                <p className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink2" role="status">
                  {t.research.filtered(pick(researchInterests[theme].title))}
                  <button type="button" className="btn-small" onClick={() => choose(null, false)}>
                    <X size={14} aria-hidden="true" />
                    {t.research.allThemes}
                  </button>
                </p>
              )
            }
          />
          <ol className="border-t border-ink/10">
            {researchInterests.map((r, i) => {
              const on = theme === null || theme === i;
              return (
                <li
                  key={r.title.en}
                  className={`grid gap-x-8 border-b border-ink/10 py-8 transition-opacity duration-500 md:grid-cols-[6rem_1fr] md:py-10 ${on ? '' : 'opacity-40'}`}
                >
                  <span aria-hidden="true" className={`num display text-[3.5rem] leading-none tracking-[-0.05em] ${theme === i ? 'text-accent' : 'text-ink/20'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3>
                      <button
                        type="button"
                        aria-pressed={theme === i}
                        onClick={() => choose(i, false)}
                        className="text-left font-serif text-[1.625rem] font-normal leading-snug transition-colors hover:text-accent md:text-[2rem]"
                      >
                        {pick(r.title)}
                      </button>
                    </h3>
                    {on && (
                      <>
                        <p className="prose-measure mt-3 text-ink2">{pick(r.body)}</p>
                        {r.refs && r.refs.length > 0 && (
                          <p className="mt-3 text-sm text-ink3">
                            {t.research.seeAlso}:{' '}
                            {r.refs
                              .map(shortRef)
                              .filter(Boolean)
                              .map((ref, j) => (
                                <span key={ref}>
                                  {j > 0 && '; '}
                                  <Link to="/publications" className="link-quiet">
                                    {ref}
                                  </Link>
                                </span>
                              ))}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          <div data-reveal="up" className="mt-16">
            <h3 className="eyebrow mb-4 font-sans">{t.research.methods}</h3>
            <p className="font-serif text-[1.375rem] font-light italic leading-relaxed md:text-[1.75rem]">
              {methods.map((m, i) => (
                <span key={m.en}>
                  {pick(m)}
                  {i < methods.length - 1 && (
                    <span className="px-3 text-accent" aria-hidden="true">
                      /
                    </span>
                  )}
                  {i < methods.length - 1 && <span className="sr-only">, </span>}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- projects */}
      <section id="projects" aria-labelledby="projects-title" className="page pb-20 pt-10">
        <Heading
          id="projects"
          index="02"
          label={t.research.projects}
          lines={[t.research.projects]}
          intro={theme !== null ? t.research.filtered(pick(researchInterests[theme].title)) : t.research.fundedIntro}
          className="mb-4 md:mb-0"
        />
        {shown.length ? (
          <ProjectCases key={theme ?? 'all'} items={shown} groupLabel={groupLabel} />
        ) : (
          <p className="py-16 text-ink2">{t.research.noProjects}</p>
        )}
      </section>
    </div>
  );
}
