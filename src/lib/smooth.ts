// Smooth scrolling (Lenis) driven by GSAP's ticker, so ScrollTrigger and Lenis share one clock.
// Skipped entirely when the visitor prefers reduced motion, or when the URL has ?noscroll
// (for automated checks): the page then scrolls natively.
import type Lenis from 'lenis';
import { loadGsap } from './gsap';
import { prefersReducedMotion } from './motion';

let lenis: Lenis | null = null;
let locks = 0;

export const getLenis = () => lenis;

export async function startSmoothScroll(): Promise<() => void> {
  if (prefersReducedMotion() || lenis || new URLSearchParams(window.location.search).has('noscroll')) return () => {};
  const [{ default: LenisCtor }, { gsap, ScrollTrigger }] = await Promise.all([import('lenis'), loadGsap()]);
  if (lenis) return () => {};
  const instance = new LenisCtor({ lerp: 0.11, smoothWheel: true, anchors: { offset: -88 } });
  lenis = instance;
  if (locks > 0) instance.stop();
  instance.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => instance.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    instance.destroy();
    lenis = null;
  };
}

/** Freezes page scrolling while a modal panel is open (nested calls are counted). */
export function lockScroll(lock: boolean) {
  locks = Math.max(0, locks + (lock ? 1 : -1));
  const locked = locks > 0;
  document.documentElement.style.overflow = locked ? 'hidden' : '';
  if (locked) lenis?.stop();
  else lenis?.start();
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

export function scrollToElement(el: HTMLElement) {
  if (lenis) lenis.scrollTo(el, { offset: -88, force: true });
  else el.scrollIntoView();
}
