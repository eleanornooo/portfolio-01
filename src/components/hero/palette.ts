import type { NetworkSim } from './network-sim';

export type RGB = [number, number, number];

export interface Palette {
  ink: RGB;
  ink3: RGB;
  accent: RGB;
  vivid: RGB;
  amber: RGB;
}

/** Reads the colour tokens in effect on `el` (the hero is always dark) as 0–1 RGB. */
export function readPalette(el: Element = document.documentElement): Palette {
  const css = getComputedStyle(el);
  const get = (name: string): RGB => {
    const [r, g, b] = css.getPropertyValue(`--${name}`).trim().split(/\s+/).map(Number);
    return [r / 255, g / 255, b / 255];
  };
  return { ink: get('ink'), ink3: get('ink-3'), accent: get('accent'), vivid: get('accent-vivid'), amber: get('amber') };
}

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
