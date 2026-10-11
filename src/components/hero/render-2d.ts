// Phone renderer: the same network drawn with Canvas 2D (no three.js download). Each node is a
// pre-rendered "glass bead" sprite (dark body, warm rim light, specular highlight, soft halo),
// so a frame is a few dozen drawImage calls.
import { edgeBase, type NetworkRenderer, type Palette, type RGB } from './palette';
import type { NodeKind } from '../../lib/graph';

const SPRITE = 96;

const rgba = ([r, g, b]: RGB, a: number) =>
  `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a.toFixed(3)})`;

/** A glass sphere with its halo; the sphere fills the middle 40% of the sprite. */
function bead(glow: RGB, body: RGB, ember: boolean): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = SPRITE;
  const ctx = c.getContext('2d')!;
  const m = SPRITE / 2;
  const r = SPRITE * 0.2;
  // halo
  const h = ctx.createRadialGradient(m, m, r * 0.6, m, m, m);
  h.addColorStop(0, rgba(glow, 0.45));
  h.addColorStop(1, rgba(glow, 0));
  ctx.fillStyle = h;
  ctx.fillRect(0, 0, SPRITE, SPRITE);
  // body, lit from the top left
  const b = ctx.createRadialGradient(m - r * 0.35, m - r * 0.4, r * 0.1, m, m, r);
  b.addColorStop(0, rgba(body, 1));
  b.addColorStop(0.75, rgba(body.map((v) => v * 0.45) as RGB, 1));
  b.addColorStop(1, rgba(glow, 0.95));
  ctx.beginPath();
  ctx.arc(m, m, r, 0, Math.PI * 2);
  ctx.fillStyle = b;
  ctx.fill();
  if (ember) {
    const e = ctx.createRadialGradient(m, m, 0, m, m, r * 0.55);
    e.addColorStop(0, rgba([1, 0.92, 0.75], 1));
    e.addColorStop(0.4, rgba(glow, 0.9));
    e.addColorStop(1, rgba(glow, 0));
    ctx.fillStyle = e;
    ctx.fill();
  }
  // specular highlight
  const s = ctx.createRadialGradient(m - r * 0.38, m - r * 0.45, 0, m - r * 0.38, m - r * 0.45, r * 0.42);
  s.addColorStop(0, 'rgba(255,255,255,0.85)');
  s.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = s;
  ctx.fill();
  return c;
}

function dot(color: RGB): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, rgba(color, 1));
  g.addColorStop(0.3, rgba(color, 0.8));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return c;
}

/** Sphere diameter per kind, as a fraction of the network radius (as in render-three). */
const DIAMETER: Record<NodeKind | 'dust', number> = {
  core: 0.17,
  theme: 0.116,
  project: 0.06,
  publication: 0.048,
  coauthor: 0.052,
  talk: 0.034,
  dust: 0.022,
};

export function createCanvasRenderer(canvas: HTMLCanvasElement): NetworkRenderer {
  const ctx = canvas.getContext('2d')!;
  let palette: Palette | null = null;
  let sprites = new Map<string, HTMLCanvasElement>();
  let signal: HTMLCanvasElement | null = null;
  let dust: HTMLCanvasElement | null = null;
  let width = 1;
  let height = 1;
  let ratio = 1;

  return {
    resize(w, h, dpr) {
      width = w;
      height = h;
      ratio = dpr;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    },
    setPalette(p) {
      palette = p;
      const body: RGB = [0.24, 0.17, 0.13];
      sprites = new Map([
        ['core', bead(p.vivid, [0.5, 0.25, 0.14], true)],
        ['theme', bead(p.amber, [0.45, 0.3, 0.16], true)],
        ['project', bead(p.vivid, body, false)],
        ['publication', bead(p.amber, body, false)],
        ['coauthor', bead(p.amber, [0.4, 0.26, 0.14], false)],
        ['talk', bead(p.ink3, [0.18, 0.18, 0.21], false)],
      ]);
      signal = dot([1, 0.85, 0.6]);
      dust = dot(p.amber);
    },
    render(sim, cx, cy, scale) {
      if (!palette) return;
      const { x, y, s } = sim.proj;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const starAlpha = Math.max(0, 1 - sim.formed * 1.6) * 0.7;
      if (starAlpha > 0.001) {
        ctx.beginPath();
        sim.star.forEach(([sx, sy], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, cx + sx * scale, cy - sy * scale));
        ctx.closePath();
        ctx.strokeStyle = rgba(palette.amber, starAlpha);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.lineWidth = 1;
      ctx.globalCompositeOperation = 'lighter';
      for (let e = 0; e < sim.edges.length; e++) {
        const a = sim.edgeAlpha[e];
        if (a < 0.01) continue;
        const [i, j] = sim.edges[e];
        const hot = sim.hovered >= 0 && sim.isConnected(e, sim.hovered);
        ctx.strokeStyle = rgba(palette.amber, a * (hot ? 0.9 : edgeBase(sim, e) * 0.7));
        ctx.beginPath();
        ctx.moveTo(x[i], y[i]);
        ctx.lineTo(x[j], y[j]);
        ctx.stroke();
      }

      // Back to front, so nearer beads cover farther ones.
      const order = Array.from({ length: sim.particles.length }, (_, i) => i).sort((a, b) => s[a] - s[b]);
      for (const i of order) {
        const part = sim.particles[i];
        const grow = (1 + sim.flash[i] * 0.25) * (i === sim.hovered ? 1.3 : 1) * (0.45 + 0.55 * sim.progress[i]);
        const d = DIAMETER[part.kind] * scale * s[i] * grow;
        if (part.kind === 'dust') {
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 0.35;
          ctx.drawImage(dust!, x[i] - d / 2, y[i] - d / 2, d, d);
          continue;
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.6 + 0.4 * sim.progress[i];
        const size = d * 2.5; // the sphere is 40% of its sprite
        ctx.drawImage(sprites.get(part.kind)!, x[i] - size / 2, y[i] - size / 2, size, size);
      }

      ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < sim.signals.length; k++) {
        const a = sim.signalAlpha[k];
        if (a < 0.01) continue;
        const sx = cx + sim.signalPos[k * 3] * scale;
        const sy = cy - sim.signalPos[k * 3 + 1] * scale;
        ctx.globalAlpha = a;
        ctx.drawImage(signal!, sx - 9, sy - 9, 18, 18);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
    dispose() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
