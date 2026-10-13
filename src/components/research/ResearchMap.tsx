import { useEffect, useMemo, useRef, useState } from 'react';
import type { Simulation } from 'd3-force';
import { useLang } from '../../i18n/useLang';
import { hasFinePointer, prefersReducedMotion } from '../../lib/motion';
import { MAP_H, MAP_W, buildResearchMap, clearTitle, configure, neighbours, projectLines, twoLines, type MapNode } from '../../lib/research-map';

/** A publication title on hover, in full, wrapped to lines of about 46 characters. */
function wrap(s: string, n = 46): string[] {
  const out: string[] = [];
  let line = '';
  for (const w of s.split(' ')) {
    if (line && (line + ' ' + w).length > n) {
      out.push(line);
      line = w;
    } else line = line ? `${line} ${w}` : w;
  }
  if (line) out.push(line);
  return out;
}

/**
 * The knowledge graph that opens the Research page (desktop). Themes are large glowing
 * nodes, projects medium, publications small; lines are real links. Nodes drift gently and
 * shy away from the cursor (a live d3-force simulation, paused off-screen). Hovering a node
 * lights its connections and dims the rest; clicking a theme filters the page below.
 * Purely visual for assistive tech: the same filter is offered by the theme list below.
 */
export default function ResearchMap({
  active,
  onTheme,
  onProject,
}: {
  active: number | null;
  onTheme: (i: number) => void;
  onProject: (id: string) => void;
}) {
  const { lang, pick, t } = useLang();
  const { nodes, edges } = useMemo(() => buildResearchMap(), []);
  const svg = useRef<SVGSVGElement>(null);
  const groups = useRef<(SVGGElement | null)[]>([]);
  const lines = useRef<(SVGLineElement | null)[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  // Latest positions: written by the live simulation, read by every render, so a re-render
  // (hover, filter) never snaps the nodes back to their resting layout.
  const pos = useRef(nodes.map((n) => ({ x: n.x, y: n.y })));
  const P = (i: number) => pos.current[i];

  const text = (n: MapNode) => (typeof n.label === 'string' ? n.label : n.label[lang]);
  const lit = useMemo(() => (hover === null ? null : neighbours(edges, hover)), [hover, edges]);
  const inActive = (n: MapNode) => active === null || n.themes.includes(active);

  // Live drift and cursor repulsion (desktop, motion allowed).
  useEffect(() => {
    const el = svg.current;
    if (!el || prefersReducedMotion() || !hasFinePointer()) return;
    const live = nodes.map((n) => ({ ...n }));
    const sim: Simulation<MapNode, undefined> = configure(live, edges, MAP_W * 0.62);
    const phase = live.map((_, i) => i * 1.7);
    const ptr = { x: -9999, y: -9999 };
    let time = 0;
    sim
      .force('drift', () => {
        time += 0.016;
        live.forEach((d, i) => {
          d.vx = (d.vx ?? 0) + Math.sin(time * 0.6 + phase[i]) * 0.035;
          d.vy = (d.vy ?? 0) + Math.cos(time * 0.5 + phase[i]) * 0.035;
        });
      })
      .force('cursor', (alpha) => {
        for (const d of live) {
          const dx = d.x - ptr.x;
          const dy = d.y - ptr.y;
          const dist = Math.hypot(dx, dy);
          const reach = 130 + d.r;
          if (dist < reach && dist > 0.01) {
            const k = ((reach - dist) / reach) ** 2 * (d.kind === 'theme' ? 1.2 : 3.5) * Math.max(alpha, 0.05) * 10;
            d.vx = (d.vx ?? 0) + (dx / dist) * k;
            d.vy = (d.vy ?? 0) + (dy / dist) * k;
          }
        }
      })
      .velocityDecay(0.55)
      .alpha(0.05)
      .alphaTarget(0.02)
      .on('tick', () => {
        live.forEach((d, i) => {
          d.x = Math.max(d.r + 6, Math.min(MAP_W - d.r - 6, d.x));
          d.y = Math.max(d.r + 6, Math.min(MAP_H - d.r - 6, d.y));
          clearTitle(d);
          pos.current[i].x = d.x;
          pos.current[i].y = d.y;
          groups.current[i]?.setAttribute('transform', `translate(${d.x.toFixed(1)} ${d.y.toFixed(1)})`);
        });
        edges.forEach((e, i) => {
          const l = lines.current[i];
          if (!l) return;
          const a = live[e.source];
          const b = live[e.target];
          l.setAttribute('x1', a.x.toFixed(1));
          l.setAttribute('y1', a.y.toFixed(1));
          l.setAttribute('x2', b.x.toFixed(1));
          l.setAttribute('y2', b.y.toFixed(1));
        });
      });

    const toSvg = (e: PointerEvent) => {
      const m = el.getScreenCTM();
      if (!m) return;
      const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      ptr.x = p.x;
      ptr.y = p.y;
    };
    const leave = () => {
      ptr.x = ptr.y = -9999;
    };
    el.addEventListener('pointermove', toSvg);
    el.addEventListener('pointerleave', leave);
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? sim.restart() : sim.stop()));
    io.observe(el);
    const vis = () => (document.visibilityState === 'visible' ? sim.restart() : sim.stop());
    document.addEventListener('visibilitychange', vis);
    return () => {
      sim.stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', vis);
      el.removeEventListener('pointermove', toSvg);
      el.removeEventListener('pointerleave', leave);
    };
  }, [nodes, edges]);

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid meet"
      className="rmap h-full w-full"
      aria-hidden="true"
      focusable="false"
      data-hover={hover !== null || undefined}
    >
      <defs>
        <radialGradient id="rmap-theme" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#f7c27a" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#f59e3b" stopOpacity="0.55" />
          <stop offset="1" stopColor="#e2572b" stopOpacity="0.18" />
        </radialGradient>
        <radialGradient id="rmap-glow">
          <stop offset="0" stopColor="#e2572b" stopOpacity="0.45" />
          <stop offset="1" stopColor="#e2572b" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="rmap-edges">
        {edges.map((e, i) => {
          const a = nodes[e.source];
          const b = nodes[e.target];
          const pa = P(e.source);
          const pb = P(e.target);
          const on = lit ? lit.has(e.source) && lit.has(e.target) : inActive(a) && inActive(b);
          return (
            <line
              key={i}
              ref={(el) => (lines.current[i] = el)}
              x1={pa.x.toFixed(1)}
              y1={pa.y.toFixed(1)}
              x2={pb.x.toFixed(1)}
              y2={pb.y.toFixed(1)}
              className={on ? (lit ? 'is-lit' : '') : 'is-dim'}
            />
          );
        })}
      </g>

      {nodes.map((n, i) => {
        const dim = lit ? !lit.has(i) : !inActive(n);
        const label = text(n);
        const common = {
          ref: (el: SVGGElement | null) => (groups.current[i] = el),
          transform: `translate(${P(i).x.toFixed(1)} ${P(i).y.toFixed(1)})`,
          onPointerEnter: () => setHover(i),
          onPointerLeave: () => setHover(null),
        };
        if (n.kind === 'theme') {
          const themeNo = n.themes[0];
          const [l1, l2] = twoLines(pick(n.label as { en: string; fr: string }));
          return (
            <g
              key={n.id}
              {...common}
              className={`rmap-node rmap-theme ${dim ? 'is-dim' : ''} ${active === themeNo ? 'is-active' : ''}`}
              onClick={() => onTheme(themeNo)}
            >
              <circle r={n.r * 2.3} fill="url(#rmap-glow)" className="rmap-halo" />
              <circle r={n.r} fill="url(#rmap-theme)" className="rmap-core" />
              <circle r={n.r} className="rmap-ring" />
              <text y={n.r + 22} className="rmap-label-theme">
                <tspan x="0">{l1}</tspan>
                <tspan x="0" dy="1.15em">
                  {l2}
                </tspan>
              </text>
            </g>
          );
        }
        return (
          <g
            key={n.id}
            {...common}
            className={`rmap-node rmap-${n.kind} ${dim ? 'is-dim' : ''} ${hover === i ? 'is-hover' : ''}`}
            onClick={() => (n.kind === 'project' ? onProject(n.id) : undefined)}
          >
            <circle r={n.r} />
            {n.kind === 'project' && (
              <text
                x={n.labelLeft ? -n.r - 6 : n.r + 6}
                y={projectLines(label).length > 1 ? -3 : 4}
                textAnchor={n.labelLeft ? 'end' : 'start'}
                className="rmap-label-project"
              >
                {projectLines(label).map((l, k) => (
                  <tspan key={k} x={n.labelLeft ? -n.r - 6 : n.r + 6} dy={k ? '1.2em' : 0}>
                    {l}
                  </tspan>
                ))}
              </text>
            )}
            {n.kind === 'publication' && hover === i && (
              <g className="rmap-tip">
                <text x={n.r + 8} y="-4" className="rmap-label-pub">
                  {wrap(label).map((l, k) => (
                    <tspan key={k} x={n.r + 8} dy={k ? '1.25em' : 0}>
                      {l}
                    </tspan>
                  ))}
                </text>
                <text x={n.r + 8} y={13 + (wrap(label).length - 1) * 16} className="rmap-label-meta">
                  {t.research.mapLegend.publication} · {n.meta}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
