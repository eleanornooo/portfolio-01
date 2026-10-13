import type { CSSProperties, ReactNode } from 'react';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/**
 * Dark hero for inner pages: an eyebrow, a giant display title that rises line by line
 * (CSS, first paint), an intro, and optional content (filters, figures) underneath or in
 * an aside. Always dark; it fades into the page below (blend-b) in the light theme.
 * The header floats over it: add the route to DARK_HERO_ROUTES (components/nav.ts).
 */
export default function PageHero({
  eyebrow,
  title,
  intro,
  aside,
  children,
}: {
  eyebrow: ReactNode;
  title: string;
  intro?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section aria-labelledby="page-title" className="tone-dark blend-b relative isolate overflow-hidden pb-20 pt-32 md:pb-28 md:pt-44">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="glow-field opacity-70" />
      </div>
      <div className="page">
        <p className="eyebrow kin-fade" style={delay(80)}>
          {eyebrow}
        </p>
        {/* Sized so the longest single word (e.g. "Publications", "Enseignement") fits the width. */}
        <h1
          id="page-title"
          className="display mt-6 text-[clamp(2.75rem,0.25rem+9.4vw,9.5rem)] leading-[0.86] tracking-[-0.05em]"
        >
          <span className="kin-line">
            <span style={delay(140)}>{title}</span>
          </span>
        </h1>
        {(intro || aside) && (
          <div className="mt-8 grid gap-x-10 gap-y-10 lg:grid-cols-12 lg:items-end">
            {intro && (
              <div className={`kin-fade prose-measure text-lead text-ink2 ${aside ? 'lg:col-span-7' : 'lg:col-span-9'}`} style={delay(380)}>
                {intro}
              </div>
            )}
            {aside && (
              <div className="kin-fade lg:col-span-5" style={delay(520)}>
                {aside}
              </div>
            )}
          </div>
        )}
        {children && (
          <div className="kin-fade mt-12" style={delay(620)}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
