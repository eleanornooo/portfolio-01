import { memo } from 'react';
import { NetworkSim } from './network-sim';

const f = (v: number) => v.toFixed(3);
const R = 1.62; // view box half-size (the citation shell reaches ≈1.56)

/**
 * Pre-rendered stand-in for the animated network: the zellige star it starts from
 * (`formed = false`) or the finished network (`formed`, shown with reduced motion).
 * Same data and layout as the canvas, so the hand-over is seamless.
 */
function NetworkPoster({ formed, className = '' }: { formed: boolean; className?: string }) {
  const sim = new NetworkSim();
  sim.staticPose(formed);
  const v = sim.view;
  const px = (i: number) => f(v[i * 3]);
  const py = (i: number) => f(-v[i * 3 + 1]);
  const scale = 1 / 230; // node sizes are CSS px at a ≈230 px network radius

  return (
    <svg
      viewBox={`${-R} ${-R} ${2 * R} ${2 * R}`}
      className={className}
      aria-hidden="true"
      focusable="false"
      overflow="visible"
    >
      {!formed && (
        <polygon
          points={sim.star.map(([x, y]) => `${f(x)},${f(-y)}`).join(' ')}
          fill="none"
          className="stroke-accent/50"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      )}
      {formed && (
        <g className="stroke-ink/20" strokeWidth={0.8} vectorEffect="non-scaling-stroke">
          {sim.edges.map(([a, b]) => (
            <line key={`${a}-${b}`} x1={px(a)} y1={py(a)} x2={px(b)} y2={py(b)} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      )}
      {sim.particles.map((p, i) => {
        const tone =
          p.kind === 'core'
            ? 'fill-vivid'
            : p.kind === 'theme' || p.kind === 'coauthor'
              ? 'fill-accent'
              : p.kind === 'talk' || p.kind === 'dust'
                ? 'fill-ink3'
                : 'fill-ink';
        return (
          <circle
            key={i}
            cx={px(i)}
            cy={py(i)}
            r={f(p.size * 0.5 * scale * (formed ? 1 : 0.9))}
            className={tone}
            opacity={p.kind === 'dust' ? 0.42 : p.kind === 'talk' ? 0.8 : 1}
          />
        );
      })}
    </svg>
  );
}

export default memo(NetworkPoster);
