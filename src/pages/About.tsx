import { useRef, type CSSProperties } from 'react';
import { Compass, Medal, Users, Vote, type LucideIcon } from 'lucide-react';
import { profile } from '../content/profile';
import { affiliations, positions } from '../content/experience';
import { certifications, degrees } from '../content/education';
import { service } from '../content/service';
import { awards } from '../content/awards';
import { students } from '../content/students';
import { beyondAcademia } from '../content/beyond';
import { useLang } from '../i18n/useLang';
import { doiUrl } from '../lib/apa';
import { useReveals } from '../lib/reveal';
import { useSpotlight } from '../lib/spotlight';
import Seo from '../components/Seo';
import { Ext, LinkRow } from '../components/Ext';
import MaskText from '../components/MaskText';
import Heading from '../components/SectionHeading';
import ExperienceTimeline from '../components/about/ExperienceTimeline';
import Showcase, { type Entry } from '../components/about/Showcase';
import Logo from '../components/about/Logo';
import FieldGallery from '../components/about/FieldGallery';

/** The About portrait: its own pre-faded cut-out (not the Home hero's), see scripts/build-hero.mjs. */
const PORTRAIT_SRCSET = '/about/aziz-about-cutout-760.webp 760w, /about/aziz-about-cutout-1100.webp 1100w, /about/aziz-about-cutout.webp 2048w';
const PORTRAIT_SIZES = '(min-width: 768px) 50vw, 100vw';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/** Initials for the supervision avatars ("Hiba Ait Bassou" → "HB"). */
const initials = (name: string) => {
  const parts = name.split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

/** One icon per "beyond academia" item, in the order of content/beyond.ts. */
const BEYOND_ICONS: LucideIcon[] = [Medal, Users, Vote, Compass];

export function Component() {
  const { t, pick, lang } = useLang();
  const root = useRef<HTMLDivElement>(null);
  useReveals(root);
  useSpotlight(root);

  const [lead, ...rest] = profile.bio[lang];
  // Pull quote: the first sentence of the bio's last paragraph (twenty years in the classroom), not
  // the research statement used on Home.
  const lastPara = profile.bio[lang][profile.bio[lang].length - 1];
  const pull = lastPara.split(/(?<=\.)\s/)[0];
  const main = degrees.filter((d) => !d.minor);
  const minor = degrees.filter((d) => d.minor);
  const [phd, ...others] = main;

  const serviceEntries = (items: (typeof service)[number]['items']): Entry[] =>
    items.map((s) => ({ key: s.body, period: s.period, title: s.body, sub: s.role, detail: s.detail, links: s.links }));
  const awardEntries: Entry[] = awards.map((a) => ({
    key: a.title,
    period: a.year,
    title: a.title,
    detail: a.detail,
    links: a.links,
  }));
  const certEntries: Entry[] = certifications.map((c) => ({
    key: c.title,
    period: c.year,
    title: c.title,
    sub: c.provider,
    detail: (
      <>
        {c.detail && <p>{c.detail}</p>}
        {c.modules && (
          <ul className="mt-2 space-y-1">
            {c.modules.map((m) => (
              <li key={m.title} className="flex flex-wrap gap-x-3">
                <span>— {m.title}</span>
                {m.link && <LinkRow links={[m.link]} />}
              </li>
            ))}
          </ul>
        )}
      </>
    ),
    links: c.links,
  }));

  return (
    <div ref={root}>
      <Seo title={t.about.metaTitle} description={t.about.metaDescription} path="/about" />

      {/* --------------------------------------------------------------- hero */}
      <section aria-labelledby="about-title" className="tone-dark blend-b relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(40%_50%_at_75%_55%,rgb(226_87_43/0.3),transparent_70%),radial-gradient(30%_35%_at_20%_30%,rgb(245_158_59/0.1),transparent_70%)]"
        />
        <div className="page grid min-h-[min(100svh,58rem)] items-end gap-y-4 pt-28 md:grid-cols-12 md:gap-x-8 md:pt-32">
          <div className="relative z-10 pb-10 md:col-span-7 md:pb-24">
            <p className="eyebrow kin-fade" style={delay(100)}>
              {pick(profile.institute)} · UM6P
            </p>
            <h1 id="about-title" className="display mt-6 text-mega">
              <span className="kin-fade block" style={delay(160)}>
                {t.about.title}
              </span>
            </h1>
            <figure className="kin-fade relative mt-16 md:mt-10" style={delay(420)}>
              <span
                aria-hidden="true"
                className="text-glow absolute -left-2 -top-10 font-serif text-[6rem] leading-none md:-left-10 md:-top-8"
              >
                “
              </span>
              <blockquote>
                <p className="max-w-[26ch] font-serif text-[clamp(1.5rem,1rem+1.7vw,2.5rem)] font-light italic leading-[1.22] tracking-[-0.01em]">
                  {pull}
                </p>
              </blockquote>
            </figure>
          </div>
          {/* Flush with the section's bottom edge: the picture's own fade does the blending. */}
          <div className="relative -mx-5 self-end sm:mx-0 md:col-span-5">
            {/* Warm glow behind his head and shoulders. */}
            <div aria-hidden="true" className="about-glow absolute inset-x-[-15%] top-[-4%] h-[75%]" />
            <picture>
              <source type="image/webp" srcSet={PORTRAIT_SRCSET} sizes={PORTRAIT_SIZES} />
              <img
                src="/about/aziz-about-cutout-1100.png"
                width={2048}
                height={2048}
                alt={t.about.portraitAlt}
                loading="eager"
                decoding="async"
                {...{ fetchpriority: 'high' }}
                className="about-cutout relative mx-auto block h-auto w-full max-w-[40rem] md:-ml-[6%] md:w-[124%] md:max-w-none"
              />
            </picture>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- bio */}
      <section aria-labelledby="bio-title" className="page pb-24 pt-20 md:pb-32 md:pt-28">
        <div className="grid-12 gap-y-6">
          <h2 id="bio-title" className="eyebrow col-span-4 font-sans md:col-span-3 md:pt-2">
            {t.about.bio}
          </h2>
          <div className="col-span-4 md:col-span-9">
            <p data-reveal="up" className="prose-measure font-serif text-[1.375rem] font-light leading-[1.55] md:text-[1.625rem]">
              {lead}
            </p>
            <div data-reveal="up" className="prose-measure mt-6 space-y-5 text-ink2">
              {rest.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <div data-reveal="up" className="mt-10">
              <h3 className="eyebrow font-sans">{t.about.identifiers}</h3>
              <ul className="mt-4 flex flex-wrap gap-2.5 text-sm">
                {[
                  ['Google Scholar', profile.links.scholar],
                  ['ORCID 0000-0003-2219-9586', profile.links.orcid],
                  ...(profile.links.scopus ? [['Scopus', profile.links.scopus]] : []),
                  ['LinkedIn', profile.links.linkedin],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Ext href={href} className="glass inline-flex items-center gap-1 rounded-full px-4 py-2 text-ink transition-colors hover:text-amber">
                      {label}
                    </Ext>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ in the field */}
      <section id="field" aria-labelledby="field-title" className="page pb-24 md:pb-32">
        <Heading id="field" label={t.about.gallery} lines={[t.about.gallery]} intro={t.about.galleryIntro} />
        <FieldGallery />
      </section>

      {/* --------------------------------------------------------- experience */}
      <section id="experience" aria-labelledby="experience-title" className="page pb-24 md:pb-32">
        <Heading id="experience" index="01" label={t.about.experience} lines={[t.about.experience]} intro={t.about.timelineHint} />
        <ExperienceTimeline positions={positions} />

        <h3 className="eyebrow mb-5 mt-16 font-sans md:ml-[calc(8.5rem+2.5rem)]">{t.about.affiliations}</h3>
        <ul data-reveal="stagger" className="grid gap-3 sm:grid-cols-2 md:ml-[calc(8.5rem+2.5rem)]">
          {affiliations.map((a) => (
            <li key={a.name} className="glass rounded-3xl p-5 md:p-6">
              <p className="num eyebrow">{a.period}</p>
              <p className="mt-3 font-display text-[1.75rem] font-bold tracking-[-0.03em]">
                {a.url ? (
                  <Ext href={a.url} className="hover:text-amber">
                    {a.name}
                  </Ext>
                ) : (
                  a.name
                )}
              </p>
              <p className="mt-1 text-[0.9375rem] text-ink">{a.role}</p>
              <p className="mt-1 text-sm text-ink2">{a.org}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------- education */}
      <section id="education" aria-labelledby="education-title" className="tone-light blend-y py-36 md:py-44">
        <div className="page">
          <Heading id="education" index="02" label={t.about.education} lines={[t.about.education]} />
          <ol data-reveal="stagger" className="grid gap-4 lg:grid-cols-3">
            {phd && (
              <li className="group relative flex flex-col rounded-[2rem] border border-ink/10 bg-white/70 p-7 shadow-[0_1px_0_rgb(255_255_255/0.8)_inset] transition-[box-shadow,border-color] duration-500 hover:border-accent/30 hover:shadow-[0_50px_90px_-50px_rgb(120_50_20/0.5)] md:p-10 lg:col-span-2 lg:row-span-2">
                <div className="flex items-start justify-between gap-6">
                  <p className="num display text-[clamp(4rem,2rem+6vw,7.5rem)] leading-[0.85] tracking-[-0.05em] text-accent">{phd.year}</p>
                  <Logo name={phd.logo} className="h-16 w-16" />
                </div>
                <h3 className="mt-8 font-serif text-[2rem] font-normal leading-tight md:text-[2.5rem]">{phd.degree}</h3>
                <p className="mt-2 text-ink2">
                  {phd.school}
                  {phd.place && <span className="text-ink3"> · {phd.place}</span>}
                </p>
                {phd.thesis && (
                  <div className="mt-8 border-t border-ink/10 pt-6">
                    <p className="eyebrow">{t.about.thesis}</p>
                    <p lang="fr" className="mt-3 max-w-[50ch] font-serif text-[1.25rem] italic leading-snug md:text-[1.375rem]">
                      {phd.thesis.title}
                    </p>
                    {phd.thesis.translation && <p className="mt-2 max-w-[60ch] text-ink3">{phd.thesis.translation}</p>}
                    {phd.thesis.doi && (
                      <p className="mt-4">
                        <Ext href={doiUrl(phd.thesis.doi)} className="link num">
                          DOI {phd.thesis.doi}
                        </Ext>
                      </p>
                    )}
                  </div>
                )}
                {phd.links && <LinkRow links={phd.links} className="mt-4" />}
              </li>
            )}
            {others.map((d) => (
              <li
                key={d.id}
                className="group relative flex flex-col rounded-[2rem] border border-ink/10 bg-white/60 p-7 transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_40px_70px_-40px_rgb(120_50_20/0.45)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="num display text-[3.25rem] leading-[0.85] tracking-[-0.05em] text-ink/30 transition-colors duration-500 group-hover:text-accent">
                    {d.year}
                  </p>
                  <Logo name={d.logo} />
                </div>
                <h3 className="mt-6 font-serif text-[1.375rem] font-normal leading-snug">{d.degree}</h3>
                <p className="mt-1 text-[0.9375rem] text-ink2">
                  {d.school}
                  {d.place && <span className="text-ink3"> · {d.place}</span>}
                </p>
                {d.links && <LinkRow links={d.links} className="mt-auto pt-4" />}
              </li>
            ))}
          </ol>

          {minor.length > 0 && (
            <div data-reveal="up" className="mt-10">
              <h3 className="eyebrow font-sans">{t.about.earlier}</h3>
              <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink2">
                {minor.map((d) => (
                  <li key={d.id}>
                    <span className="num mr-2 text-ink3">{d.year}</span>
                    {d.degree} — {d.school}
                    {d.place && `, ${d.place}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------- supervision */}
      <section id="supervision" aria-labelledby="supervision-title" className="page pb-24 pt-8 md:pb-32">
        <Heading
          id="supervision"
          index="03"
          label={t.about.supervision}
          lines={[t.about.supervision]}
          intro={t.about.supervisionIntro}
        />
        <ul data-reveal="stagger" className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {students.map((s) => (
            <li key={s.name} className="card-dark spot group flex flex-col p-6">
              <div className="relative z-10 flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-vivid to-amber font-display text-[1.125rem] font-bold text-[#160b05] shadow-[0_0_30px_-4px_rgb(226_87_43/0.7)] transition-transform duration-500 group-hover:scale-105"
                >
                  {initials(s.name)}
                </span>
                <div>
                  <h3 className="font-serif text-[1.25rem] font-normal leading-snug">{s.name}</h3>
                  <p className="num text-sm text-ink3">
                    {t.about.cohort} {s.cohort}
                  </p>
                </div>
              </div>
              <p className="relative z-10 mt-5 text-[0.9375rem] leading-relaxed text-ink">{s.topic}</p>
              <p className="relative z-10 mt-auto pt-4 text-sm text-ink3">{s.status}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------------ service */}
      <section id="service" aria-labelledby="service-title" className="page pb-24 md:pb-32">
        <Heading id="service" index="04" label={t.about.service} lines={[t.about.service]} />
        <div className="space-y-16">
          {service.map((g) => (
            <Showcase
              key={g.id}
              entries={serviceEntries(g.items)}
              heading={<h3 className="eyebrow mb-5 font-sans text-amber">{pick(g.title)}</h3>}
            />
          ))}
        </div>
      </section>

      {/* ---------------------------------------------- awards & development */}
      <section id="awards" aria-labelledby="awards-title" className="tone-light blend-y py-36 md:py-44">
        <div className="page">
          <Heading id="awards" index="05" label={t.about.awards} lines={[t.about.awards]} />
          <Showcase entries={awardEntries} tone="light" />

          <div id="development" className="mt-24">
            <Heading
              id="development"
              index="06"
              label={t.about.certifications}
              lines={[t.about.certifications]}
            />
            <Showcase entries={certEntries} tone="light" />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- beyond */}
      <section id="beyond" aria-labelledby="beyond-title" className="page pb-28 pt-8 md:pb-40">
        <div className="grid-12 mb-12 gap-y-6 md:mb-16">
          <p className="eyebrow num col-span-4 md:col-span-3 md:pt-4">
            <span className="text-amber" aria-hidden="true">
              07 ·{' '}
            </span>
            {t.about.beyond}
          </p>
          <h2 id="beyond-title" data-reveal="mask" className="display col-span-4 text-big md:col-span-9">
            <MaskText lines={[t.about.beyond]} />
          </h2>
        </div>
        <ul data-reveal="stagger" className="grid gap-3 md:grid-cols-4 md:gap-4">
          {beyondAcademia.map((b, i) => {
            const Icon = BEYOND_ICONS[i % BEYOND_ICONS.length];
            const big = i === 0;
            return (
              <li
                key={b.en}
                className={`card-dark spot group flex min-h-[12rem] flex-col p-6 ${big ? 'md:col-span-2 md:row-span-2 md:min-h-[24rem] md:p-8' : i === 3 ? 'md:col-span-2' : ''}`}
              >
                <span
                  aria-hidden="true"
                  className={`relative z-10 inline-flex items-center justify-center rounded-2xl bg-amber/10 text-amber shadow-[0_0_30px_-6px_rgb(245_158_59/0.6)] ring-1 ring-amber/30 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110 ${big ? 'h-16 w-16' : 'h-12 w-12'}`}
                >
                  <Icon size={big ? 30 : 22} strokeWidth={1.6} />
                </span>
                <p
                  className={`relative z-10 mt-auto pt-8 ${big ? 'font-serif text-[1.75rem] leading-snug md:text-[2.25rem]' : 'text-[0.9375rem] leading-relaxed text-ink'}`}
                >
                  {pick(b)}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
