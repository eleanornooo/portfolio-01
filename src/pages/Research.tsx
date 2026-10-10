import { Link } from 'react-router-dom';
import { methods, projects, researchInterests } from '../content/projects';
import { publications } from '../content/publications';
import type { Project } from '../content/types';
import { useLang } from '../i18n/useLang';
import Seo from '../components/Seo';
import Section, { PageHeader } from '../components/Section';
import { Ext, LinkRow } from '../components/Ext';
import { StatusTag } from '../components/Tags';

const STATUS_ORDER = { Active: 0, Pending: 1, Completed: 2 } as const;

function shortRef(id: string): string | null {
  const p = publications.find((x) => x.id === id);
  if (!p) return null;
  const first = p.authors[0].split(',')[0];
  const etal = p.authors.length > 2 ? ' et al.' : p.authors.length === 2 ? ` & ${p.authors[1].split(',')[0]}` : '';
  return `${first}${etal}, ${p.year === 'in press' ? 'in press' : p.year}`;
}

function ProjectRow({ p }: { p: Project }) {
  const { t } = useLang();
  return (
    <li className="grid grid-cols-1 gap-x-10 gap-y-4 py-8 lg:grid-cols-[1fr_15rem]">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <StatusTag status={p.status} />
          <span className="num text-sm text-ink3">{p.period}</span>
        </div>
        <h3 className="text-h3 font-normal leading-snug">{p.title}</h3>
        <p className="prose-measure mt-3 text-ink2">{p.summary}</p>
        {(p.url || p.links) && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {p.url && <Ext href={p.url}>{t.research.website}</Ext>}
            {p.links && <LinkRow links={p.links} />}
          </div>
        )}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 self-start border-t border-rule pt-4 text-sm lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <dt className="label">{t.research.role}</dt>
        <dd className="lg:mb-2">{p.role}</dd>
        {p.funder && (
          <>
            <dt className="label">{t.research.funder}</dt>
            <dd className="lg:mb-2">{p.funder}</dd>
          </>
        )}
        {p.coordinator && (
          <>
            <dt className="label">{t.research.coordinator}</dt>
            <dd className="lg:mb-2">{p.coordinator}</dd>
          </>
        )}
        {p.budget && (
          <>
            <dt className="label">{t.research.budget}</dt>
            <dd className="num font-serif text-h3 font-light">{p.budget}</dd>
          </>
        )}
      </dl>
    </li>
  );
}

export function Component() {
  const { t, pick } = useLang();
  const funded = projects
    .filter((p) => p.group === 'funded')
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  const research = projects.filter((p) => p.group === 'research');
  const digital = projects.filter((p) => p.group === 'digital');

  return (
    <>
      <Seo title={t.research.metaTitle} description={t.research.metaDescription} path="/research" />
      <PageHeader title={t.research.title} intro={t.research.intro} />

      <Section id="interests" index="01" label={t.research.interests}>
        <ol className="space-y-12">
          {researchInterests.map((r, i) => (
            <li key={r.title.en} className="grid grid-cols-[2.5rem_1fr] gap-x-4 md:grid-cols-[3.5rem_1fr]">
              <span className="num pt-1 font-serif text-h3 font-light text-accent">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="text-h3 font-normal leading-snug md:text-[1.625rem]">{pick(r.title)}</h3>
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
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 border-t border-ink pt-5">
          <h3 className="label mb-4 font-sans">{t.research.methods}</h3>
          <p className="font-serif text-[1.375rem] font-light leading-relaxed md:text-[1.625rem]">
            {methods.map((m, i) => (
              <span key={m.en}>
                {pick(m)}
                {i < methods.length - 1 && <span className="px-3 text-vivid" aria-hidden="true">/</span>}
                {i < methods.length - 1 && <span className="sr-only">, </span>}
              </span>
            ))}
          </p>
        </div>
      </Section>

      <Section id="funded" index="02" label={t.research.funded} intro={t.research.fundedIntro}>
        <ul className="divide-y divide-rule border-y border-rule">
          {funded.map((p) => (
            <ProjectRow key={p.id} p={p} />
          ))}
        </ul>
      </Section>

      <Section id="collaborations" index="03" label={t.research.collaborations}>
        <ul className="divide-y divide-rule border-y border-rule">
          {research.map((p) => (
            <ProjectRow key={p.id} p={p} />
          ))}
        </ul>
      </Section>

      <Section id="digital" index="04" label={t.research.digital}>
        <ul className="divide-y divide-rule border-y border-rule">
          {digital.map((p) => (
            <ProjectRow key={p.id} p={p} />
          ))}
        </ul>
      </Section>
    </>
  );
}
