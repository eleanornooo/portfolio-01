// A single, quiet identity motif: the eight-pointed star (khatam) of Moroccan zellige,
// drawn as lines only. Used as a section divider and as the footer band — nowhere else.

function starPath(cx: number, cy: number, R: number): string {
  const r = R * 0.7654; // inner radius of two overlapping squares
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

function octagon(cx: number, cy: number, R: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i + Math.PI / 8;
    pts.push(`${(cx + R * Math.cos(a)).toFixed(2)},${(cy + R * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

/** Hairline — rosette — hairline. */
export function ZelligeRule({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 text-rule ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-current" />
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1">
        <path d={starPath(14, 14, 13)} />
        <path d={octagon(14, 14, 5.2)} />
      </svg>
      <span className="h-px flex-1 bg-current" />
    </div>
  );
}

/** Repeating lattice of stars joined by lines; very low contrast. */
export function ZelligeBand({ className = '' }: { className?: string }) {
  const T = 44; // tile size
  const c = T / 2;
  const R = 11;
  return (
    <svg className={`block h-11 w-full text-rule ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="zellige-tile" width={T} height={T} patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d={starPath(c, c, R)} />
            <path d={octagon(c, c, 4.4)} />
            {/* links between neighbouring stars */}
            <path d={`M${c} 0V${c - R}M${c} ${c + R}V${T}M0 ${c}H${c - R}M${c + R} ${c}H${T}`} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#zellige-tile)" />
    </svg>
  );
}
