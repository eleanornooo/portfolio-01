import { useRef } from 'react';
import { useLang } from '../i18n/useLang';
import { useGsap } from '../lib/gsap';
import { milestones } from '../lib/journey';
import { photoSrc, photoSrcSet } from '../lib/photos';
import { StarMark } from './Zellige';

/**
 * Career story, 1999 → 2026. Desktop: the section pins and the milestones slide past
 * horizontally as you scroll, a progress line draws itself and each year scales up as it
 * reaches the centre. Phones: a vertical timeline. Reduced motion: a plain row that
 * scrolls sideways (desktop) or a list (phones), with nothing animated.
 */
export default function Journey({ index }: { index: string }) {
  const { t, pick } = useLang();
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const items = milestones();
  const first = items[0].year;
  const last = items[items.length - 1].year;

  useGsap(
    ({ gsap }) => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          desk: '(min-width: 768px) and (prefers-reduced-motion: no-preference)',
          phone: '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
        },
        (ctx) => {
          const pinEl = pin.current!;
          const trackEl = track.current!;
          if (ctx.conditions?.desk) {
            pinEl.classList.add('is-pinned');
            const dist = () => Math.max(0, trackEl.scrollWidth - pinEl.clientWidth);
            const st = { trigger: pinEl, start: 'top top', end: () => `+=${dist()}`, invalidateOnRefresh: true };
            const slide = gsap.to(trackEl, {
              x: () => -dist(),
              ease: 'none',
              scrollTrigger: { ...st, pin: true, scrub: 0.8, anticipatePin: 1 },
            });
            gsap.fromTo('.journey-progress', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { ...st, scrub: true } });
            gsap.utils.toArray<HTMLElement>('.journey-panel').forEach((panel) => {
              const inView = { trigger: panel, containerAnimation: slide, scrub: true };
              gsap.fromTo(
                panel.querySelector('.journey-year'),
                { scale: 0.55, opacity: 0.25 },
                { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { ...inView, start: 'left 98%', end: 'left 45%' } },
              );
              gsap.fromTo(
                panel.querySelector('.journey-copy'),
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, ease: 'none', scrollTrigger: { ...inView, start: 'left 90%', end: 'left 55%' } },
              );
              const img = panel.querySelector('.journey-img');
              if (img)
                gsap.fromTo(
                  img,
                  { xPercent: -7 },
                  { xPercent: 7, ease: 'none', scrollTrigger: { ...inView, start: 'left right', end: 'right left' } },
                );
            });
            return () => pinEl.classList.remove('is-pinned');
          }
          gsap.fromTo(
            '.journey-progress-v',
            { scaleY: 0 },
            { scaleY: 1, ease: 'none', scrollTrigger: { trigger: trackEl, start: 'top 75%', end: 'bottom 60%', scrub: true } },
          );
          gsap.utils.toArray<HTMLElement>('.journey-panel').forEach((panel) => {
            gsap.from(panel, {
              opacity: 0,
              y: 48,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: { trigger: panel, start: 'top 88%' },
            });
          });
        },
      );
    },
    root,
  );

  return (
    <section ref={root} id="journey" aria-labelledby="journey-title" className="journey relative">
      <div className="page">
        <div className="grid-12 border-t border-rule pb-10 pt-6 md:pb-4">
          <p className="label num col-span-4 mb-6 md:col-span-3 md:mb-0">
            <span className="text-accent" aria-hidden="true">
              {index} —{' '}
            </span>
            {t.journey.label}
          </p>
          <div className="col-span-4 md:col-span-9">
            <h2 id="journey-title" className="num text-h2 font-normal">
              {first} <span className="text-vivid">→</span> {last}
            </h2>
            <p className="prose-measure mt-4 text-lead text-ink2">{t.journey.intro}</p>
          </div>
        </div>
      </div>

      <div ref={pin} className="journey-pin relative md:flex md:h-[100svh] md:flex-col md:justify-center">
        {/* phone timeline rail */}
        <span aria-hidden="true" className="absolute bottom-0 left-[calc(1.25rem+3px)] top-0 w-px bg-rule sm:left-[calc(2rem+3px)] md:hidden">
          <span className="journey-progress-v absolute inset-0 origin-top bg-vivid" />
        </span>

        <ol
          ref={track}
          className="journey-track flex flex-col gap-16 px-5 pb-8 pl-12 sm:px-8 sm:pl-16 md:w-max md:flex-row md:items-stretch md:gap-[5vw] md:px-[max(3rem,calc((100vw-78rem)/2+3rem))] md:pb-0 md:pr-[18vw]"
        >
          {items.map((m, i) => (
            <li
              key={m.id}
              className={`journey-panel relative md:flex md:h-[min(68svh,34rem)] md:shrink-0 md:snap-start ${
                m.photo ? 'md:w-[min(76vw,54rem)]' : 'md:w-[min(46vw,30rem)]'
              }`}
            >
              <StarMark className="absolute -left-[2.15rem] top-[1.4rem] h-4 w-4 text-vivid sm:-left-[2.65rem] md:hidden" />
              <div className={`flex flex-col md:h-full md:justify-between ${m.photo ? 'md:w-[52%] md:pr-10' : 'md:w-full'}`}>
                <p className="label num">
                  <span className="text-accent">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-ink3"> / {String(items.length).padStart(2, '0')} · </span>
                  {pick(m.chapter)}
                </p>
                <p
                  className="journey-year num mt-4 origin-bottom-left font-serif text-[clamp(4.5rem,3rem+9vw,11rem)] font-light leading-[0.85] tracking-[-0.04em] text-ink"
                  aria-hidden="true"
                >
                  {m.year}
                </p>
                <div className="journey-copy mt-6 border-t border-rule pt-5">
                  <h3 className="font-serif text-[1.5rem] font-normal leading-snug md:text-[1.75rem]">
                    <span className="sr-only">{m.period ?? m.year}: </span>
                    {m.title}
                  </h3>
                  <p className="mt-2 text-ink2">
                    {m.org}
                    {m.place && <span className="text-ink3"> · {m.place}</span>}
                  </p>
                  {m.period && (
                    <p className="num mt-2 text-sm text-ink3" aria-hidden="true">
                      {m.period}
                    </p>
                  )}
                </div>
              </div>
              {m.photo && (
                <figure className="mt-6 md:mt-0 md:w-[48%]">
                  <div className="relative aspect-[4/3] overflow-hidden bg-paper2 md:aspect-auto md:h-[calc(100%-2rem)]">
                    <img
                      src={photoSrc(m.photo)}
                      srcSet={photoSrcSet(m.photo)}
                      sizes="(min-width: 768px) 30vw, 90vw"
                      width={m.photo.w}
                      height={m.photo.h}
                      alt={pick(m.photo.alt)}
                      loading="lazy"
                      decoding="async"
                      className="journey-img absolute inset-0 h-full w-full scale-[1.15] object-cover"
                    />
                  </div>
                  <figcaption className="mt-2 text-sm text-ink3">{pick(m.photo.caption)}</figcaption>
                </figure>
              )}
            </li>
          ))}
        </ol>

        {/* desktop progress line */}
        <div aria-hidden="true" className="page hidden md:mt-10 md:block">
          <div className="num flex items-center gap-4 text-sm text-ink3">
            <span>{first}</span>
            <span className="relative h-px flex-1 bg-rule">
              <span className="journey-progress absolute inset-0 origin-left bg-vivid" />
            </span>
            <span>{last}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
