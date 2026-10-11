# Motion & interaction pass: status

Brief: motion, interaction and showcase layout (sections 1–9). Content and data files stay untouched.
Note: the brief was referenced as `docs/PROMPT_2_motion_wow.md`, but that file isn't in the repo. The brief text from the task prompt is used instead.

Legend: ✅ done · 🟡 partly done · ⬜ not started

## 1. Hero: 3D research network ✅
- ✅ Network built from the data at build time (`scripts/research-graph-plugin.ts`, `lib/graph.ts`): themes, publications, projects, talks and co-authors, with real links
- ✅ Zellige 8-point star start → settles into the network, pulsing signals, slow rotation, cursor lean, hover labels ("… · n works")
- ✅ three.js on desktop (DPR ≤ 1.5), Canvas 2D on phones, lazy after first paint, paused off-screen or when the tab is hidden, static SVG for reduced motion
- ✅ Kinetic name (CSS line mask), staggered fade-up, arch portrait with curtain reveal and parallax, scroll cue
- Deviation: plain `three` instead of R3F (lighter). The name reveal uses a CSS mask, not SplitText, so the LCP text renders without waiting for JS. A custom `useGsap` hook replaces `@gsap/react`.

## 2. Numbers that move ✅
- ✅ `components/Figures.tsx`: count-up on enter, tabular numerals, the real value is pre-rendered for screen readers

## 3. Journey 1999 → 2026 ✅
- ✅ `components/Journey.tsx`: pinned horizontal scroll, a progress line, years that scale up, photos; a vertical version on mobile; a reduced-motion fallback

## 4. Global-impact globe ✅
- ✅ `components/globe/*`: cobe globe (auto-rotates, draggable, paused off-screen or when the tab is hidden, DPR ≤ 1.5, fewer map samples on phones), arcs from Ben Guerir with travelling pulses, the focused place's label
- ✅ Place list: hover/focus turns the globe to the place (the short way round), click shows its talks, positions, degrees, projects and training (staggered entry, `aria-live`)
- ✅ Wired into Home as section 02, after the Journey; the cobe chunk loads only within 500px of the viewport (≈ 8 KB gzip)
- ✅ Pre-rendered SVG fallback (graticule + arcs + places) shown until the first frame; reduced motion: no auto-rotation or pulses, the globe turns instantly to a selected place
- ✅ Home section numbering fixed (01 Journey → 05 Projects)

## 5. Research projects showcase ⬜
- Stacked sticky cards, 3D tilt (≤ 6°), sliding CTA, a case-study view with linked publications and partners

## 6. Publications & talks ⬜
- Venue marquee (pauses on hover), row hover (year shift, DOI ↗), framer-motion `layout` on filter, talks timeline drawing in, larger keynotes

## 7. "In the field" gallery ⬜
- Bento/masonry with photos from `lib/photos.ts`, per-column parallax, a lightbox (keyboard + swipe)

## 8. Micro-interactions 🟡
- ✅ `Magnetic` component (used on the hero CTAs only)
- ✅ Lenis smooth scroll synced with ScrollTrigger
- ⬜ Magnetic on the other primary buttons, animated underline links
- ⬜ Nav that hides on scroll down and shows on scroll up, a sliding active-section indicator
- ⬜ Route transitions (terracotta wipe, < 600 ms)
- ⬜ Custom cursor (desktop, fine pointer only)
- ⬜ Zellige divider that draws itself
- ⬜ Timetable: animated "now" line, blocks scale in

## 9. AI identity: "Ask about my research" assistant ⬜
- `fuse.js` is installed but unused. Needed: a floating button + panel, ⌘K / Ctrl+K, fuzzy search over all the content, a typed answer with citations, suggestion chips, EN/FR, a pluggable LLM endpoint behind a flag

## Final checks ⬜
- `npm run build` (SSG), reduced motion, keyboard, Lighthouse mobile
