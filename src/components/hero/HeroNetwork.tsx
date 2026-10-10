import { useEffect, useRef, useState, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { nodeText, type GraphNode } from '../../lib/graph';
import { useLang } from '../../i18n/useLang';
import { isLiteDevice, prefersReducedMotion, whenIdle } from '../../lib/motion';
import type { NetworkRenderer } from './palette';

/** Network radius relative to the stage width. Mirrors .hero-poster in index.css. */
const RADIUS = 0.5;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * The animated research network behind the hero. Loaded after the first paint (the
 * pre-rendered SVG poster stands in until then), centred on the portrait, paused when
 * off-screen or in a background tab, and never started with reduced motion.
 */
export default function HeroNetwork({
  heroRef,
  anchorRef,
  onLive,
}: {
  heroRef: RefObject<HTMLElement>;
  anchorRef: RefObject<HTMLElement>;
  onLive: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<GraphNode | null>(null);
  const { lang } = useLang();
  const navigate = useNavigate();
  const nav = useRef(navigate);
  nav.current = navigate;
  const live = useRef(onLive);
  live.current = onLive;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const hero = heroRef.current;
    const anchor = anchorRef.current;
    const canvas = canvasRef.current;
    if (!hero || !anchor || !canvas) return;

    let disposed = false;
    let teardown = () => {};

    const start = async () => {
      const lite = isLiteDevice() || !webglAvailable();
      const [{ NetworkSim }, { readPalette }, mod] = await Promise.all([
        import('./network-sim'),
        import('./palette'),
        lite ? import('./render-2d') : import('./render-three'),
      ]);
      if (disposed) return;
      const sim = new NetworkSim({ lite });
      let renderer: NetworkRenderer;
      try {
        renderer =
          'createThreeRenderer' in mod ? mod.createThreeRenderer(canvas, sim) : mod.createCanvasRenderer(canvas);
      } catch {
        return; // keep the poster
      }
      renderer.setPalette(readPalette());
      const sizeScale = lite ? 0.85 : 1;
      for (const p of sim.particles) p.size *= sizeScale;

      // ---- geometry
      let cx = 0;
      let cy = 0;
      let scale = 300;
      let heroRect = hero.getBoundingClientRect();
      const measure = () => {
        heroRect = hero.getBoundingClientRect();
        const a = anchor.getBoundingClientRect();
        cx = a.left + a.width / 2 - heroRect.left;
        cy = a.top + a.height / 2 - heroRect.top;
        scale = a.width * RADIUS;
      };
      const resize = () => {
        const r = hero.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 1.5);
        renderer.resize(r.width, r.height, dpr);
        measure();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(hero);

      // ---- pointer
      let hovered = -1;
      let tapTimer = 0;
      const setHovered = (i: number) => {
        if (i === hovered) return;
        hovered = i;
        sim.hovered = i;
        setHover(i >= 0 ? sim.particles[i].node : null);
        hero.style.cursor = i >= 0 ? 'pointer' : '';
      };
      const local = (e: PointerEvent) => ({ x: e.clientX - heroRect.left, y: e.clientY - heroRect.top });
      const onMove = (e: PointerEvent) => {
        if (e.pointerType === 'touch') return;
        const { x, y } = local(e);
        sim.setPointer((x - cx) / scale, -(y - cy) / scale);
        const overUi = (e.target as Element).closest('a, button, input, [data-no-network]');
        setHovered(overUi ? -1 : sim.hitTest(x, y, sizeScale));
      };
      const onLeave = () => {
        sim.setPointer(null);
        setHovered(-1);
      };
      const onDown = (e: PointerEvent) => {
        if (e.pointerType !== 'touch' || (e.target as Element).closest('a, button')) return;
        const { x, y } = local(e);
        const i = sim.hitTest(x, y, sizeScale);
        setHovered(i);
        window.clearTimeout(tapTimer);
        if (i >= 0) tapTimer = window.setTimeout(() => setHovered(-1), 2600);
      };
      const onClick = (e: MouseEvent) => {
        if (hovered < 0 || (e.target as Element).closest('a, button')) return;
        const node = sim.particles[hovered].node;
        if (node && !lite) nav.current(node.href);
      };
      hero.addEventListener('pointermove', onMove);
      hero.addEventListener('pointerleave', onLeave);
      hero.addEventListener('pointerdown', onDown);
      hero.addEventListener('click', onClick);

      // ---- theme changes
      const mo = new MutationObserver(() => renderer.setPalette(readPalette()));
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

      // ---- loop, paused when off-screen or hidden
      let raf = 0;
      let last = 0;
      let visible = true;
      let first = true;
      const frame = (now: number) => {
        raf = 0;
        const dt = last ? (now - last) / 1000 : 0.016;
        last = now;
        measure();
        sim.update(dt);
        sim.project(cx, cy, scale);
        renderer.render(sim, cx, cy, scale);
        const tip = tipRef.current;
        if (hovered >= 0 && tip) {
          const x = sim.proj.x[hovered];
          const y = sim.proj.y[hovered];
          // Flip to the left of the node near the right edge.
          const dx = x + tip.offsetWidth + 24 > heroRect.width ? -tip.offsetWidth - 16 : 16;
          tip.style.transform = `translate3d(${(x + dx).toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        }
        if (first) {
          first = false;
          live.current();
        }
        schedule();
      };
      const schedule = () => {
        if (!raf && visible && document.visibilityState === 'visible') raf = requestAnimationFrame(frame);
      };
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        last = 0;
        schedule();
      });
      io.observe(hero);
      const onVis = () => {
        last = 0;
        schedule();
      };
      document.addEventListener('visibilitychange', onVis);
      schedule();

      teardown = () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(tapTimer);
        io.disconnect();
        ro.disconnect();
        mo.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        hero.removeEventListener('pointermove', onMove);
        hero.removeEventListener('pointerleave', onLeave);
        hero.removeEventListener('pointerdown', onDown);
        hero.removeEventListener('click', onClick);
        hero.style.cursor = '';
        renderer.dispose();
      };
    };

    const cancelIdle = whenIdle(() => void start(), 1500);
    return () => {
      disposed = true;
      cancelIdle();
      teardown();
    };
  }, [heroRef, anchorRef]);

  const text = hover ? nodeText(hover, lang) : null;

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="hero-canvas pointer-events-none absolute inset-0 h-full w-full" />
      <div
        ref={tipRef}
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-30 transition-opacity duration-200 ${text ? 'opacity-100' : 'opacity-0'}`}
      >
        {text && (
          <div className="-translate-y-1/2 whitespace-nowrap rounded-[3px] border border-rule bg-paper/95 px-3 py-2 shadow-[0_12px_30px_-14px_rgb(0_0_0/0.35)] backdrop-blur-sm">
            <p className="label text-[0.625rem] text-accent">{text.kind}</p>
            <p className="max-w-[18rem] truncate font-serif text-[0.9375rem] leading-snug text-ink">{text.title}</p>
            {text.detail && <p className="num text-[0.8125rem] text-ink2">{text.detail}</p>}
          </div>
        )}
      </div>
    </>
  );
}
