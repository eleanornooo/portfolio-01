import type { CSSProperties } from 'react';

/**
 * A row of names that scrolls sideways forever (CSS; pauses on hover). Names alternate
 * between outlined and filled display type. The list is drawn twice for a seamless loop;
 * the copy is hidden from assistive tech. Reduced motion: a still, wrapping row.
 */
export default function Marquee({
  items,
  reverse = false,
  duration = 48,
  offset = 0,
}: {
  items: string[];
  reverse?: boolean;
  duration?: number;
  /** Shifts which names are outlined, so two rows don't line up. */
  offset?: number;
}) {
  const row = (copy: boolean) => (
    <ul aria-hidden={copy || undefined} className={`marquee-row flex shrink-0 items-center ${copy ? 'marquee-copy' : ''}`}>
      {items.map((name, i) => (
        <li key={name} className="flex items-center">
          <span
            className={`display whitespace-nowrap px-6 text-[clamp(2.25rem,1rem+4vw,5.5rem)] leading-[1.05] tracking-[-0.04em] md:px-10 ${
              (i + offset) % 2 ? 'outline-text' : 'text-ink'
            }`}
          >
            {name}
          </span>
          <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rotate-45 rounded-[2px] bg-amber shadow-[0_0_14px_rgb(245_158_59/0.8)]" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee" data-reverse={reverse || undefined} style={{ '--dur': `${duration}s` } as CSSProperties}>
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
