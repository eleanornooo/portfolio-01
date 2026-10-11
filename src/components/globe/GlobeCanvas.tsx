import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import type { Place } from '../../lib/places';
import { arc, facing, nearestAngle, rotate, toScreen, toVec, visible, type Vec3 } from './globe-math';

type RGB = [number, number, number];

function themeColors() {
  const css = getComputedStyle(document.documentElement);
  const get = (n: string): RGB => css.getPropertyValue(`--${n}`).trim().split(/\s+/).map((v) => Number(v) / 255) as RGB;
  const dark = document.documentElement.dataset.theme === 'dark';
  return {
    dark,
    base: dark ? get('ink-3') : get('paper-2'),
    glow: dark ? get('paper-2') : get('paper'),
    marker: get('accent-vivid'),
    ink: get('ink'),
    accent: get('accent-vivid'),
  };
}

const rgba = ([r, g, b]: RGB, a: number) => `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`;

/**
 * The cobe globe (auto-rotating, draggable) with an overlay that draws arcs from the home
 * base to every place, pulses travelling along them, and the focused place's label.
 */
export default function GlobeCanvas({
  places,
  focusId,
  reduced,
  lite,
  onReady,
}: {
  places: Place[];
  focusId: string | null;
  reduced: boolean;
  lite: boolean;
  onReady: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const overlay = useRef<HTMLCanvasElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const focus = useRef(focusId);
  focus.current = focusId;
  const ready = useRef(onReady);
  ready.current = onReady;

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    const ov = overlay.current;
    if (!el || !cv || !ov) return;
    const ctx = ov.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let size = el.clientWidth;

    const home = places.find((p) => p.home) ?? places[0];
    const vecs = new Map(places.map((p) => [p.id, toVec(p.lat, p.lon)]));
    const arcs = places.filter((p) => p !== home).map((p) => ({ id: p.id, pts: arc(vecs.get(home.id)!, vecs.get(p.id)!) }));

    // Start over the Atlantic: Morocco and Canada both in view.
    const start = facing(40, -38);
    let phi = start.phi;
    let theta = start.theta;
    let colors = themeColors();
    let drag: { x: number; y: number; phi: number; theta: number } | null = null;
    let manual = false; // the visitor turned the globe: stop auto-rotation until a place is focused
    let lastFocus: string | null = null;
    let time = 0;
    let first = true;

    const sizeCanvases = () => {
      size = el.clientWidth;
      ov.width = Math.round(size * dpr);
      ov.height = Math.round(size * dpr);
    };
    sizeCanvases();

    const drawOverlay = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      const f = focus.current;
      arcs.forEach((a, i) => {
        const hot = a.id === f;
        const view = a.pts.map((p) => rotate(p, phi, theta));
        ctx.lineWidth = hot ? 1.8 : 1;
        ctx.strokeStyle = hot ? rgba(colors.accent, 0.95) : rgba(colors.ink, colors.dark ? 0.45 : 0.32);
        ctx.setLineDash(hot || reduced ? [] : [3, 4]);
        ctx.lineDashOffset = reduced ? 0 : -time * 18;
        ctx.beginPath();
        let pen = false;
        view.forEach((v) => {
          if (!visible(v)) {
            pen = false;
            return;
          }
          const [x, y] = toScreen(v, size);
          if (pen) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
          pen = true;
        });
        ctx.stroke();
        // A pulse travels from home to the place.
        if (!reduced) {
          const t = (time * 0.22 + i * 0.17) % 1;
          const k = t * (view.length - 1);
          const j = Math.floor(k);
          const v = view[j];
          const w = view[Math.min(view.length - 1, j + 1)];
          const p: Vec3 = [v[0] + (w[0] - v[0]) * (k - j), v[1] + (w[1] - v[1]) * (k - j), v[2] + (w[2] - v[2]) * (k - j)];
          if (visible(p)) {
            const [x, y] = toScreen(p, size);
            ctx.setLineDash([]);
            ctx.fillStyle = rgba(colors.accent, Math.sin(Math.PI * t));
            ctx.beginPath();
            ctx.arc(x, y, hot ? 3 : 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
      // Label for the focused place.
      const lbl = label.current;
      if (lbl) {
        const p = f ? vecs.get(f) : undefined;
        const v = p && rotate(p, phi, theta);
        if (v && v[2] > 0.05) {
          const [x, y] = toScreen(v, size);
          lbl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
          lbl.style.opacity = '1';
        } else lbl.style.opacity = '0';
      }
    };

    const globe = createGlobe(cv, {
      devicePixelRatio: dpr,
      width: size * dpr,
      height: size * dpr,
      phi,
      theta,
      dark: colors.dark ? 1 : 0,
      diffuse: colors.dark ? 1.4 : 1.1,
      mapSamples: lite ? 9000 : 16000,
      mapBrightness: colors.dark ? 4.5 : 7,
      mapBaseBrightness: 0,
      baseColor: colors.base,
      markerColor: colors.marker,
      glowColor: colors.glow,
      markers: [],
      onRender: (state) => {
        time += 1 / 60;
        const f = focus.current;
        if (f !== lastFocus) {
          lastFocus = f;
          if (f) manual = false;
        }
        if (f && !drag && !manual) {
          const place = places.find((p) => p.id === f)!;
          const target = facing(place.lat, place.lon);
          const tp = nearestAngle(phi, target.phi);
          const k = reduced ? 1 : 0.075;
          phi += (tp - phi) * k;
          theta += (target.theta - theta) * k;
        } else if (!drag && !manual && !reduced) {
          phi += 0.0024;
          theta += (0.3 - theta) * 0.02;
        }
        state.phi = phi;
        state.theta = theta;
        state.width = size * dpr;
        state.height = size * dpr;
        state.dark = colors.dark ? 1 : 0;
        state.baseColor = colors.base;
        state.glowColor = colors.glow;
        state.markerColor = colors.marker;
        state.mapBrightness = colors.dark ? 4.5 : 7;
        state.markers = places.map((p) => ({
          location: [p.lat, p.lon] as [number, number],
          size: p.id === f ? 0.1 : p.home ? 0.075 : 0.05,
        }));
        drawOverlay();
        if (first) {
          first = false;
          ready.current();
        }
      },
    });

    // ---- drag to turn
    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, y: e.clientY, phi, theta };
      manual = true;
      cv.setPointerCapture(e.pointerId);
      cv.style.cursor = 'grabbing';
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      phi = drag.phi + ((e.clientX - drag.x) / size) * Math.PI;
      theta = Math.max(-0.8, Math.min(0.8, drag.theta + ((e.clientY - drag.y) / size) * 1.6));
    };
    const up = () => {
      drag = null;
      cv.style.cursor = '';
    };
    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);

    // ---- pause off-screen / hidden, follow theme and size
    let onScreen = true;
    const sync = () => globe.toggle(onScreen && document.visibilityState === 'visible');
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener('visibilitychange', sync);
    const mo = new MutationObserver(() => (colors = themeColors()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const ro = new ResizeObserver(sizeCanvases);
    ro.observe(el);

    return () => {
      globe.destroy();
      io.disconnect();
      mo.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', sync);
      cv.removeEventListener('pointerdown', down);
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerup', up);
      cv.removeEventListener('pointercancel', up);
    };
  }, [places, reduced, lite]);

  const focused = places.find((p) => p.id === focusId);

  return (
    <div ref={wrap} className="absolute inset-0">
      <canvas
        ref={canvas}
        aria-hidden="true"
        className="h-full w-full cursor-grab touch-pan-y"
        style={{ contain: 'layout paint size' }}
      />
      <canvas ref={overlay} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
      <span
        ref={label}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 whitespace-nowrap opacity-0 transition-opacity duration-300"
      >
        {focused && (
          <span className="ml-3 inline-block -translate-y-1/2 rounded-[3px] bg-ink px-2 py-1 text-[0.8125rem] text-paper shadow-sm">
            {focused.name}
          </span>
        )}
      </span>
    </div>
  );
}
