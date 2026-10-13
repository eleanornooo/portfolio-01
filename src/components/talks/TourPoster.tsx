import { useState, type CSSProperties } from 'react';
import { useLang } from '../../i18n/useLang';
import { photoSrc, photoSrcSet } from '../../lib/photos';
import { talkDate, type TalkCity } from '../../lib/talk-cities';

/**
 * The Talks page opening: a tour poster, and the navigator for the list below. Every city
 * is stacked in huge display type with its dates beside it (bigger = more talks). Hovering
 * or focusing a city fades the others and shows a small preview (a photo when we have one
 * taken there, the number of talks, the latest title). Selecting a city filters the list
 * below to it (the page scrolls there); selecting it again clears the filter.
 */
export default function TourPoster({
  cities,
  selected,
  onSelect,
}: {
  cities: TalkCity[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const { t, lang, pick } = useLang();
  const [hover, setHover] = useState<string | null>(null);
  const activeId = hover ?? selected;
  const max = Math.max(...cities.map((c) => c.talks.length));
  const label = (c: TalkCity) => c.name ?? t.talks.online;

  return (
    <ol className="poster-list [--datecol:7.5rem] md:[--datecol:10rem]" data-active={activeId ? '' : undefined} onMouseLeave={() => setHover(null)}>
      {cities.map((c, i) => {
        const on = c.id === activeId;
        const size = 0.55 + (0.45 * (c.talks.length - 1)) / Math.max(1, max - 1);
        const latest = c.talks[0];
        return (
          <li key={c.id} className={`poster-city relative border-b border-ink/10 ${on ? 'is-active' : ''}`} style={{ '--i': i } as CSSProperties}>
            <button
              type="button"
              aria-pressed={selected === c.id}
              aria-label={`${label(c)} — ${t.talks.count(c.talks.length)}. ${t.talks.filterCity(label(c))}`}
              onMouseEnter={() => setHover(c.id)}
              onFocus={() => setHover(c.id)}
              onBlur={() => setHover(null)}
              onClick={() => onSelect(c.id)}
              className="flex w-full items-end justify-between gap-6 py-1.5 text-left"
            >
              <span
                className={`display block uppercase leading-[0.84] tracking-[-0.045em] transition-colors duration-300 ${on ? 'text-glow' : ''}`}
                // More talks = bigger, but never wider than the column (container query units).
                style={{
                  fontSize: `min(calc((2.4rem + 7.4vw) * ${size.toFixed(3)}), calc((100cqw - var(--datecol)) / ${(label(c).length * 0.7).toFixed(2)}))`,
                }}
              >
                {label(c)}
              </span>
              {/* Phones: the latest date and "+n"; larger screens: up to three dates. */}
              <span className="num w-[calc(var(--datecol)-1.5rem)] shrink-0 pb-2 text-right text-[0.6875rem] leading-relaxed text-ink3">
                {c.talks.slice(0, 3).map((x, k) => (
                  <span key={x.id} className={k ? 'hidden md:block' : 'block'}>
                    {talkDate(x, lang)}
                  </span>
                ))}
                {c.talks.length > 1 && (
                  <span className="block text-amber md:hidden">+{c.talks.length - 1}</span>
                )}
                {c.talks.length > 3 && <span className="hidden text-amber md:block">+{c.talks.length - 3}</span>}
              </span>
            </button>

            {/* Hover preview (pointer devices): photo, number of talks, the latest title. */}
            {hover === c.id && (
              <div
                aria-hidden="true"
                className="kin-fade pointer-events-none absolute right-[11rem] top-1/2 z-10 hidden w-[17rem] -translate-y-1/2 overflow-hidden rounded-2xl border border-ink/10 bg-paper/90 shadow-[0_30px_70px_-30px_rgb(0_0_0/0.9)] backdrop-blur-md lg:block"
              >
                {c.photo && (
                  <img
                    src={photoSrc(c.photo)}
                    srcSet={photoSrcSet(c.photo)}
                    sizes="17rem"
                    width={c.photo.w}
                    height={c.photo.h}
                    alt={pick(c.photo.alt)}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/9] w-full object-cover"
                  />
                )}
                <div className="px-4 py-3">
                  <p className="eyebrow text-[0.625rem] text-amber">
                    {t.talks.count(c.talks.length)}
                    {c.country && ` · ${c.country}`}
                  </p>
                  <p className="mt-1 truncate font-serif text-[1rem] text-ink" lang={latest.lang}>
                    {latest.title ?? latest.event}
                  </p>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
