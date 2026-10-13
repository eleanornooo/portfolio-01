import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import type { Project } from '../../content/types';
import { useLang } from '../../i18n/useLang';
import { prefersReducedMotion } from '../../lib/motion';
import { outputsOf } from '../../lib/related';
import { scrollToElement } from '../../lib/smooth';
import { Ext, LinkRow } from '../Ext';
import { StatusTag } from '../Tags';

/** "EUR 94,066" → { pre: "EUR ", value: 94066, post: "", decimals: 0, grouped: true }. */
function parseAmount(s: string) {
  const m = s.match(/^(\D*?)(\d[\d.,]*)(.*)$/);
  if (!m) return null;
  const raw = m[2];
  const grouped = /,\d{3}/.test(raw);
  const clean = grouped ? raw.replace(/,/g, '') : raw.replace(',', '.');
  const decimals = clean.includes('.') ? clean.split('.')[1].length : 0;
  return { pre: m[1], value: Number(clean), post: m[3], decimals, grouped };
}

/** The budget, counting up from zero each time the project becomes active. */
function Amount({ text, run }: { text: string; run: number }) {
  const a = parseAmount(text);
  const [v, setV] = useState(a?.value ?? 0);
  useEffect(() => {
    if (!a || prefersReducedMotion()) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 1400);
      setV(a.value * (1 - (1 - k) ** 4));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, run]);
  if (!a) return <>{text}</>;
  const shown = a.grouped
    ? Math.round(v).toLocaleString('en-US')
    : v.toFixed(a.decimals);
  return (
    <span role="img" aria-label={text}>
      <span aria-hidden="true">
        {a.pre}
        {shown}
        {a.post}
      </span>
    </span>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Projects as a pinned split screen (desktop): the left half stays put and shows the
 * active project — giant name, status, budget counting up — while the right half scrolls
 * through each case study (context → role → outputs → partners). Every case has an anchor
 * `#case-<id>` (the globe and the research map link to it). Phones: stacked sections.
 */
export default function ProjectCases({ items, groupLabel }: { items: Project[]; groupLabel: (p: Project) => string }) {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = refs.current.indexOf(e.target as HTMLElement);
          if (i >= 0) {
            setActive(i);
            setRun((r) => r + 1);
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [items]);

  const cur = items[Math.min(active, items.length - 1)];
  if (!cur) return null;

  return (
    <div className="relative lg:grid lg:grid-cols-2 lg:gap-16">
      {/* ------------------------------------------------ pinned left half */}
      <div aria-hidden="true" className="hidden lg:block">
        <div className="sticky top-0 flex h-[100svh] items-center">
          {/* side progress */}
          <ol className="mr-10 flex flex-col gap-2.5">
            {items.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => refs.current[i] && scrollToElement(refs.current[i]!)}
                  className={`num flex items-center gap-2 text-xs transition-colors ${i === active ? 'text-amber' : 'text-ink3 hover:text-ink'}`}
                >
                  <span
                    className={`h-px transition-all duration-500 ${i === active ? 'w-8 bg-amber shadow-[0_0_8px_rgb(245_158_59/0.9)]' : 'w-3 bg-ink/30'}`}
                  />
                  {pad(i + 1)}
                </button>
              </li>
            ))}
          </ol>
          <div key={cur.id} className="min-w-0 flex-1">
            <p className="eyebrow num kin-fade">
              <span className="text-amber">{pad(active + 1)}</span> / {pad(items.length)} · {groupLabel(cur)}
            </p>
            <p className="kin-line mt-5">
              <span className="display block text-[clamp(3rem,1rem+4.6vw,6.5rem)] leading-[0.88] tracking-[-0.05em]">
                {cur.short ?? cur.title}
              </span>
            </p>
            <div className="kin-fade mt-7 flex flex-wrap items-center gap-3 text-sm text-ink3" style={{ '--d': '120ms' } as CSSProperties}>
              <StatusTag status={cur.status} />
              <span className="num">{cur.period}</span>
            </div>
            {cur.budget && (
              <p className="kin-fade mt-10" style={{ '--d': '200ms' } as CSSProperties}>
                <span className="eyebrow block">{t.research.budget}</span>
                <span className="num display text-glow mt-2 block text-[clamp(2.5rem,1rem+3.2vw,4.5rem)] leading-none tracking-[-0.04em]">
                  <Amount text={cur.budget} run={run} />
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ scrolling case studies */}
      <div>
        {items.map((p, i) => {
          const out = outputsOf(p);
          const partners = [p.coordinator, p.funder].filter(Boolean) as string[];
          return (
            <article
              key={p.id}
              id={`case-${p.id}`}
              ref={(el) => (refs.current[i] = el)}
              aria-labelledby={`case-${p.id}-title`}
              className="scroll-mt-24 border-t border-ink/10 py-16 lg:flex lg:min-h-[88svh] lg:flex-col lg:justify-center lg:border-t-0 lg:py-24"
            >
              <p className="eyebrow num">
                <span className="text-amber">{pad(i + 1)}</span> · {t.research.caseStudy} · {groupLabel(p)}
              </p>
              <h3 id={`case-${p.id}-title`} className="mt-4 font-display text-[2.25rem] font-bold leading-[0.95] tracking-[-0.04em] lg:font-serif lg:text-[1.625rem] lg:font-normal lg:leading-snug lg:tracking-[-0.01em]">
                {p.title}
              </h3>
              {/* Phones: what the pinned half shows on desktop. */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink3 lg:hidden">
                <StatusTag status={p.status} />
                <span className="num">{p.period}</span>
                {p.budget && <span className="num display text-glow text-[1.75rem] tracking-[-0.03em]">{p.budget}</span>}
              </div>

              <ol className="mt-10 space-y-8">
                <li className="grid gap-2 sm:grid-cols-[8rem_1fr]">
                  <p className="eyebrow num pt-1">01 · {t.research.context}</p>
                  <p className="prose-measure text-[1.0625rem] text-ink">{p.summary}</p>
                </li>
                <li className="grid gap-2 sm:grid-cols-[8rem_1fr]">
                  <p className="eyebrow num pt-1">02 · {t.research.role}</p>
                  <p className="font-serif text-[1.375rem] italic leading-snug">{p.role}</p>
                </li>
                {(out.pubs.length > 0 || out.talks.length > 0 || p.url || p.links) && (
                  <li className="grid gap-2 sm:grid-cols-[8rem_1fr]">
                    <p className="eyebrow num pt-1">03 · {t.research.outputs}</p>
                    <div className="space-y-3">
                      {out.pubs.length > 0 && (
                        <ul className="space-y-2">
                          {out.pubs.map((x) => (
                            <li key={x.id} className="flex gap-3 text-[0.9375rem]">
                              <span className="num shrink-0 text-ink3">{x.year === 'in press' ? t.publications.inPress : x.year}</span>
                              <Link to="/publications" className="link-quiet">
                                {x.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                      {out.talks.length > 0 && (
                        <p className="text-sm text-ink2">
                          {t.research.talks}:{' '}
                          {out.talks.map((x, j) => (
                            <span key={x.id}>
                              {j > 0 && ' · '}
                              <Link to="/talks" className="link-quiet">
                                {x.title ?? x.event}
                              </Link>
                            </span>
                          ))}
                        </p>
                      )}
                      {(p.url || p.links) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                          {p.url && <Ext href={p.url}>{t.research.website}</Ext>}
                          {p.links && <LinkRow links={p.links} />}
                        </div>
                      )}
                    </div>
                  </li>
                )}
                {partners.length > 0 && (
                  <li className="grid gap-2 sm:grid-cols-[8rem_1fr]">
                    <p className="eyebrow num pt-1">04 · {t.research.partners}</p>
                    <dl className="grid gap-x-6 gap-y-1 text-[0.9375rem] sm:grid-cols-[auto_1fr]">
                      {p.coordinator && (
                        <>
                          <dt className="text-ink3">{t.research.coordinator}</dt>
                          <dd>{p.coordinator}</dd>
                        </>
                      )}
                      {p.funder && (
                        <>
                          <dt className="text-ink3">{t.research.funder}</dt>
                          <dd>{p.funder}</dd>
                        </>
                      )}
                    </dl>
                  </li>
                )}
              </ol>
            </article>
          );
        })}
      </div>
    </div>
  );
}
