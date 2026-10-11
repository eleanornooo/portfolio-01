// The Research page's knowledge graph: research themes (big), projects (medium) and
// publications (small), linked by the same relations as the rest of the site (lib/related).
// The layout is a d3-force simulation run synchronously from d3's deterministic start
// positions, so the pre-rendered SVG and the first client render are identical.
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, type SimulationNodeDatum } from 'd3-force';
import { projects, researchInterests } from '../content/projects';
import { publications } from '../content/publications';
import type { Localized } from '../content/types';
import { outputsOf, projectText, pubText, themesOf } from './related';

export type MapKind = 'theme' | 'project' | 'publication';

export interface MapNode extends SimulationNodeDatum {
  id: string;
  kind: MapKind;
  label: string | Localized;
  /** Themes this node belongs to (a theme belongs to itself). */
  themes: number[];
  r: number;
  /** Where a click goes (projects: their case study). */
  href?: string;
  meta?: string;
  x: number;
  y: number;
}

export interface MapEdge {
  source: number;
  target: number;
}

export const MAP_W = 1200;
export const MAP_H = 760;

/** Theme anchors on an ellipse, centred a little right of the middle (the title sits left). */
function anchor(i: number, n: number, cx: number) {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  return { x: cx + Math.cos(a) * MAP_W * 0.3, y: MAP_H * 0.47 + Math.sin(a) * MAP_H * 0.34 };
}

export function buildResearchMap(cx = MAP_W * 0.6): { nodes: MapNode[]; edges: MapEdge[] } {
  const nodes: MapNode[] = [];
  const edges: MapEdge[] = [];
  const add = (n: Omit<MapNode, 'x' | 'y'>) => nodes.push(n as MapNode) - 1;

  const themeIdx = researchInterests.map((r, i) => add({ id: `theme-${i}`, kind: 'theme', label: r.title, themes: [i], r: 30 }));

  const pubIdx = new Map<string, number>();
  for (const p of publications) {
    const th = themesOf(pubText(p), p.id);
    const idx = add({
      id: p.id,
      kind: 'publication',
      label: p.title,
      themes: th,
      r: 5.5,
      href: '/publications',
      meta: p.year === 'in press' ? 'in press' : String(p.year),
    });
    pubIdx.set(p.id, idx);
    th.forEach((t) => edges.push({ source: themeIdx[t], target: idx }));
  }

  for (const p of projects) {
    const th = themesOf(projectText(p));
    const idx = add({
      id: p.id,
      kind: 'project',
      label: p.short ?? p.title,
      themes: th,
      r: 11,
      href: `#case-${p.id}`,
      meta: p.period,
    });
    th.forEach((t) => edges.push({ source: themeIdx[t], target: idx }));
    for (const x of outputsOf(p).pubs) {
      const j = pubIdx.get(x.id)!;
      edges.push({ source: idx, target: j });
      // A publication of a project also inherits the project's themes (for filtering).
      nodes[j].themes = [...new Set([...nodes[j].themes, ...th])];
    }
  }

  // Theme size grows with the number of works attached to it.
  themeIdx.forEach((ti, i) => {
    const count = nodes.filter((n) => n.kind !== 'theme' && n.themes.includes(i)).length;
    nodes[ti].r = 30 + Math.sqrt(count) * 6;
  });

  layout(nodes, edges, cx);
  return { nodes, edges };
}

/** The force model (stopped): themes are pulled to their anchors; works settle around them. */
export function configure(nodes: MapNode[], edges: MapEdge[], cx: number) {
  const n = researchInterests.length;
  return forceSimulation<MapNode>(nodes)
    .stop()
    .force(
      'link',
      forceLink<MapNode, { source: number | MapNode; target: number | MapNode }>(edges.map((e) => ({ ...e })))
        .distance((l) => {
          const s = l.source as MapNode;
          const t = l.target as MapNode;
          return s.kind === 'theme' || t.kind === 'theme' ? (t.kind === 'project' || s.kind === 'project' ? 120 : 95) : 55;
        })
        .strength(0.25),
    )
    .force('charge', forceManyBody<MapNode>().strength((d) => (d.kind === 'theme' ? -700 : d.kind === 'project' ? -160 : -45)))
    // Generous radii leave room for the labels (under themes, right of projects).
    .force('collide', forceCollide<MapNode>((d) => d.r + (d.kind === 'theme' ? 62 : d.kind === 'project' ? 30 : 8)).iterations(2))
    .force('x', forceX<MapNode>((d) => (d.kind === 'theme' ? anchor(themesOfNode(d), n, cx).x : cx)).strength((d) => (d.kind === 'theme' ? 0.6 : 0.03)))
    .force('y', forceY<MapNode>((d) => (d.kind === 'theme' ? anchor(themesOfNode(d), n, cx).y : MAP_H / 2)).strength((d) => (d.kind === 'theme' ? 0.6 : 0.05)))
    .force('captions', captionForce(nodes));
}

/**
 * Keeps works out of the box under each theme where its two-line caption sits (and, for
 * projects, keeps their own right-hand label clear of it), pushing them out sideways.
 */
function captionForce(nodes: MapNode[]) {
  const themes = nodes.filter((d) => d.kind === 'theme');
  return (alpha: number) => {
    for (const d of nodes) {
      if (d.kind === 'theme') continue;
      const labelW = d.kind === 'project' ? 170 : 0;
      for (const th of themes) {
        const top = th.y + th.r + 4;
        const bottom = th.y + th.r + 52;
        const left = th.x - 150;
        const right = th.x + 150;
        const nx0 = d.x - d.r - 4;
        const nx1 = d.x + d.r + labelW;
        if (d.y + d.r < top || d.y - d.r > bottom || nx1 < left || nx0 > right) continue;
        // Out through the nearer side (left or right), and a little down/up.
        const goLeft = d.x < th.x;
        const dx = goLeft ? left - nx1 : right - nx0;
        d.vx = (d.vx ?? 0) + dx * 0.25 * Math.max(alpha, 0.1);
        d.vy = (d.vy ?? 0) + (d.y < (top + bottom) / 2 ? -1 : 1) * 2 * Math.max(alpha, 0.1);
      }
    }
  };
}

/** Runs the force model to rest and keeps every node inside the frame. */
export function layout(nodes: MapNode[], edges: MapEdge[], cx: number) {
  const sim = configure(nodes, edges, cx);
  sim.tick(320);
  // Keep everything inside the frame.
  for (const d of nodes) {
    d.x = Math.max(d.r + 8, Math.min(MAP_W - d.r - 8, d.x));
    d.y = Math.max(d.r + 8, Math.min(MAP_H - d.r - 8, d.y));
  }
  return sim;
}

const themesOfNode = (d: MapNode) => d.themes[0] ?? 0;

/** Indices of a node and its direct neighbours. */
export function neighbours(edges: MapEdge[], i: number): Set<number> {
  const out = new Set([i]);
  for (const e of edges) {
    if (e.source === i) out.add(e.target);
    if (e.target === i) out.add(e.source);
  }
  return out;
}
