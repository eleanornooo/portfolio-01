import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { ArrowRight } from 'lucide-react';
import { profile } from '../content/profile';
import { news } from '../content/news';
import { publications } from '../content/publications';
import { projects } from '../content/projects';
import { students } from '../content/students';
import { talks } from '../content/talks';
import { positions } from '../content/experience';
import { countryCount } from '../lib/places';
import Figures from '../components/Figures';
import Journey from '../components/Journey';
import GlobeSection from '../components/globe/GlobeSection';
import { useLang } from '../i18n/useLang';
import { useNow } from '../hooks/useNow';
import { byDateDesc, formatDate, monthYear, timing, yearOf } from '../lib/dates';
import Seo from '../components/Seo';
import Section from '../components/Section';
import PubEntry from '../components/PubEntry';
import { Ext } from '../components/Ext';
import { KindTag, StatusTag, TimingTag } from '../components/Tags';
import { ZelligeRule } from '../components/Zellige';
import Hero, { PORTRAIT_SIZES, PORTRAIT_SRCSET } from '../components/hero/Hero';

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

  const firstYear = Math.min(...positions.map((p) => Number(p.start)));
  const figures = [
    { value: profile.metrics.citations, label: t.home.citations },
    { value: profile.metrics.hIndex, label: t.home.hIndex },
    { value: students.length, label: t.home.students },
    { value: talksGiven, label: t.home.talks },
    { value: new Date(now).getUTCFullYear() - firstYear, suffix: '+', label: t.home.years },
    { value: countryCount(), label: t.home.countries },
  ];

  return (
    <>
      <Seo title={t.home.metaTitle} description={t.home.metaDescription} path="/" />
      <Head>
        {/* The portrait is the largest element on the page: fetch it early. */}
        <link
          rel="preload"
          as="image"
          href="/img/portrait-560.webp"
          imageSrcSet={PORTRAIT_SRCSET}
          imageSizes={PORTRAIT_SIZES}
          {...{ fetchpriority: 'high' }}
        />
      </Head>

      <Hero />

      {/* ------------------------------------------------------------- numbers */}
      <section id="figures" className="page scroll-mt-24" aria-label={t.home.figures}>
        <Figures
          figures={figures}
          note={t.home.metricsSource(profile.metrics.source, monthYear(profile.metrics.asOf, lang))}
        />
      </section>

      <div className="h-16 md:h-24" />

      <Journey index="01" />

      <div className="h-16 md:h-24" />

      <GlobeSection index="02" />

      {/* ---------------------------------------------------------- highlights */}
      <Section id="highlights" index="03" label={`${t.home.highlights} ${highlightYear}`}>
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
      <Section id="selected" index="04" label={t.home.selected} title={t.home.selectedTitle}>
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
      <Section id="projects" index="05" label={t.home.projects} title={t.home.projectsTitle}>
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
