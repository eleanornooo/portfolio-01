import { useRef } from 'react';
import { useLang } from '../i18n/useLang';
import { useGsap } from '../lib/gsap';
import { milestones } from '../lib/journey';
import { photoSrc, photoSrcSet } from '../lib/photos';
import { StarMark } from './Zellige';
import MaskText from './MaskText';

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
                { scale: 0.6, opacity: 0.4 },
                { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { ...inView, start: 'left 98%', end: 'left 45%' } },
              );
              gsap.fromTo(
                panel.querySelector('.journey-year-fill'),
                { clipPath: 'inset(0% 100% 0% 0%)' },
                { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { ...inView, start: 'left 70%', end: 'left 30%' } },
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
            gsap.fromTo(
              panel.querySelector('.journey-year-fill'),
              { clipPath: 'inset(0% 100% 0% 0%)' },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                duration: 1.2,
                ease: 'power2.inOut',
                scrollTrigger: { trigger: panel, start: 'top 65%' },
              },
            );
          });
        },
      );
    },
    root,
  );

  return (
    <section
      ref={root}
      id="journey"
      aria-labelledby="journey-title"
      className="journey tone-dark blend-y relative pb-16 pt-36 md:pb-20 md:pt-44"
    >
      <div className="page">
        <div className="grid-12 gap-y-6 pb-10 md:pb-6">
          <p className="eyebrow num col-span-4 md:col-span-3 md:pt-4">
            <span className="text-amber" aria-hidden="true">
              {index} ·{' '}
            </span>
            {t.journey.label}
          </p>
          <div className="col-span-4 md:col-span-9">
            <h2 id="journey-title" data-reveal="mask" className="num display whitespace-nowrap text-[clamp(3rem,0.5rem+8.4vw,8.75rem)] leading-[0.9] tracking-[-0.045em]">
              <MaskText
                lines={[
                  <>
                    {first} <span className="text-glow">→</span> {last}
                  </>,
                ]}
              />
            </h2>
            <p data-reveal="up" className="prose-measure mt-6 text-lead text-ink2">
              {t.journey.intro}
            </p>
          </div>
        </div>
      </div>

      <div ref={pin} className="journey-pin relative md:flex md:h-[100svh] md:flex-col md:justify-center">
        {/* phone timeline rail */}
        <span aria-hidden="true" className="absolute bottom-0 left-[calc(1.25rem+3px)] top-0 w-px bg-rule sm:left-[calc(2rem+3px)] md:hidden">
          <span className="journey-progress-v absolute inset-0 origin-top bg-amber shadow-[0_0_12px_rgb(245_158_59/0.8)]" />
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
                <p className="eyebrow num">
                  <span className="text-amber">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-ink3"> / {String(items.length).padStart(2, '0')} · </span>
                  {pick(m.chapter)}
                </p>
                <p
                  className="journey-year num display relative mt-4 origin-bottom-left text-[clamp(4.75rem,3rem+10vw,12.5rem)] leading-[0.82] tracking-[-0.05em]"
                  aria-hidden="true"
                >
                  <span className="year-outline">{m.year}</span>
                  <span className="journey-year-fill text-glow absolute inset-0">{m.year}</span>
                </p>
                <div className="journey-copy mt-6 border-t border-ink/10 pt-5">
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
                <figure className={`mt-6 md:mt-0 md:w-[48%] ${i % 2 ? 'md:rotate-[2deg]' : 'md:-rotate-[2.5deg]'}`}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-paper2 shadow-[0_50px_90px_-40px_rgb(0_0_0/0.9),0_0_0_1px_rgb(255_255_255/0.08)] md:aspect-auto md:h-[calc(100%-2rem)]">
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
            <span className="relative h-px flex-1 bg-ink/15">
              <span className="journey-progress absolute inset-0 origin-left bg-amber shadow-[0_0_14px_rgb(245_158_59/0.9)]" />
            </span>
            <span>{last}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
