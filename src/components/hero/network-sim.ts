// Renderer-independent simulation of the hero network: particles start on the zellige star,
// then "learn" their place in the research graph; the network then turns slowly, leans toward
// the cursor and carries signals along its edges. Renderers (three.js on desktop, Canvas 2D on
// phones) only draw what this produces.
import { researchGraph, starOutline, starPoints, type GraphNode, type NodeKind } from '../../lib/graph';
import { profile } from '../../content/profile';

export const KIND_SIZE: Record<NodeKind | 'dust', number> = {
  core: 18,
  theme: 13,
  project: 9,
  publication: 8,
  coauthor: 8,
  talk: 5.6,
  dust: 2.8,
};

/** Order in which kinds settle — the network "learns" from its centre outwards. */
const KIND_DELAY: Record<NodeKind | 'dust', number> = {
  core: 0,
  theme: 0.08,
  project: 0.28,
  publication: 0.38,
  coauthor: 0.5,
  talk: 0.58,
  dust: 0.7,
};

const HOLD = 0.35; // seconds on the star before organising
const MORPH = 0.95; // seconds each particle takes to reach its place
const STAGGER = 0.75; // spread of the per-kind delays: the whole intro takes ≈1.5 s
export const CAMERA_Z = 1000; // px — shared perspective for both renderers

export interface SimParticle {
  node: GraphNode | null; // null = dust (one per citation)
  kind: NodeKind | 'dust';
  size: number;
}

export interface Projected {
  x: Float32Array;
  y: Float32Array;
  s: Float32Array; // perspective scale
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export class NetworkSim {
  readonly particles: SimParticle[];
  readonly nodeCount: number;
  readonly edges: [number, number][];
  readonly star: [number, number][];
  /** View-space positions after rotation and lean (unit radius ≈ 1). */
  readonly view: Float32Array;
  readonly progress: Float32Array;
  readonly flash: Float32Array;
  readonly edgeAlpha: Float32Array;
  readonly signals: { edge: number; t: number; speed: number; dir: 1 | -1 }[];
  readonly signalPos: Float32Array;
  readonly signalAlpha: Float32Array;
  readonly proj: Projected;
  /** 0 → 1: how far the star has turned into the network. */
  formed = 0;
  hovered = -1;
  /** 0 → 1 as the hero scrolls away: the network turns and tilts with it. */
  scroll = 0;

  private target: Float32Array;
  private start: Float32Array;
  private delay: Float32Array;
  private time = 0;
  private rotY = -0.5;
  private rotX = 0;
  private pointer = { x: 0, y: 0, active: 0, want: 0 };
  private rand = rng(76);
  private edgeWeights: number[];
  private totalWeight: number;

  constructor({ lite = false, reduced = false }: { lite?: boolean; reduced?: boolean } = {}) {
    const { graph, positions } = researchGraph();
    // Phones keep the structure (core, themes, projects, publications, co-authors) and drop talks.
    const keep = graph.nodes.map((n, i) => (lite && n.kind === 'talk' ? -1 : i)).filter((i) => i >= 0);
    const remap = new Map(keep.map((old, i) => [old, i]));
    const dust = lite ? Math.round(profile.metrics.citations / 2) : profile.metrics.citations;

    this.nodeCount = keep.length;
    this.particles = [
      ...keep.map((i) => ({ node: graph.nodes[i], kind: graph.nodes[i].kind, size: KIND_SIZE[graph.nodes[i].kind] })),
      ...Array.from({ length: dust }, () => ({ node: null, kind: 'dust' as const, size: KIND_SIZE.dust })),
    ];
    this.edges = graph.edges
      .filter(([a, b]) => remap.has(a) && remap.has(b))
      .map(([a, b]) => [remap.get(a)!, remap.get(b)!] as [number, number]);

    const n = this.particles.length;
    this.target = new Float32Array(n * 3);
    keep.forEach((old, i) => this.target.set(positions.subarray(old * 3, old * 3 + 3), i * 3));
    // Dust: one particle per citation, on a loose shell around the network.
    for (let i = this.nodeCount; i < n; i++) {
      const u = this.rand() * 2 - 1;
      const a = this.rand() * Math.PI * 2;
      const r = 1.18 + this.rand() * 0.38;
      const s = Math.sqrt(1 - u * u);
      this.target[i * 3] = r * s * Math.cos(a);
      this.target[i * 3 + 1] = r * u * 0.75;
      this.target[i * 3 + 2] = r * s * Math.sin(a);
    }

    // Star: interleave nodes and dust along the outline so the shape reads evenly.
    this.start = new Float32Array(n * 3);
    const pts = starPoints(n);
    const order = Array.from({ length: n }, (_, i) => i).sort(
      (a, b) => ((a * 0.618034) % 1) - ((b * 0.618034) % 1),
    );
    order.forEach((p, k) => this.start.set(pts.subarray(k * 3, k * 3 + 3), p * 3));
    this.star = starOutline();

    this.delay = new Float32Array(n);
    this.particles.forEach((p, i) => (this.delay[i] = KIND_DELAY[p.kind] + this.rand() * 0.22));

    this.view = new Float32Array(n * 3);
    this.progress = new Float32Array(n);
    this.flash = new Float32Array(n);
    this.edgeAlpha = new Float32Array(this.edges.length);

    // Signals prefer the backbone (core ↔ themes ↔ works).
    this.edgeWeights = this.edges.map(([a, b]) => {
      const k = [this.particles[a].kind, this.particles[b].kind];
      return k.includes('core') ? 3 : k.includes('theme') ? 2 : 1;
    });
    this.totalWeight = this.edgeWeights.reduce((s, w) => s + w, 0);
    const count = lite ? 10 : 24;
    this.signals = Array.from({ length: count }, () => ({
      edge: this.pickEdge(),
      t: -this.rand() * 2.5, // staggered start
      speed: 0.45 + this.rand() * 0.5,
      dir: this.rand() < 0.5 ? 1 : -1,
    }));
    this.signalPos = new Float32Array(count * 3);
    this.signalAlpha = new Float32Array(count);
    this.proj = { x: new Float32Array(n), y: new Float32Array(n), s: new Float32Array(n) };

    if (reduced) this.time = HOLD + 2 + MORPH; // settle immediately
  }

  private pickEdge(): number {
    let r = this.rand() * this.totalWeight;
    for (let i = 0; i < this.edgeWeights.length; i++) {
      r -= this.edgeWeights[i];
      if (r <= 0) return i;
    }
    return 0;
  }

  /** Pointer in view units (origin = network centre, y up), or null when it leaves. */
  setPointer(x: number | null, y = 0) {
    if (x === null) {
      this.pointer.want = 0;
      return;
    }
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.want = 1;
  }

  update(dt: number) {
    dt = Math.min(dt, 0.05);
    this.time += dt;
    const t = this.time;
    const n = this.particles.length;
    const ptr = this.pointer;
    ptr.active += (ptr.want - ptr.active) * Math.min(1, dt * 4);

    let formed = 0;
    for (let i = 0; i < n; i++) {
      const p = Math.min(1, Math.max(0, (t - HOLD - this.delay[i] * STAGGER) / MORPH));
      this.progress[i] = easeInOut(p);
      formed += p;
    }
    this.formed = formed / n;

    // Rotation fades in as the network forms; the star faces the viewer.
    const spin = this.formed * this.formed;
    this.rotY += dt * 0.085 * spin + dt * 0.05 * ptr.active * ptr.x * spin;
    const wantX = 0.22 * spin + ptr.active * ptr.y * 0.18;
    this.rotX += (wantX - this.rotX) * Math.min(1, dt * 2);
    this.place(this.rotY * spin + this.scroll * 0.9, this.rotX + this.scroll * 0.35, t * 0.05);
    for (let i = 0; i < n; i++) this.flash[i] = Math.max(0, this.flash[i] - dt * 1.6);
    this.updateEdgesAndSignals(dt);
  }

  /** A still frame: the zellige star (`formed = false`) or the finished network. */
  staticPose(formed: boolean) {
    this.progress.fill(formed ? 1 : 0);
    this.formed = formed ? 1 : 0;
    this.place(formed ? -0.5 : 0, formed ? 0.22 : 0, 0);
    for (let e = 0; e < this.edges.length; e++) this.edgeAlpha[e] = formed ? 1 : 0;
  }

  private place(ry: number, rx: number, dustSpin: number) {
    const n = this.particles.length;
    const ptr = this.pointer;
    const cy = Math.cos(ry);
    const sy = Math.sin(ry);
    const cx = Math.cos(rx);
    const sx = Math.sin(rx);

    for (let i = 0; i < n; i++) {
      const k = this.progress[i];
      let tx = this.target[i * 3];
      const ty = this.target[i * 3 + 1];
      let tz = this.target[i * 3 + 2];
      if (i >= this.nodeCount) {
        const c = Math.cos(dustSpin);
        const s = Math.sin(dustSpin);
        const x = tx * c - tz * s;
        tz = tx * s + tz * c;
        tx = x;
      }
      // Network position, rotated into view space.
      const x1 = tx * cy + tz * sy;
      const z1 = -tx * sy + tz * cy;
      const y2 = ty * cx - z1 * sx;
      const z2 = ty * sx + z1 * cx;
      // Star position (flat, facing the viewer) → network position, with a slight swirl.
      const sxp = this.start[i * 3];
      const syp = this.start[i * 3 + 1];
      const swirl = Math.sin(Math.PI * k) * 0.22;
      let vx = sxp + (x1 - sxp) * k - syp * swirl;
      let vy = syp + (y2 - syp) * k + sxp * swirl;
      const vz = z2 * k;

      // Lean toward the cursor.
      if (ptr.active > 0.01) {
        const dx = ptr.x - vx;
        const dy = ptr.y - vy;
        const d = Math.hypot(dx, dy);
        if (d < 0.55) {
          const f = (1 - d / 0.55) ** 2 * 0.22 * ptr.active * k;
          vx += dx * f;
          vy += dy * f;
        }
      }
      this.view[i * 3] = vx;
      this.view[i * 3 + 1] = vy;
      this.view[i * 3 + 2] = vz;
    }
  }

  private updateEdgesAndSignals(dt: number) {
    for (let e = 0; e < this.edges.length; e++) {
      const [a, b] = this.edges[e];
      const k = Math.min(this.progress[a], this.progress[b]);
      this.edgeAlpha[e] = k * k;
    }

    // Signals travel once the network has formed, and light up the node they reach.
    for (let s = 0; s < this.signals.length; s++) {
      const sig = this.signals[s];
      if (this.formed < 0.85) {
        this.signalAlpha[s] = 0;
        continue;
      }
      sig.t += dt * sig.speed;
      if (sig.t >= 1) {
        const [a, b] = this.edges[sig.edge];
        this.flash[sig.dir === 1 ? b : a] = 1;
        sig.edge = this.pickEdge();
        sig.t = -this.rand() * 0.8;
        sig.dir = this.rand() < 0.5 ? 1 : -1;
        sig.speed = 0.45 + this.rand() * 0.5;
      }
      const u = Math.max(0, sig.t);
      const [a, b] = this.edges[sig.edge];
      const [from, to] = sig.dir === 1 ? [a, b] : [b, a];
      for (let c = 0; c < 3; c++) {
        this.signalPos[s * 3 + c] = this.view[from * 3 + c] + (this.view[to * 3 + c] - this.view[from * 3 + c]) * u;
      }
      this.signalAlpha[s] = sig.t < 0 ? 0 : Math.sin(Math.PI * u);
    }
  }

  /** Projects view positions to canvas pixels (CSS px) around (cx, cy) with radius `scale`. */
  project(cx: number, cy: number, scale: number) {
    const { x, y, s } = this.proj;
    for (let i = 0; i < this.particles.length; i++) {
      const persp = CAMERA_Z / (CAMERA_Z - this.view[i * 3 + 2] * scale);
      s[i] = persp;
      x[i] = cx + this.view[i * 3] * scale * persp;
      y[i] = cy - this.view[i * 3 + 1] * scale * persp;
    }
  }

  /** Nearest node under (px, py) in CSS px, or -1. Uses the last projection. */
  hitTest(px: number, py: number, sizeScale = 1): number {
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < this.nodeCount; i++) {
      if (this.progress[i] < 0.9) continue;
      const r = Math.max(11, this.particles[i].size * sizeScale * this.proj.s[i] * 0.9) + 4;
      const d = Math.hypot(this.proj.x[i] - px, this.proj.y[i] - py);
      // Prefer the front-most of overlapping nodes.
      const score = d - this.view[i * 3 + 2] * 4;
      if (d < r && score < bestD) {
        bestD = score;
        best = i;
      }
    }
    return best;
  }

  isConnected(e: number, node: number) {
    return this.edges[e][0] === node || this.edges[e][1] === node;
  }
}
