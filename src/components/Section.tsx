import type { ReactNode } from 'react';
import Reveal from './Reveal';

/**
 * Editorial section: a numbered label in the left margin ("01 — Research") and the
 * content on the right, separated from the previous section by a hairline.
 */
export default function Section({
  id,
  index,
  label,
  title,
  intro,
  children,
  aside,
  className = '',
}: {
  id: string;
  index?: string;
  label: string;
  title?: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`page ${className}`}>
      <div className="grid-12 border-t border-rule pb-16 pt-6 md:pb-24">
        <div className="col-span-4 mb-6 md:col-span-3 md:mb-0">
          {(() => {
            const content = (
              <>
                {index && (
                  <span className="text-accent" aria-hidden="true">
                    {index} —{' '}
                  </span>
                )}
                {label}
              </>
            );
            // Without a display title, the margin label is the section heading.
            return title ? (
              <p className="label num md:sticky md:top-24">{content}</p>
            ) : (
              <h2 id={`${id}-title`} className="label num font-sans md:sticky md:top-24">
                {content}
              </h2>
            );
          })()}
          {aside && <div className="mt-4 hidden md:block">{aside}</div>}
        </div>
        <Reveal className="col-span-4 md:col-span-9">
          {title && (
            <h2 id={`${id}-title`} className="mb-6 text-h2 font-normal">
              {title}
            </h2>
          )}
          {intro && <div className="prose-measure mb-10 text-lead text-ink2">{intro}</div>}
          {children}
        </Reveal>
      </div>
    </section>
  );
}

/** Large page heading used at the top of every inner page. */
export function PageHeader({ title, intro, children }: { title: string; intro?: ReactNode; children?: ReactNode }) {
  return (
    <header className="page pb-12 pt-14 md:pb-20 md:pt-24">
      <div className="grid-12">
        <div className="col-span-4 md:col-span-9 md:col-start-4">
          <h1 className="text-h1 font-light tracking-[-0.02em]">{title}</h1>
          {intro && <p className="prose-measure mt-6 text-lead text-ink2">{intro}</p>}
          {children}
        </div>
      </div>
    </header>
  );
}
