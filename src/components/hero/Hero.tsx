import { useCallback, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download } from 'lucide-react';
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

export const PORTRAIT_SRCSET = '/img/portrait-400.webp 400w, /img/portrait-560.webp 560w, /img/portrait-736.webp 736w';
export const PORTRAIT_SIZES = '(min-width: 1248px) 260px, (min-width: 768px) 22vw, 46vw';

/** Entrance delay for the CSS-driven hero animation (see .kin-* in index.css). */
const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/** Moorish pointed arch, in object-bounding-box units (0–1). */
const ARCH = 'M0,1 V0.36 C0,0.17 0.22,0.05 0.5,0 C0.78,0.05 1,0.17 1,0.36 V1 Z';
/** The same arch in a 100 × 125 box (4:5), for the outline drawn around the portrait. */
const ARCH_OUTLINE = 'M0,125 V45 C0,21.25 22,6.25 50,0 C78,6.25 100,21.25 100,45 V125';

export default function Hero() {
  const { t, pick, lang } = useLang();
  const hero = useRef<HTMLElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const onLive = useCallback(() => setLive(true), []);

  const { graph } = researchGraph();
  const themes = graph.nodes.filter((n) => n.kind === 'theme');
  const coauthors = graph.nodes.filter((n) => n.kind === 'coauthor').length;
  const [first, ...rest] = profile.name.split(' ');

  // Scroll parallax: portrait and text drift at different speeds; the cue fades out.
  useGsap(({ gsap }) => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const st = { trigger: hero.current, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero-portrait', { yPercent: -9, ease: 'none', scrollTrigger: st });
      gsap.to('.hero-text', { y: 60, ease: 'none', scrollTrigger: st });
      gsap.to('.hero-cue', { autoAlpha: 0, ease: 'none', scrollTrigger: { ...st, end: '15% top' } });
    });
  }, hero);

  return (
    <section
      ref={hero}
      className="hero relative overflow-hidden"
      data-live={live || undefined}
      aria-labelledby="hero-name"
    >
      <HeroNetwork heroRef={hero} anchorRef={anchor} onLive={onLive} />
      <div aria-hidden="true" className="hero-veil pointer-events-none absolute inset-0" />

      <div className="page relative flex min-h-[inherit] flex-col justify-center pb-24 pt-10 md:pt-14">
        <div className="grid-12 items-center gap-y-10 md:gap-y-16">
          <div className="hero-text relative z-10 order-2 col-span-4 md:order-none md:col-span-7">
            <p className="label kin-fade" style={delay(80)}>
              {pick(profile.institute)} · UM6P · {pick(profile.location)}
            </p>
            <h1 id="hero-name" className="mt-8 font-serif font-light tracking-[-0.035em]">
              <span
                className="kin-fade block font-sans text-lead font-normal tracking-normal text-ink2"
                style={delay(120)}
              >
                {profile.honorific}
              </span>
              <span className="block text-display" aria-label={profile.name}>
                <span className="kin-line" aria-hidden="true">
                  <span style={delay(180)}>{first}</span>
                </span>
                <span className="kin-line" aria-hidden="true">
                  <span style={delay(300)}>{rest.join(' ')}</span>
                </span>
              </span>
              <span className="sr-only">, {profile.postnominal}</span>
            </h1>
            <p className="kin-fade mt-6 max-w-[40ch] text-lead text-ink" style={delay(520)}>
              {profile.postnominal} — {pick(profile.title)} · {pick(profile.role)}, {profile.institutionShort}
            </p>
            <p
              className="kin-fade mt-8 max-w-[36ch] border-l-2 border-vivid pl-5 font-serif text-[1.375rem] font-light italic leading-snug text-ink2 md:text-[1.5rem]"
              style={delay(640)}
            >
              {pick(profile.statement)}
            </p>
            <div className="kin-fade mt-10 flex flex-wrap items-center gap-x-6 gap-y-4" style={delay(760)}>
              <Magnetic>
                <Link to="/research" className="btn-solid">
                  {t.hero.explore} <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </Magnetic>
              {__HAS_CV__ && (
                <a href={profile.cvPdf} className="btn-line" download>
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

          <div className="order-1 col-span-4 md:order-none md:col-span-5">
            {/* The stage: the network is centred on it; the portrait sits at its lower right. */}
            <div ref={anchor} className="hero-stage relative mx-auto aspect-square w-[82%] max-w-[22rem] md:w-full md:max-w-none">
              {/* Stand-ins for the canvas: the star it starts from, or the finished network. */}
              <NetworkPoster formed={false} className="hero-poster hero-poster-star" />
              <NetworkPoster formed className="hero-poster hero-poster-final" />

              <figure className="hero-portrait absolute bottom-[-4%] right-0 w-[50%] md:right-[-6%] md:w-[52%]" data-no-network>
                <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
                  <clipPath id="hero-arch" clipPathUnits="objectBoundingBox">
                    <path d={ARCH} />
                  </clipPath>
                </svg>
                <div className="relative">
                  <svg
                    viewBox="0 0 100 125"
                    aria-hidden="true"
                    className="arch-outline pointer-events-none absolute -inset-[5%] h-[110%] w-[110%] overflow-visible"
                  >
                    <path d={ARCH_OUTLINE} pathLength={1} fill="none" />
                  </svg>
                  <div className="arch relative aspect-[4/5] overflow-hidden bg-ink">
                    <img
                      src="/img/portrait-400.webp"
                      srcSet={PORTRAIT_SRCSET}
                      sizes={PORTRAIT_SIZES}
                      width={736}
                      height={920}
                      alt={t.home.portraitAlt}
                      {...{ fetchpriority: 'high' }}
                      decoding="async"
                      className="arch-img h-full w-full object-cover"
                    />
                    <span aria-hidden="true" className="arch-curtain absolute inset-0 bg-vivid" />
                  </div>
                </div>
                <figcaption className="kin-fade mt-3 text-sm text-ink3" style={delay(900)}>
                  {t.home.portraitCaption}
                </figcaption>
              </figure>
            </div>
          </div>
        </div>

        <div className="sr-only">
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

        <a
          href="#figures"
          className="hero-cue absolute bottom-6 left-5 hidden items-center gap-3 text-sm text-ink3 hover:text-accent sm:left-8 md:flex lg:left-12"
        >
          <span className="cue-track" aria-hidden="true">
            <span />
          </span>
          {t.hero.scroll}
          <span className="hidden text-ink3/80 lg:inline">· {t.hero.networkHint}</span>
        </a>
      </div>
    </section>
  );
}
