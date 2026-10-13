import type { ReactNode } from 'react';
import MaskText from './MaskText';

/**
 * Section heading in the premium style: a small numbered label in the margin and a giant
 * display title whose lines unmask on scroll (data-reveal, see lib/reveal.ts).
 */
export default function SectionHeading({
  id,
  index,
  label,
  lines,
  intro,
  aside,
  className = 'mb-12 md:mb-16',
}: {
  id: string;
  index?: string;
  label: string;
  lines: ReactNode[];
  intro?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid-12 gap-y-6 ${className}`}>
      <p className="eyebrow num col-span-4 md:col-span-3 md:pt-4">
        {index && (
          <span className="text-amber" aria-hidden="true">
            {index} ·{' '}
          </span>
        )}
        {label}
      </p>
      <div className="col-span-4 md:col-span-9">
        <h2 id={`${id}-title`} data-reveal="mask" className="display text-big">
          <MaskText lines={lines} />
        </h2>
        {intro && (
          <p data-reveal="up" className="prose-measure mt-6 text-lead text-ink2">
            {intro}
          </p>
        )}
        {aside}
      </div>
    </div>
  );
}
