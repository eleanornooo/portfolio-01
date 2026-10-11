import { useId, useState, type CSSProperties } from 'react';
import type { Talk } from '../../content/types';
import { useLang } from '../../i18n/useLang';
import { formatDate } from '../../lib/dates';
import { photoSrc, photoSrcSet } from '../../lib/photos';
import type { TalkCity } from '../../lib/talk-cities';

/** "2026-11-25" → "11.2026"; "2025" → "2025". */
const short = (d: string) => {
  const [y, m] = d.split('-');
  return m ? `${m}.${y}` : y;
};

/**
 * The Talks page opening: a tour poster. Every city is stacked in huge display type with its
 * dates beside it (bigger = more talks). Hovering or focusing a city fades the others and
 * shows, on the right, its photo (when we have one taken there) and the talks given there.
 * Clicking pins a city; on phones the talks open under the city instead.
 */
export default function TourPoster({ cities }: { cities: TalkCity[] }) {
  const { t, lang, pick } = useLang();
  const uid = useId();
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const activeId = hover ?? pinned;
  const active = cities.find((c) => c.id === activeId) ?? null;
  const max = Math.max(...cities.map((c) => c.talks.length));
  const label = (c: TalkCity) => c.name ?? t.talks.online;

  const talkLine = (x: Talk) => (
    <li key={x.id} className="grid grid-cols-[4.5rem_1fr] gap-x-3 py-2.5">
      <span className="num text-xs text-ink3">{x.dateLabel ? short(x.date) : formatDate(x.date, lang)}</span>
      <span>
        <span className="eyebrow mr-2 text-[0.625rem] text-amber">{t.talks.types[x.type]}</span>
        <span className="font-serif text-[1.0625rem] leading-snug text-ink" lang={x.lang}>
          {x.title ?? x.event}
        </span>
      </span>
    </li>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
      <ol className="poster-list" data-active={activeId ? '' : undefined} onMouseLeave={() => setHover(null)}>
        {cities.map((c, i) => {
          const on = c.id === activeId;
          const size = 0.55 + (0.45 * (c.talks.length - 1)) / Math.max(1, max - 1);
          return (
            <li key={c.id} className={`poster-city border-b border-ink/10 ${on ? 'is-active' : ''}`} style={{ '--i': i } as CSSProperties}>
              <button
                type="button"
                aria-expanded={pinned === c.id}
                aria-controls={`${uid}-panel`}
                onMouseEnter={() => setHover(c.id)}
                onFocus={() => setHover(c.id)}
                onBlur={() => setHover(null)}
                onClick={() => setPinned((p) => (p === c.id ? null : c.id))}
                className="flex w-full items-end justify-between gap-6 py-1.5 text-left"
              >
                <span
                  className={`display block uppercase leading-[0.84] tracking-[-0.045em] transition-colors duration-300 ${on ? 'text-glow' : ''}`}
                  // More talks = bigger, but never wider than the column (container query units).
                  style={{
                    fontSize: `min(calc((2.4rem + 7.4vw) * ${size.toFixed(3)}), calc((100cqw - 5rem) / ${(label(c).length * 0.7).toFixed(2)}))`,
                  }}
                >
                  {label(c)}
                </span>
                <span className="num shrink-0 pb-2 text-right text-[0.6875rem] leading-relaxed tracking-[0.08em] text-ink3">
                  {c.talks.slice(0, 3).map((x) => (
                    <span key={x.id} className="block">
                      {short(x.date)}
                    </span>
                  ))}
                  {c.talks.length > 3 && <span className="block text-amber">+{c.talks.length - 3}</span>}
                </span>
              </button>
              {/* phones: the talks open under the city */}
              {pinned === c.id && (
                <ul className="list-in pb-4 lg:hidden">{c.talks.map(talkLine)}</ul>
              )}
            </li>
          );
        })}
      </ol>

      {/* desktop: what happened in the city under the cursor */}
      <div className="hidden lg:block">
        <div id={`${uid}-panel`} aria-live="polite" className="sticky top-28">
          {active ? (
            <div key={active.id} className="kin-fade">
              {active.photo && (
                <figure className="mb-6 -rotate-2">
                  <img
                    src={photoSrc(active.photo)}
                    srcSet={photoSrcSet(active.photo)}
                    sizes="24rem"
                    width={active.photo.w}
                    height={active.photo.h}
                    alt={pick(active.photo.alt)}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full rounded-2xl object-cover shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9),0_0_0_1px_rgb(255_255_255/0.08)]"
                  />
                  <figcaption className="mt-2 rotate-2 text-xs text-ink3">{pick(active.photo.caption)}</figcaption>
                </figure>
              )}
              <p className="eyebrow">
                {label(active)}
                {active.country && ` · ${active.country}`} · {t.talks.dates(active.talks.length)}
              </p>
              <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">{active.talks.map(talkLine)}</ul>
            </div>
          ) : (
            <p className="max-w-[18rem] pt-4 text-sm text-ink3">{t.talks.cityHint}</p>
          )}
        </div>
      </div>
    </div>
  );
}
