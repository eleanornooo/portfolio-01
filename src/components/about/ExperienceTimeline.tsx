import { useId, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import type { Position } from '../../content/types';
import { useLang } from '../../i18n/useLang';
import { useGsap } from '../../lib/gsap';
import Logo from './Logo';

/** `inert` is not in React 18's types; passed through as a plain attribute. */
const inert = (on: boolean) => (on ? ({ inert: '' } as Record<string, string>) : {});

/**
 * Experience as numbered chapters: light rows (chapter number, period, role, organisation)
 * separated by hairlines. A chapter number lights up when the scroll reaches its row. Each
 * row expands on click (an accordion: heading > button, aria-expanded/controls) and only the
 * open row takes a card look.
 */
export default function ExperienceTimeline({ positions }: { positions: Position[] }) {
  const { t } = useLang();
  const root = useRef<HTMLOListElement>(null);
  const uid = useId();
  const [open, setOpen] = useState<Set<string>>(() => new Set([positions[0]?.id]));

  useGsap(
    ({ gsap, ScrollTrigger }) => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const el = root.current!;
        el.classList.add('xp-armed');
        gsap.utils.toArray<HTMLElement>('.xp-item').forEach((li) =>
          ScrollTrigger.create({ trigger: li, start: 'top 70%', toggleClass: { targets: li, className: 'is-on' } }),
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
    <ol ref={root} className="xp border-t border-ink/10">
      {positions.map((p, i) => {
        const on = open.has(p.id);
        const period = p.periodLabel ?? `${p.start}–${p.end ?? t.common.present}`;
        const panel = `${uid}-${p.id}`;
        return (
          <li key={p.id} className="xp-item border-b border-ink/10 py-2">
            <div
              className={`rounded-3xl border transition-[background-color,border-color,box-shadow] duration-500 ${
                on
                  ? 'border-amber/25 bg-ink/[0.045] shadow-[0_30px_70px_-40px_rgb(0_0_0/0.7)]'
                  : 'border-transparent hover:bg-ink/[0.025]'
              }`}
            >
              <h3>
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={panel}
                  onClick={() => toggle(p.id)}
                  className="grid w-full grid-cols-[3.25rem_1fr_auto] items-center gap-x-4 rounded-3xl px-3 py-4 text-left md:grid-cols-[5.5rem_8.5rem_1fr_auto] md:gap-x-6 md:px-5"
                >
                  <span aria-hidden="true" className="xp-num num display text-[2.25rem] leading-none tracking-[-0.05em] md:text-[3.25rem]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="num hidden text-sm text-ink3 md:block">{period}</span>
                  <span className="flex min-w-0 items-center gap-4">
                    <Logo name={p.logo} />
                    <span className="min-w-0">
                      <span className="num mb-0.5 block text-sm text-ink3 md:hidden">{period}</span>
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-serif text-[1.1875rem] font-normal leading-snug md:text-[1.375rem]">{p.role}</span>
                        {!p.end && (
                          <span className="badge-glow rounded-full bg-amber px-2 py-0.5 font-sans text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[#160b05]">
                            {t.about.current}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block font-sans text-[0.9375rem] text-ink2">{p.org}</span>
                    </span>
                  </span>
                  <ChevronDown
                    size={20}
                    aria-hidden="true"
                    className={`shrink-0 text-ink3 transition-transform duration-500 ${on ? 'rotate-180 text-amber' : ''}`}
                  />
                </button>
              </h3>
              <div
                id={panel}
                {...inert(!on)}
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                  on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="mx-3 mb-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-t border-ink/10 pt-4 text-sm md:mb-6 md:ml-[calc(5.5rem+8.5rem+3rem+1.25rem)] md:mr-5">
                    <dl className="flex flex-wrap gap-x-10 gap-y-3">
                      {p.place && (
                        <div>
                          <dt className="eyebrow text-[0.625rem]">{t.about.place}</dt>
                          <dd className="mt-1 text-ink2">{p.place}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="eyebrow text-[0.625rem]">{t.research.period}</dt>
                        <dd className="num mt-1 text-ink2">{period}</dd>
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
