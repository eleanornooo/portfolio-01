import { Link } from 'react-router-dom';
import { ArrowRight, Download } from 'lucide-react';
import { profile } from '../content/profile';
import { news } from '../content/news';
import { publications } from '../content/publications';
import { projects } from '../content/projects';
import { students } from '../content/students';
import { talks } from '../content/talks';
import { useLang } from '../i18n/useLang';
import { useNow } from '../hooks/useNow';
import { byDateDesc, formatDate, monthYear, timing, yearOf } from '../lib/dates';
import Seo from '../components/Seo';
import Section from '../components/Section';
import Reveal from '../components/Reveal';
import PubEntry from '../components/PubEntry';
import { Ext } from '../components/Ext';
import { KindTag, StatusTag, TimingTag } from '../components/Tags';
import { ZelligeRule } from '../components/Zellige';

// Borders for a 2×2 grid on phones and a single row of four from md up.
const FIGURE_CELL = [
  '',
  'border-l pl-6 md:pl-8',
  'border-t md:border-l md:border-t-0 md:pl-8',
  'border-l border-t pl-6 md:border-t-0 md:pl-8',
];

const sortYear = (y: number | 'in press') => (y === 'in press' ? 9999 : y);

export function Component() {
  const { t, pick, lang } = useLang();
  const now = useNow();

  const talksGiven = talks.filter((x) => timing(x.date, x.endDate, now) !== 'upcoming').length;
  const highlights = [...news].sort(byDateDesc);
  const highlightYear = Math.max(...news.map((n) => yearOf(n.date)));
  const selected = publications
    .filter((p) => p.selected)
    .sort((a, b) => sortYear(b.year) - sortYear(a.year))
    .slice(0, 5);
  const current = projects.filter((p) => p.group === 'funded' && p.status !== 'Completed');

  const figures = [
    { value: profile.metrics.citations, label: t.home.citations },
    { value: profile.metrics.hIndex, label: t.home.hIndex },
    { value: students.length, label: t.home.students },
    { value: talksGiven, label: t.home.talks },
  ];

  return (
    <>
      <Seo title={t.home.metaTitle} description={t.home.metaDescription} path="/" />

      {/* ---------------------------------------------------------------- hero */}
      <section className="page pb-14 pt-10 md:pb-20 md:pt-16" aria-labelledby="hero-name">
        <div className="grid-12 items-end gap-y-12">
          <div className="col-span-4 md:col-span-7 lg:pb-6">
            <p className="label">
              {pick(profile.institute)} · UM6P · {pick(profile.location)}
            </p>
            <h1 id="hero-name" className="mt-8 font-serif font-light tracking-[-0.035em]">
              <span className="block font-sans text-lead font-normal tracking-normal text-ink2">
                {profile.honorific}
              </span>
              <span className="block text-display">{profile.name}</span>
              <span className="sr-only">, {profile.postnominal}</span>
            </h1>
            <p className="mt-6 max-w-[40ch] text-lead text-ink">
              <span className="font-medium">{profile.postnominal}</span> — {pick(profile.title)} ·{' '}
              {pick(profile.role)}, {profile.institutionShort}
            </p>
            <p className="mt-8 max-w-[36ch] border-l-2 border-vivid pl-5 font-serif text-[1.375rem] font-light italic leading-snug text-ink2 md:text-[1.5rem]">
              {pick(profile.statement)}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              {__HAS_CV__ && (
                <a href={profile.cvPdf} className="btn-solid" download>
                  <Download size={16} aria-hidden="true" />
                  {t.common.downloadCv}
                  <span className="sr-only"> (PDF)</span>
                </a>
              )}
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <li>
                  <Ext href={profile.links.scholar}>Google Scholar</Ext>
                </li>
                <li>
                  <Ext href={profile.links.orcid}>ORCID</Ext>
                </li>
                <li>
                  <Ext href={profile.links.linkedin}>LinkedIn</Ext>
                </li>
              </ul>
            </div>
          </div>

          <figure className="col-span-4 md:col-span-5">
            <img
              src="/img/portrait-560.webp"
              srcSet="/img/portrait-400.webp 400w, /img/portrait-560.webp 560w, /img/portrait-736.webp 736w"
              sizes="(min-width: 1248px) 470px, (min-width: 768px) 38vw, 92vw"
              width={736}
              height={920}
              alt={t.home.portraitAlt}
              {...{ fetchpriority: "high" }}
              decoding="async"
              className="aspect-[4/5] w-full bg-ink object-cover"
            />
            <figcaption className="mt-3 text-sm text-ink3">{t.home.portraitCaption}</figcaption>
          </figure>
        </div>
      </section>

      {/* ------------------------------------------------------------- numbers */}
      <Reveal as="section" className="page" aria-label="Key figures">
        <dl className="grid grid-cols-2 border-y border-rule md:grid-cols-4">
          {figures.map((f, i) => (
            <div key={f.label} className={`flex flex-col-reverse gap-1 border-rule py-6 md:py-8 ${FIGURE_CELL[i]}`}>
              <dt className="text-sm text-ink2">{f.label}</dt>
              <dd className="num font-serif text-[2.75rem] font-light leading-none md:text-[3.5rem]">{f.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-sm text-ink3">
          {t.home.metricsSource(profile.metrics.source, monthYear(profile.metrics.asOf, lang))}
        </p>
      </Reveal>

      <div className="h-16 md:h-24" />

      {/* ---------------------------------------------------------- highlights */}
      <Section id="highlights" index="01" label={`${t.home.highlights} ${highlightYear}`}>
        <ol className="divide-y divide-rule border-b border-rule">
          {highlights.map((n) => {
            const when = timing(n.date, n.endDate, now);
            return (
              <li key={n.id} className="grid grid-cols-1 gap-x-8 gap-y-2 py-5 sm:grid-cols-[9rem_1fr]">
                <p className="num pt-0.5 text-sm text-ink3">{formatDate(n.date, lang, n.endDate)}</p>
                <div>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <TimingTag timing={when} />
                    <KindTag>{n.kind}</KindTag>
                  </div>
                  <p className="font-serif text-[1.25rem] leading-snug">
                    {n.url ? (
                      <Ext href={n.url} className="link-quiet decoration-transparent hover:decoration-accent">
                        {pick(n.title)}
                      </Ext>
                    ) : (
                      pick(n.title)
                    )}
                  </p>
                  {n.detail && <p className="prose-measure mt-1 text-ink2">{pick(n.detail)}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </Section>

      {/* ------------------------------------------------ selected publications */}
      <Section id="selected" index="02" label={t.home.selected} title={t.home.selectedTitle}>
        <ol className="space-y-8">
          {selected.map((p) => (
            <li key={p.id} className="grid grid-cols-1 gap-x-8 sm:grid-cols-[4rem_1fr]">
              <p className="num font-serif text-h3 text-ink3">
                {p.year === 'in press' ? t.publications.inPress : p.year}
              </p>
              <PubEntry pub={p} />
            </li>
          ))}
        </ol>
        <p className="mt-10">
          <Link to="/publications" className="link inline-flex items-center gap-2">
            {t.home.allPublications} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </p>
      </Section>

      {/* ----------------------------------------------------- current projects */}
      <Section id="projects" index="03" label={t.home.projects} title={t.home.projectsTitle}>
        <ul className="divide-y divide-rule border-y border-rule">
          {current.map((p) => (
            <li key={p.id} className="grid grid-cols-1 gap-x-8 gap-y-2 py-6 md:grid-cols-[1fr_auto]">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-ink3">
                  <StatusTag status={p.status} />
                  <span className="num">{p.period}</span>
                </div>
                <h3 className="text-h3 font-normal">
                  {p.url ? (
                    <Ext href={p.url} className="link-quiet decoration-transparent hover:decoration-accent">
                      {p.short ?? p.title}
                    </Ext>
                  ) : (
                    (p.short ?? p.title)
                  )}
                </h3>
                <p className="mt-1 text-ink2">
                  {p.role} · {p.funder}
                </p>
              </div>
              {p.budget && (
                <p className="num self-end font-serif text-h3 font-light md:text-right">{p.budget}</p>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-10">
          <Link to="/research" className="link inline-flex items-center gap-2">
            {t.home.allResearch} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </p>
      </Section>

      {/* -------------------------------------------------------- contact strip */}
      <section className="page pb-20" aria-labelledby="contact-strip">
        <ZelligeRule className="mb-14" />
        <div className="grid-12 items-end gap-y-8">
          <h2 id="contact-strip" className="col-span-4 text-h2 font-light md:col-span-8">
            {t.home.contactTitle}
          </h2>
          <div className="col-span-4 flex flex-col items-start gap-3 md:col-span-4 md:items-end">
            <Link to="/contact" className="btn-solid">
              {t.home.contactCta} <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a href={`mailto:${profile.email.primary}`} className="link text-sm">
              {profile.email.primary}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
