// GSAP is loaded on demand, in its own chunk, after the first interaction (everything it
// drives is below the fold or tied to scrolling): keeping its ~50 KB (gzip)
// off the critical path matters more for phones than starting animations a few ms earlier.
// `useGsap` gives the same guarantees as @gsap/react's useGSAP: everything created inside
// the setup function (tweens, ScrollTriggers, SplitText) is reverted on unmount.
import { useEffect, useRef, type DependencyList, type RefObject } from 'react';
import { firstInteraction } from './motion';

type GsapCore = typeof import('gsap').gsap;
type ScrollTriggerT = typeof import('gsap/ScrollTrigger').ScrollTrigger;
type SplitTextT = typeof import('gsap/SplitText').SplitText;

export interface Gsap {
  gsap: GsapCore;
  ScrollTrigger: ScrollTriggerT;
  SplitText: SplitTextT;
}

let loading: Promise<Gsap> | null = null;
let loaded: Gsap | null = null;

export function loadGsap(): Promise<Gsap> {
  if (!loading) {
    loading = firstInteraction().then(() => Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/SplitText')]).then(
      ([g, st, sp]) => {
        g.gsap.registerPlugin(st.ScrollTrigger, sp.SplitText);
        loaded = { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger, SplitText: sp.SplitText };
        return loaded;
      },
    ));
  }
  return loading;
}

/** GSAP if it has already been loaded (for event handlers), else null. */
export const gsapNow = () => loaded;

/**
 * Runs `setup` inside a gsap.context scoped to `scope` once GSAP has loaded, and reverts
 * it on unmount or when `deps` change. `setup` may return its own cleanup.
 */
export function useGsap(
  setup: (m: Gsap) => void | (() => void),
  scope: RefObject<Element>,
  deps: DependencyList = [],
) {
  const fn = useRef(setup);
  fn.current = setup;
  useEffect(() => {
    let cancelled = false;
    let ctx: ReturnType<GsapCore['context']> | null = null;
    loadGsap().then((m) => {
      if (cancelled || !scope.current) return;
      ctx = m.gsap.context(() => fn.current(m), scope.current);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
