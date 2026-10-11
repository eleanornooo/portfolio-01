import { useId, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import type { Position } from '../../content/types';
import { useLang } from '../../i18n/useLang';
import { useGsap } from '../../lib/gsap';
import Logo from './Logo';

/** `inert` is not in React 18's types; passed through as a plain attribute. */
const inert = (on: boolean) => (on ? ({ inert: '' } as Record<string, string>) : {});

/**
 * Experience as a vertical timeline. A progress line fills as you scroll and each role's
 * dot lights up when it is reached. Every role is a card that expands on click (an
 * accordion: heading > button, aria-expanded/controls) to show its details.
 */
export default function ExperienceTimeline({ positions, now }: { positions: Position[]; now: number }) {
  const { t } = useLang();
  const root = useRef<HTMLOListElement>(null);
  const uid = useId();
  const [open, setOpen] = useState<Set<string>>(() => new Set([positions[0]?.id]));
  const year = new Date(now).getUTCFullYear();

  useGsap(
    ({ gsap, ScrollTrigger }) => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const el = root.current!;
        el.classList.add('xp-armed');
        gsap.fromTo(
          '.xp-progress',
          { scaleY: 0 },
          { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 65%', end: 'bottom 65%', scrub: true } },
        );
        gsap.utils.toArray<HTMLElement>('.xp-item').forEach((li) =>
          ScrollTrigger.create({ trigger: li, start: 'top 65%', toggleClass: { targets: li, className: 'is-on' } }),
        );
        return () => el.classList.remove('xp-armed');
      });
    },
    root,
  );

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <ol ref={root} className="xp relative">
      {/* rail + scroll progress */}
      <span aria-hidden="true" className="absolute bottom-3 left-[11px] top-3 w-px bg-ink/10 md:left-[calc(8.5rem+11px)]">
        <span className="xp-progress absolute inset-0 origin-top bg-gradient-to-b from-vivid to-amber shadow-[0_0_14px_rgb(245_158_59/0.7)]" />
      </span>

      {positions.map((p) => {
        const on = open.has(p.id);
        const period = p.periodLabel ?? `${p.start}–${p.end ?? t.common.present}`;
        const span = Number(p.end ?? year) - Number(p.start);
        const panel = `${uid}-${p.id}`;
        return (
          <li key={p.id} className="xp-item relative grid gap-x-10 pb-4 md:grid-cols-[8.5rem_1fr]">
            <p className="num hidden pt-6 text-right text-sm text-ink3 md:block">{period}</p>
            <span
              aria-hidden="true"
              className="xp-dot absolute left-[5px] top-[1.6rem] h-[13px] w-[13px] rounded-full border border-amber/70 bg-paper md:left-[calc(8.5rem+5px)]"
            />
            <div className={`card-dark spot group ml-9 md:ml-0 ${on ? 'border-amber/30' : ''}`}>
              <h3 className="relative z-10">
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={panel}
                  onClick={() => toggle(p.id)}
                  className="flex w-full items-start gap-4 rounded-3xl p-5 text-left md:p-6"
                >
                  <Logo name={p.logo} />
                  <span className="min-w-0 flex-1">
                    <span className="num mb-1 block text-sm text-ink3 md:hidden">{period}</span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-serif text-[1.25rem] font-normal leading-snug md:text-[1.375rem]">{p.role}</span>
                      {!p.end && (
                        <span className="badge-glow rounded-full bg-amber px-2 py-0.5 font-sans text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[#160b05]">
                          {t.about.current}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block font-sans text-[0.9375rem] text-ink2">{p.org}</span>
                  </span>
                  <ChevronDown
                    size={20}
                    aria-hidden="true"
                    className={`mt-1 shrink-0 text-ink3 transition-transform duration-500 ${on ? 'rotate-180 text-amber' : ''}`}
                  />
                </button>
              </h3>
              <div
                id={panel}
                {...inert(!on)}
                className={`relative z-10 grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                  on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="mx-5 mb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-t border-ink/10 pt-4 text-sm md:mx-6 md:mb-6 md:ml-[5.25rem]">
                  <dl className="flex flex-wrap gap-x-10 gap-y-3">
                    {p.place && (
                      <div>
                        <dt className="eyebrow text-[0.625rem]">{t.about.place}</dt>
                        <dd className="mt-1 text-ink2">{p.place}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="eyebrow text-[0.625rem]">{t.research.period}</dt>
                      <dd className="num mt-1 text-ink2">
                        {period} · {t.about.duration(span)}
                      </dd>
                    </div>
                  </dl>
                  {p.note && <p className="text-ink2">{p.note}</p>}
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">
                      {t.common.readMore}
                      <ArrowUpRight size={14} aria-hidden="true" />
                      <span className="sr-only"> {t.common.opensNewTab}</span>
                    </a>
                  )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
