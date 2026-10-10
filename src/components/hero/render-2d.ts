// Phone renderer: the same network drawn with Canvas 2D (no three.js download).
// Glows are pre-rendered sprites, so a frame is a few dozen drawImage calls.
import { edgeBase, kindAlpha, kindColor, type NetworkRenderer, type Palette, type RGB } from './palette';

const SPRITE = 64;

function sprite([r, g, b]: RGB): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = SPRITE;
  const ctx = c.getContext('2d')!;
  const rgb = `${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)}`;
  const grad = ctx.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.3, `rgba(${rgb},1)`);
  grad.addColorStop(0.38, `rgba(${rgb},0.38)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SPRITE, SPRITE);
  return c;
}

const css = ([r, g, b]: RGB, a: number) =>
  `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a.toFixed(3)})`;

export function createCanvasRenderer(canvas: HTMLCanvasElement): NetworkRenderer {
  const ctx = canvas.getContext('2d')!;
  let palette: Palette | null = null;
  let sprites = new Map<string, HTMLCanvasElement>();
  let vivid: HTMLCanvasElement | null = null;
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
      sprites = new Map();
      vivid = sprite(p.vivid);
    },
    render(sim, cx, cy, scale) {
      if (!palette) return;
      const { x, y, s } = sim.proj;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const starAlpha = Math.max(0, 1 - sim.formed * 1.6) * 0.5;
      if (starAlpha > 0.001) {
        ctx.beginPath();
        sim.star.forEach(([sx, sy], i) => (i ? ctx.lineTo : ctx.moveTo).call(ctx, cx + sx * scale, cy - sy * scale));
        ctx.closePath();
        ctx.strokeStyle = css(palette.accent, starAlpha);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.lineWidth = 1;
      for (let e = 0; e < sim.edges.length; e++) {
        const a = sim.edgeAlpha[e];
        if (a < 0.01) continue;
        const [i, j] = sim.edges[e];
        const hot = sim.hovered >= 0 && sim.isConnected(e, sim.hovered);
        ctx.strokeStyle = css(hot ? palette.accent : palette.ink, a * (hot ? 0.8 : edgeBase(sim, e)));
        ctx.beginPath();
        ctx.moveTo(x[i], y[i]);
        ctx.lineTo(x[j], y[j]);
        ctx.stroke();
      }

      for (let i = 0; i < sim.particles.length; i++) {
        const part = sim.particles[i];
        const key = part.kind;
        let img = sprites.get(key);
        if (!img) {
          img = sprite(kindColor(part.kind, palette));
          sprites.set(key, img);
        }
        const size = part.size * 2.8 * s[i] * (1 + sim.flash[i] * 0.55) * (i === sim.hovered ? 1.55 : 1);
        ctx.globalAlpha = kindAlpha(part.kind) * (0.55 + 0.45 * sim.progress[i]);
        ctx.drawImage(img, x[i] - size / 2, y[i] - size / 2, size, size);
      }

      if (vivid) {
        for (let k = 0; k < sim.signals.length; k++) {
          const a = sim.signalAlpha[k];
          if (a < 0.01) continue;
          const sx = cx + sim.signalPos[k * 3] * scale;
          const sy = cy - sim.signalPos[k * 3 + 1] * scale;
          ctx.globalAlpha = a;
          ctx.drawImage(vivid, sx - 8, sy - 8, 16, 16);
        }
      }
      ctx.globalAlpha = 1;
    },
    dispose() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
  };
}
