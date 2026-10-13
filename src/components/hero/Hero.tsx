import { useCallback, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Download } from 'lucide-react';
import { profile } from '../../content/profile';
import { publications } from '../../content/publications';
import { projects } from '../../content/projects';
import { talks } from '../../content/talks';
import { researchGraph, nodeText } from '../../lib/graph';
import { useGsap } from '../../lib/gsap';
import { useLang } from '../../i18n/useLang';
import { Ext } from '../Ext';
import Magnetic from '../Magnetic';
import HeroNetwork from './HeroNetwork';
import NetworkPoster from './NetworkPoster';

// Cut-out portrait (transparent WebP, from public/hero/aziz-cutout.png via `npm run images:hero`).
export const CUTOUT_SRC = '/img/hero/aziz-cutout-760.webp';
export const CUTOUT_SRCSET =
  '/img/hero/aziz-cutout-480.webp 480w, /img/hero/aziz-cutout-760.webp 760w, /img/hero/aziz-cutout-1100.webp 1100w';
// The portrait's height is ≈86% of the hero (≤ 70rem) on desktop, so its width tracks vh.
export const CUTOUT_SIZES = '(min-width: 768px) min(72vh, 820px), 96vw';
const CUTOUT_W = 1100;
const CUTOUT_H = 1332;

/** Entrance delay for the CSS-driven hero animation (see .kin-* in index.css). */
const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;
const depth = (px: number) => ({ '--depth': px }) as CSSProperties;

/** The giant surname, as SVG so it spans the width exactly and can fade top → bottom. */
function GiantWord({ word, outline = false }: { word: string; outline?: boolean }) {
  const id = outline ? undefined : 'hero-word-fade';
  return (
    <svg
      viewBox="0 0 1000 206"
      className={`block w-full overflow-visible ${outline ? 'hero-word-outline' : 'hero-word'}`}
      aria-hidden="true"
      focusable="false"
    >
      {id && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F4EEE6" stopOpacity="0.97" />
            <stop offset="0.5" stopColor="#EBC9A2" stopOpacity="0.55" />
            <stop offset="1" stopColor="#E2572B" stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      <text
        x="0"
        y="203"
        fontSize="282"
        textLength="1000"
        lengthAdjust="spacingAndGlyphs"
        fill={id ? `url(#${id})` : undefined}
      >
        {word}
      </text>
    </svg>
  );
}

export default function Hero() {
  const { t, pick, lang } = useLang();
  const hero = useRef<HTMLElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const onLive = useCallback(() => setLive(true), []);

  const { graph } = researchGraph();
  const themes = graph.nodes.filter((n) => n.kind === 'theme');
  const coauthors = graph.nodes.filter((n) => n.kind === 'coauthor').length;
  const surname = profile.name.split(' ').slice(-1)[0].toUpperCase();

  // Scroll depth: the farther a layer, the slower it leaves. The word drifts and grows,
  // the network sinks behind, the portrait lags a little, the card leaves first.
  useGsap(({ gsap }) => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const st = { trigger: hero.current, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero-word-layer', { yPercent: 70, scale: 1.12, opacity: 0.35, ease: 'none', scrollTrigger: st });
      gsap.to(anchor.current, { yPercent: 28, ease: 'none', scrollTrigger: st });
      gsap.to('.hero-portrait-layer', { yPercent: 14, ease: 'none', scrollTrigger: st });
      gsap.to('.hero-card-layer', { yPercent: -22, ease: 'none', scrollTrigger: st });
      gsap.to('.hero-glow', { opacity: 0.25, ease: 'none', scrollTrigger: st });
      gsap.to('.hero-cue', { autoAlpha: 0, ease: 'none', scrollTrigger: { ...st, end: '12% top' } });
    });
  }, hero);

  const Primary = __HAS_CV__ ? (
    <a href={profile.cvPdf} className="btn-glow" download>
      <Download size={16} aria-hidden="true" />
      {t.common.downloadCv}
      <span className="sr-only"> (PDF)</span>
    </a>
  ) : (
    <Link to="/research" className="btn-glow">
      {t.hero.explore} <ArrowRight size={16} aria-hidden="true" />
    </Link>
  );
  const Secondary = __HAS_CV__ ? (
    <Link to="/research" className="btn-ghost">
      {t.hero.explore} <ArrowRight size={16} aria-hidden="true" />
    </Link>
  ) : (
    <Link to="/contact" className="btn-ghost">
      {t.home.contactCta} <ArrowUpRight size={16} aria-hidden="true" />
    </Link>
  );

  return (
    <section
      ref={hero}
      className="hero tone-dark relative isolate overflow-hidden"
      data-live={live || undefined}
      aria-labelledby="hero-name"
    >
      {/* 1 · back glow */}
      <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0 -z-10" />

      {/* 2 · the giant word, behind everything else */}
      <div aria-hidden="true" className="hero-word-layer pointer-events-none absolute inset-x-0 top-[21%] z-0 md:top-[19%]">
        <div className="hero-depth px-3 md:px-5" style={depth(14)}>
          <div className="hero-word-in">
            <GiantWord word={surname} />
          </div>
        </div>
      </div>

      {/* 3 · the network floats around and behind the portrait */}
      <HeroNetwork heroRef={hero} anchorRef={anchor} onLive={onLive} />
      <div
        ref={anchor}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[54%] z-10 xl:left-[47%] aspect-square w-[min(110vw,56svh)] -translate-x-1/2 -translate-y-1/2 md:w-[min(80vw,78svh)]"
      >
        <NetworkPoster formed={false} className="hero-poster hero-poster-star" />
        <NetworkPoster formed className="hero-poster hero-poster-final" />
      </div>

      {/* 4 · the cut-out portrait, in front of the word */}
      <div className="hero-portrait-layer pointer-events-none absolute inset-0 z-20">
        <div
          className="hero-depth absolute bottom-0 left-1/2 h-[70%] -translate-x-1/2 md:h-[84%] xl:left-[47%]"
          style={{ ...depth(-8), aspectRatio: `${CUTOUT_W} / ${CUTOUT_H}` }}
          data-no-network
        >
          <div aria-hidden="true" className="hero-rim absolute inset-x-[-25%] top-[2%] h-[70%]" />
          <img
            src={CUTOUT_SRC}
            srcSet={CUTOUT_SRCSET}
            sizes={CUTOUT_SIZES}
            width={CUTOUT_W}
            height={CUTOUT_H}
            alt={t.home.portraitAlt}
            {...{ fetchpriority: 'high' }}
            decoding="async"
            className="hero-portrait-img relative h-full w-full object-contain object-bottom"
          />
        </div>
      </div>

      {/* 5 · a faint outline of the word passes in front of him (magazine-cover depth) */}
      <div aria-hidden="true" className="hero-word-layer pointer-events-none absolute inset-x-0 top-[21%] z-20 md:top-[19%]">
        <div className="hero-depth px-3 md:px-5" style={depth(14)}>
          <div className="hero-word-in">
            <GiantWord word={surname} outline />
          </div>
        </div>
      </div>

      {/* top line */}
      <div className="page pointer-events-none absolute inset-x-0 top-[4.75rem] z-30 flex justify-between gap-6 md:top-24">
        <p className="eyebrow kin-fade" style={delay(200)}>
          {pick(profile.institute)}
        </p>
        <p className="eyebrow kin-fade hidden text-right sm:block" style={delay(260)}>
          UM6P · {pick(profile.location)}
        </p>
      </div>

      {/* 6 · the glass card, overlapping the bottom of the portrait */}
      <div className="hero-card-layer absolute inset-x-0 bottom-0 z-30">
        <div className="page flex items-end justify-between gap-10 pb-5 md:pb-12">
          <div
            className="glass kin-rise w-full max-w-[29rem] rounded-[1.75rem] p-5 sm:p-6 md:ml-[max(0px,calc(50%-35rem))] md:p-7"
            style={delay(650)}
          >
            <p className="eyebrow text-amber">{pick(profile.role)}</p>
            <h1 id="hero-name" className="mt-3 font-serif text-[1.75rem] font-normal leading-[1.05] tracking-[-0.02em] md:text-[2.25rem]">
              {profile.honorific} {profile.name},{' '}
              <span className="font-light italic text-ink2">{profile.postnominal}</span>
            </h1>
            <p className="mt-2 text-sm text-ink2">
              {pick(profile.title)} · {profile.institutionShort}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Magnetic>{Primary}</Magnetic>
              <Magnetic strength={0.2}>{Secondary}</Magnetic>
            </div>
          </div>

          <div className="kin-fade relative isolate hidden max-w-[16.5rem] pb-2 xl:block" style={delay(900)}>
            {/* A soft dark scrim keeps the quote readable over the giant letters. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-12 -inset-y-10 -z-10 bg-[radial-gradient(closest-side,rgb(10_11_15/0.88),rgb(10_11_15/0.6)_55%,transparent)]"
            />
            <p aria-hidden="true" className="font-serif text-[1.0625rem] font-light italic leading-snug text-ink2">
              {pick(profile.statement)}
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <li>
                <Ext href={profile.links.scholar} className="link-quiet">
                  Google Scholar
                </Ext>
              </li>
              <li>
                <Ext href={profile.links.orcid} className="link-quiet">
                  ORCID
                </Ext>
              </li>
              <li>
                <Ext href={profile.links.linkedin} className="link-quiet">
                  LinkedIn
                </Ext>
              </li>
            </ul>
            <a href="#figures" className="hero-cue mt-8 flex items-center gap-3 text-sm text-ink3 hover:text-ink">
              <span className="cue-track" aria-hidden="true">
                <span />
              </span>
              {t.hero.scroll}
              <span className="hidden text-ink3/80 2xl:inline">· {t.hero.networkHint}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="sr-only">
        <p>{pick(profile.statement)}</p>
        <h2>{t.hero.networkTitle}</h2>
        <p>{t.hero.networkSummary(publications.length, projects.length, talks.length, coauthors)}</p>
        <ul>
          {themes.map((n) => {
            const x = nodeText(n, lang);
            return (
              <li key={n.id}>
                {x.title} — {x.detail}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
