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
  /** Projects: the label sits left of the node (when the right side is crowded). */
  labelLeft?: boolean;
  x: number;
  y: number;
}

export interface MapEdge {
  source: number;
  target: number;
}

export const MAP_W = 1200;
export const MAP_H = 760;

/**
 * The page title, intro and legend sit over the bottom-left of the map. In map units this
 * box is x < 500 and y > 395 at every desktop viewport (measured from 1024×768 to 1920×1080),
 * so nodes and their labels are kept out of it.
 */
export const TITLE_ZONE = { right: 500, top: 395 };

/**
 * Theme anchors on an ellipse right of the middle, spread over the arc that avoids the
 * title (bottom-left): from 200° round to 100° (clockwise, SVG angles).
 */
function anchor(i: number, n: number, cx: number) {
  const from = (200 * Math.PI) / 180;
  const span = (260 * Math.PI) / 180;
  const a = from + (n > 1 ? (i * span) / (n - 1) : 0);
  return { x: cx + Math.cos(a) * MAP_W * 0.28, y: MAP_H * 0.5 + Math.sin(a) * MAP_H * 0.33 };
}

/** Splits a label into two balanced lines. */
export function twoLines(s: string): [string, string] {
  const words = s.split(' ');
  let best = 1;
  let diff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const d = Math.abs(words.slice(0, i).join(' ').length - words.slice(i).join(' ').length);
    if (d < diff) {
      diff = d;
      best = i;
    }
  }
  return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
}

/** A project's label, in full: one line when short, otherwise two balanced lines. */
export const projectLines = (s: string): string[] => (s.length <= 22 || !s.includes(' ') ? [s] : twoLines(s));

/** Approximate width of a project label (12px Plex Sans) right of its node. */
const projectLabelW = (d: MapNode) =>
  typeof d.label === 'string' ? Math.max(...projectLines(d.label).map((l) => l.length)) * 6.6 + 8 : 0;

export function buildResearchMap(cx = MAP_W * 0.62): { nodes: MapNode[]; edges: MapEdge[] } {
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
  // A project label that would still cover a bubble on its right goes to the left instead.
  for (const d of nodes) {
    if (d.kind !== 'project') continue;
    const w = projectLabelW(d);
    const h = (typeof d.label === 'string' ? projectLines(d.label).length : 1) * 8 + 2;
    const hits = (x0: number, x1: number) =>
      nodes.some(
        (o) => o !== d && o.kind !== 'publication' && o.x + o.r + 6 > x0 && o.x - o.r - 6 < x1 && o.y + o.r + 6 > d.y - h && o.y - o.r - 6 < d.y + h,
      );
    const rightX = d.x + d.r + 2;
    const leftX = d.x - d.r - 2;
    d.labelLeft = hits(rightX, rightX + w) && !hits(leftX - w, leftX) && leftX - w > TITLE_ZONE.right * (d.y > TITLE_ZONE.top ? 1 : 0);
  }
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
    .force('captions', captionForce(nodes))
    .force('title', titleForce(nodes));
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
      const labelW = d.kind === 'project' ? projectLabelW(d) : 0;
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
    // A project's label must not run over a theme bubble or another project: nudge it
    // up or down, away from what it covers.
    for (const d of nodes) {
      if (d.kind !== 'project') continue;
      const lines = typeof d.label === 'string' ? projectLines(d.label).length : 1;
      const lx0 = d.x + d.r + 2;
      const lx1 = lx0 + projectLabelW(d);
      const ly0 = d.y - lines * 8 - 2;
      const ly1 = d.y + lines * 8 + 2;
      for (const o of nodes) {
        if (o === d || o.kind === 'publication') continue;
        const pad = o.kind === 'theme' ? 8 : 4;
        if (o.x + o.r + pad < lx0 || o.x - o.r - pad > lx1 || o.y + o.r + pad < ly0 || o.y - o.r - pad > ly1) continue;
        const dir = d.y <= o.y ? -1 : 1;
        const k = 1.6 * Math.max(alpha, 0.1);
        d.vy = (d.vy ?? 0) + dir * k;
        o.vy = (o.vy ?? 0) - dir * k * (o.kind === 'theme' ? 0.1 : 0.5);
      }
    }
  };
}

/** Pushes works (and project labels) out of the title box, up or right, whichever is nearer. */
function titleForce(nodes: MapNode[]) {
  return (alpha: number) => {
    for (const d of nodes) {
      if (d.kind === 'theme') continue;
      const over = titleOverlap(d);
      if (!over) continue;
      const k = 0.3 * Math.max(alpha, 0.1);
      if (over.right < over.up) d.vx = (d.vx ?? 0) + over.right * k;
      else d.vy = (d.vy ?? 0) - over.up * k;
    }
  };
}

/** How far a node (with its label) reaches into the title box, rightwards and upwards. */
function titleOverlap(d: MapNode) {
  const lines = d.kind === 'project' && typeof d.label === 'string' ? projectLines(d.label).length : 1;
  const x0 = d.x - d.r - 4;
  const y1 = d.y + Math.max(d.r, lines * 14) + 4;
  if (x0 >= TITLE_ZONE.right || y1 <= TITLE_ZONE.top) return null;
  return { right: TITLE_ZONE.right - x0, up: y1 - TITLE_ZONE.top };
}

/** Hard guarantee after the forces: anything still in the title box is moved out of it. */
export function clearTitle(d: MapNode) {
  if (d.kind === 'theme') return;
  const over = titleOverlap(d);
  if (!over) return;
  if (over.right < over.up) d.x += over.right;
  else d.y -= over.up;
}

/** Runs the force model to rest and keeps every node inside the frame. */
export function layout(nodes: MapNode[], edges: MapEdge[], cx: number) {
  const sim = configure(nodes, edges, cx);
  sim.tick(320);
  // Keep everything inside the frame.
  for (const d of nodes) {
    d.x = Math.max(d.r + 8, Math.min(MAP_W - d.r - 8, d.x));
    d.y = Math.max(d.r + 8, Math.min(MAP_H - d.r - 8, d.y));
    clearTitle(d);
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
