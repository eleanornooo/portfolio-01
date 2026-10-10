// The research network shown in the hero, built from the content files:
// themes (research interests), publications, projects, talks and recurring co-authors.
// Edges are real links: an item belongs to a theme, a co-author signed a work, a project
// produced a publication. Layout is a seeded force simulation, so it is identical on the
// server (static SVG) and in the browser (animated canvas).
import { publications } from '../content/publications';
import { projects, researchInterests } from '../content/projects';
import { talks } from '../content/talks';
import type { Lang, Localized } from '../content/types';
import { SELF } from './apa';
import { outputsOf, projectText, pubText, talkText, themesOf } from './related';
// Layout precomputed at build time by the research-graph plugin in vite.config.ts.
import { positions as LAYOUT } from 'virtual:research-graph';

export type NodeKind = 'core' | 'theme' | 'project' | 'publication' | 'talk' | 'coauthor';

export interface GraphNode {
  id: string;
  kind: NodeKind;
  label: string | Localized;
  /** Year or period shown after the label. */
  meta?: string;
  /** Works attached to this node (themes, core, co-authors). */
  count?: number;
  href: string;
}

export interface Graph {
  nodes: GraphNode[];
  edges: [number, number][];
}

const shorten = (s: string, n = 64) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export function buildGraph(): Graph {
  const nodes: GraphNode[] = [];
  const edges: [number, number][] = [];
  const add = (n: GraphNode) => nodes.push(n) - 1;
  const link = (a: number, b: number) => edges.push(a < b ? [a, b] : [b, a]);

  const core = add({
    id: 'core',
    kind: 'core',
    label: { en: 'AI in education', fr: 'IA en éducation' },
    count: publications.length + talks.length + projects.length,
    href: '/research',
  });
  const themes = researchInterests.map((r, i) =>
    add({ id: `theme-${i}`, kind: 'theme', label: r.title, count: 0, href: '/research#interests' }),
  );
  themes.forEach((t) => link(core, t));

  const attach = (idx: number, themeIdx: number[]) => {
    if (!themeIdx.length) link(core, idx);
    for (const i of themeIdx) {
      link(themes[i], idx);
      nodes[themes[i]].count! += 1;
    }
  };

  const pubIndex = new Map<string, number>();
  for (const p of publications) {
    const idx = add({
      id: p.id,
      kind: 'publication',
      label: shorten(p.title),
      meta: p.year === 'in press' ? 'in press' : String(p.year),
      href: '/publications',
    });
    pubIndex.set(p.id, idx);
    attach(idx, themesOf(pubText(p), p.id));
  }

  const talkIndex = new Map<string, number>();
  for (const t of talks) {
    const idx = add({
      id: t.id,
      kind: 'talk',
      label: shorten(t.title ?? t.event),
      meta: t.date.slice(0, 4),
      href: '/talks',
    });
    talkIndex.set(t.id, idx);
    attach(idx, themesOf(talkText(t)));
  }

  for (const p of projects) {
    const idx = add({
      id: p.id,
      kind: 'project',
      label: shorten(p.short ?? p.title),
      meta: p.period,
      href: `/research#case-${p.id}`,
    });
    attach(idx, themesOf(projectText(p)));
    const out = outputsOf(p);
    for (const x of out.pubs) link(idx, pubIndex.get(x.id)!);
    for (const x of out.talks) link(idx, talkIndex.get(x.id)!);
  }

  // Co-authors who share at least two works with Aziz.
  const shared = new Map<string, number[]>();
  for (const p of publications) for (const a of p.authors) if (a !== SELF) shared.set(a, [...(shared.get(a) ?? []), pubIndex.get(p.id)!]);
  for (const t of talks) for (const a of t.authors ?? []) if (a !== SELF) shared.set(a, [...(shared.get(a) ?? []), talkIndex.get(t.id)!]);
  for (const [name, works] of shared) {
    if (works.length < 2) continue;
    const idx = add({ id: `coauthor-${name}`, kind: 'coauthor', label: name, count: works.length, href: '/publications' });
    for (const w of works) link(idx, w);
  }

  // Remove duplicate edges.
  const seen = new Set<string>();
  const unique = edges.filter(([a, b]) => {
    const k = `${a}-${b}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return { nodes, edges: unique };
}

/* ------------------------------------------------------------------ layout */

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const REST: Partial<Record<NodeKind, number>> = { core: 0.5, theme: 0.42, coauthor: 0.32, project: 0.4 };

/**
 * 3D force-directed layout, normalised so the network fits in a unit sphere.
 * Runs at build time only (≈45 ms — too slow for a phone's hydration pass).
 */
export function layoutGraph(g: Graph): Float32Array {
  const n = g.nodes.length;
  const rand = rng(1999);
  const p = new Float32Array(n * 3);
  g.nodes.forEach((node, i) => {
    if (node.kind === 'core') return;
    const r = node.kind === 'theme' ? 0.5 : 0.7 + rand() * 0.5;
    const u = rand() * 2 - 1;
    const a = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    p[i * 3] = r * s * Math.cos(a);
    p[i * 3 + 1] = r * u * 0.8;
    p[i * 3 + 2] = r * s * Math.sin(a);
  });
  const d = new Float32Array(n * 3);
  let temp = 0.08;
  for (let step = 0; step < 420; step++) {
    d.fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = p[i * 3] - p[j * 3];
        const dy = p[i * 3 + 1] - p[j * 3 + 1];
        const dz = p[i * 3 + 2] - p[j * 3 + 2];
        const d2 = Math.max(dx * dx + dy * dy + dz * dz, 0.0025);
        const f = 0.0016 / d2;
        const inv = 1 / Math.sqrt(d2);
        d[i * 3] += dx * inv * f;
        d[i * 3 + 1] += dy * inv * f;
        d[i * 3 + 2] += dz * inv * f;
        d[j * 3] -= dx * inv * f;
        d[j * 3 + 1] -= dy * inv * f;
        d[j * 3 + 2] -= dz * inv * f;
      }
    }
    for (const [a, b] of g.edges) {
      const ka = g.nodes[a].kind;
      const kb = g.nodes[b].kind;
      const rest = REST[ka] ?? REST[kb] ?? 0.34;
      const dx = p[b * 3] - p[a * 3];
      const dy = p[b * 3 + 1] - p[a * 3 + 1];
      const dz = p[b * 3 + 2] - p[a * 3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-4;
      const f = ((dist - rest) * 0.05) / dist;
      d[a * 3] += dx * f;
      d[a * 3 + 1] += dy * f;
      d[a * 3 + 2] += dz * f;
      d[b * 3] -= dx * f;
      d[b * 3 + 1] -= dy * f;
      d[b * 3 + 2] -= dz * f;
    }
    for (let i = 0; i < n; i++) {
      if (g.nodes[i].kind === 'core') continue;
      for (let k = 0; k < 3; k++) {
        let v = d[i * 3 + k] - p[i * 3 + k] * 0.012;
        v = Math.max(-temp, Math.min(temp, v));
        p[i * 3 + k] += v;
      }
    }
    temp *= 0.992;
  }
  // Normalise: the farthest 5 % of nodes sit on the unit sphere.
  const radii = g.nodes.map((_, i) => Math.hypot(p[i * 3], p[i * 3 + 1], p[i * 3 + 2])).sort((a, b) => a - b);
  const scale = 1 / (radii[Math.floor(radii.length * 0.95)] || 1);
  for (let i = 0; i < p.length; i++) p[i] *= scale;
  return p;
}

/** Points evenly spaced along the outline of the eight-pointed zellige star (khatam). */
export function starPoints(count: number, R = 1.05): Float32Array {
  const r = R * 0.7654;
  const verts: [number, number][] = [];
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    verts.push([rad * Math.cos(a), -rad * Math.sin(a)]);
  }
  const seg = verts.map((v, i) => Math.hypot(verts[(i + 1) % 16][0] - v[0], verts[(i + 1) % 16][1] - v[1]));
  const total = seg.reduce((a, b) => a + b, 0);
  const out = new Float32Array(count * 3);
  for (let k = 0; k < count; k++) {
    let t = (k / count) * total;
    let i = 0;
    while (t > seg[i]) t -= seg[i++];
    const f = t / seg[i];
    const a = verts[i];
    const b = verts[(i + 1) % 16];
    out[k * 3] = a[0] + (b[0] - a[0]) * f;
    out[k * 3 + 1] = a[1] + (b[1] - a[1]) * f;
    out[k * 3 + 2] = 0;
  }
  return out;
}

/** The 16 corners of the star outline, for drawing it. */
export function starOutline(R = 1.05): [number, number][] {
  const r = R * 0.7654;
  return Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI / 8) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    return [rad * Math.cos(a), -rad * Math.sin(a)] as [number, number];
  });
}

let cache: { graph: Graph; positions: Float32Array } | null = null;

export function researchGraph() {
  if (!cache) {
    const graph = buildGraph();
    // A layout computed for a different graph (stale cache) would misplace nodes: recompute.
    const positions = LAYOUT.length === graph.nodes.length * 3 ? Float32Array.from(LAYOUT) : layoutGraph(graph);
    cache = { graph, positions };
  }
  return cache;
}

/* ----------------------------------------------------------------- labels */

const KIND_LABEL: Record<NodeKind, Localized> = {
  core: { en: 'Field', fr: 'Domaine' },
  theme: { en: 'Research theme', fr: 'Thème de recherche' },
  project: { en: 'Project', fr: 'Projet' },
  publication: { en: 'Publication', fr: 'Publication' },
  talk: { en: 'Talk', fr: 'Conférence' },
  coauthor: { en: 'Co-author', fr: 'Coauteur' },
};

export function nodeText(node: GraphNode, lang: Lang): { kind: string; title: string; detail?: string } {
  const title = typeof node.label === 'string' ? node.label : node.label[lang];
  const works = (n: number) =>
    lang === 'fr' ? `${n} ${n > 1 ? 'travaux' : 'travail'}` : `${n} ${n > 1 ? 'works' : 'work'}`;
  let detail = node.meta;
  if (node.kind === 'theme' || node.kind === 'core') detail = works(node.count ?? 0);
  if (node.kind === 'coauthor')
    detail = lang === 'fr' ? `${node.count} travaux communs` : `${node.count} joint works`;
  if (detail === 'in press') detail = lang === 'fr' ? 'sous presse' : 'in press';
  return { kind: KIND_LABEL[node.kind][lang], title, detail };
}
