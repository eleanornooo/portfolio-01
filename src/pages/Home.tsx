import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
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
import Highlights from '../components/Highlights';
import GlobeSection from '../components/globe/GlobeSection';
import { useLang } from '../i18n/useLang';
import { useNow } from '../hooks/useNow';
import { byDateDesc, monthYear, timing, yearOf } from '../lib/dates';
import { useReveals } from '../lib/reveal';
import { useSpotlight } from '../lib/spotlight';
import Seo from '../components/Seo';
import PubEntry from '../components/PubEntry';
import { Ext } from '../components/Ext';
import { StatusTag } from '../components/Tags';
import Magnetic from '../components/Magnetic';
import MaskText from '../components/MaskText';
import Hero, { CUTOUT_SIZES, CUTOUT_SRC, CUTOUT_SRCSET } from '../components/hero/Hero';

const sortYear = (y: number | 'in press') => (y === 'in press' ? 9999 : y);

/** Section heading: a small numbered label and a giant display title that unmasks on scroll. */
function Heading({
  id,
  index,
  label,
  lines,
  intro,
  aside,
}: {
  id: string;
  index: string;
  label: string;
  lines: ReactNode[];
  intro?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="grid-12 mb-12 gap-y-6 md:mb-16">
      <p className="eyebrow num col-span-4 md:col-span-3 md:pt-4">
        <span className="text-amber" aria-hidden="true">
          {index} ·{' '}
        </span>
        {label}
      </p>
      <div className="col-span-4 md:col-span-9">
        <h2 id={`${id}-title`} data-reveal="mask" className="display text-big">
          <MaskText lines={lines} />
        </h2>
        {intro && (
          <p data-reveal="up" className="prose-measure mt-6 text-lead text-ink2">
            {intro}
          </p>
        )}
        {aside}
      </div>
    </div>
  );
}

export function Component() {
  const { t, pick, lang } = useLang();
  const now = useNow();
  const root = useRef<HTMLDivElement>(null);
  useReveals(root);
  useSpotlight(root);

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
    <div ref={root}>
      <Seo title={t.home.metaTitle} description={t.home.metaDescription} path="/" />
      <Head>
        {/* The cut-out portrait is the largest element on the page: fetch it early. */}
        <link
          rel="preload"
          as="image"
          href={CUTOUT_SRC}
          imageSrcSet={CUTOUT_SRCSET}
          imageSizes={CUTOUT_SIZES}
          {...{ fetchpriority: 'high' }}
        />
      </Head>

      <Hero />

      {/* ------------------------------------------------------------- numbers */}
      {/* Always dark, like the hero it continues; in the light theme it fades out at the bottom. */}
      <section id="figures" className="tone-dark blend-b scroll-mt-24 pb-28 pt-10 md:pb-40" aria-label={t.home.figures}>
        <div className="page">
          <Figures
            figures={figures}
            note={t.home.metricsSource(profile.metrics.source, monthYear(profile.metrics.asOf, lang))}
          />
        </div>
      </section>

      {/* ---------------------------------------------------------- highlights */}
      <section id="highlights" aria-labelledby="highlights-title" className="page pb-28 pt-8 md:pb-40">
        <Heading
          id="highlights"
          index="01"
          label={t.home.highlights}
          lines={[
            <>
              {t.home.highlights} <span className="text-glow">{highlightYear}</span>
            </>,
          ]}
        />
        <Highlights items={highlights} now={now} />
      </section>

      {/* ------------------------------------------------ selected publications */}
      <section id="selected" aria-labelledby="selected-title" className="tone-light blend-y py-36 md:py-44">
        <div className="page">
          <Heading id="selected" index="02" label={t.home.selected} lines={[t.home.selectedTitle]} />
          <ol data-reveal="stagger" className="border-t border-ink/10">
            {selected.map((p) => (
              <li
                key={p.id}
                className="group grid grid-cols-1 gap-x-8 gap-y-2 border-b border-ink/10 py-7 transition-colors sm:grid-cols-[7rem_1fr] md:py-8"
              >
                <p className="num display text-[2.25rem] leading-none tracking-[-0.04em] text-ink/25 transition-[color,transform] duration-500 group-hover:translate-x-1 group-hover:text-accent">
                  {p.year === 'in press' ? t.publications.inPress : p.year}
                </p>
                <PubEntry pub={p} />
              </li>
            ))}
          </ol>
          <p className="mt-12">
            <Magnetic strength={0.2}>
              <Link to="/publications" className="btn-ghost">
                {t.home.allPublications} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Magnetic>
          </p>
        </div>
      </section>

      <Journey index="03" />

      <GlobeSection index="04" />

      {/* ----------------------------------------------------- current projects */}
      <section id="projects" aria-labelledby="projects-title" className="tone-light blend-y py-36 md:py-44">
        <div className="page">
          <Heading id="projects" index="05" label={t.home.projects} lines={[t.home.projectsTitle]} />
          <ul data-reveal="stagger" className="grid gap-4 md:grid-cols-2">
            {current.map((p) => (
              <li
                key={p.id}
                className="group relative flex flex-col rounded-3xl border border-ink/10 bg-white/60 p-6 shadow-[0_1px_0_rgb(255_255_255/0.8)_inset] transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1.5 hover:border-accent/30 hover:shadow-[0_40px_70px_-40px_rgb(120_50_20/0.45)] md:p-8"
              >
                <div className="flex flex-wrap items-center gap-3 text-sm text-ink3">
                  <StatusTag status={p.status} />
                  <span className="num">{p.period}</span>
                </div>
                <h3 className="mt-5 font-serif text-[1.5rem] font-normal leading-snug md:text-[1.75rem]">
                  {p.url ? (
                    <Ext
                      href={p.url}
                      className="outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-accent"
                    >
                      {p.short ?? p.title}
                    </Ext>
                  ) : (
                    (p.short ?? p.title)
                  )}
                </h3>
                <p className="mt-2 text-ink2">
                  {p.role} · {p.funder}
                </p>
                {p.budget && (
                  <p className="num display mt-auto pt-8 text-[2.5rem] leading-none tracking-[-0.04em] text-accent">
                    {p.budget}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-12">
            <Magnetic strength={0.2}>
              <Link to="/research" className="btn-ghost">
                {t.home.allResearch} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </Magnetic>
          </p>
        </div>
      </section>

      {/* -------------------------------------------------------- contact strip */}
      <section
        aria-labelledby="contact-strip"
        className="tone-dark blend-t relative isolate overflow-hidden pb-28 pt-36 md:pb-36 md:pt-48"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="glow-field opacity-80" />
        </div>
        <div className="page">
          <p className="eyebrow mb-8">{t.home.contactTitle}</p>
          <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
            <h2
              id="contact-strip"
              data-reveal="mask"
              className="display text-[clamp(3.5rem,1rem+11vw,12rem)] leading-[0.86] tracking-[-0.05em]"
            >
              <MaskText lines={[t.home.contactBig[0], <span className="text-glow">{t.home.contactBig[1]}</span>]} />
            </h2>
            <div className="flex flex-col items-start gap-5 lg:items-center">
              <Magnetic strength={0.45}>
                <Link
                  to="/contact"
                  className="btn-glow h-36 w-36 flex-col justify-center gap-1 rounded-full p-4 text-center text-[0.9375rem] md:h-44 md:w-44"
                >
                  <ArrowUpRight size={22} aria-hidden="true" />
                  {t.home.contactCta}
                </Link>
              </Magnetic>
              <a href={`mailto:${profile.email.primary}`} className="link-quiet text-sm">
                {profile.email.primary}
              </a>
              <p className="text-sm text-ink3">{pick(profile.location)}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
