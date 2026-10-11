import type { ReactNode } from 'react';

/**
 * Heading lines that slide up from behind their own edge when the parent has
 * data-reveal="mask" (see lib/reveal.ts). Each entry of `lines` is one masked line.
 */
export default function MaskText({ lines }: { lines: ReactNode[] }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className="rv-line">
          <span>{l}</span>
        </span>
      ))}
    </>
  );
}
