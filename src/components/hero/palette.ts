import type { NodeKind } from '../../lib/graph';
import type { NetworkSim } from './network-sim';

export type RGB = [number, number, number];

export interface Palette {
  ink: RGB;
  ink3: RGB;
  accent: RGB;
  vivid: RGB;
}

/** Reads the site's colour tokens (light or dark theme) as 0–1 RGB. */
export function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const get = (name: string): RGB => {
    const [r, g, b] = css.getPropertyValue(`--${name}`).trim().split(/\s+/).map(Number);
    return [r / 255, g / 255, b / 255];
  };
  return { ink: get('ink'), ink3: get('ink-3'), accent: get('accent'), vivid: get('accent-vivid') };
}

export function kindColor(kind: NodeKind | 'dust', p: Palette): RGB {
  switch (kind) {
    case 'core':
      return p.vivid;
    case 'theme':
    case 'coauthor':
      return p.accent;
    case 'talk':
    case 'dust':
      return p.ink3;
    default:
      return p.ink;
  }
}

export const kindAlpha = (kind: NodeKind | 'dust') => (kind === 'dust' ? 0.42 : kind === 'talk' ? 0.8 : 1);

/** Edge opacity: the backbone (core and themes) reads a little stronger. */
export function edgeBase(sim: NetworkSim, e: number) {
  const k1 = sim.particles[sim.edges[e][0]].kind;
  const k2 = sim.particles[sim.edges[e][1]].kind;
  return k1 === 'core' || k2 === 'core' ? 0.55 : k1 === 'theme' || k2 === 'theme' ? 0.36 : 0.26;
}

export interface NetworkRenderer {
  resize(width: number, height: number, dpr: number): void;
  setPalette(p: Palette): void;
  /** Draws the last `sim.project(cx, cy, scale)` result. */
  render(sim: NetworkSim, cx: number, cy: number, scale: number): void;
  dispose(): void;
}
