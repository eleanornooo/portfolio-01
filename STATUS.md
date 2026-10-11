# Premium dark direction (branch `premium-dark`): status

New art direction: dark, cinematic, premium (depth, glass, glow). It replaces the earlier "paper / no glassmorphism / minimal" rules. Content, data files, routes, EmailJS, timetable logic, EN/FR and SEO pre-rendering are unchanged.

## Step 1: Home page ✅ (awaiting review)
- ✅ Tokens: near-black ink `#0A0B0F`, lighter card surface, warm off-white text, terracotta `#E2572B` → amber `#F59E3B` used as glow. Dark is the default theme; the light toggle is kept. `.tone-dark` / `.tone-light` / `.tone-inverse` scopes; eased `blend-*` fades with a warm seam between dark and light sections
- ✅ Film-grain overlay, `.glass` (blur, 1px light border, inner highlight), `.glass-nav`, `.card-dark` + `.spot` (glow follows the cursor), `.btn-glow` / `.btn-ghost`
- ✅ Type: Bricolage Grotesque (display, weight axis only, ≈41 KB, preloaded) + Fraunces (now with real italics) + IBM Plex Sans; `.eyebrow` labels with wide tracking
- ✅ Hero: giant "MIMOUDI" (SVG, fills the width, gradient fade) behind the cut-out portrait, a faint outline of the word in front; glassy 3D spheres (MeshPhysicalMaterial: transmission glass with an ember for the core and themes, clear-coated beads for works), glowing links, signals, halos; zellige → network intro ≈1.5 s; mouse parallax on 3 depths; scroll depth (word, network, portrait and card move at different speeds; the network turns); glass card with name, title and CTAs
- ✅ Cut-out: `public/hero/aziz-cutout.png` (16 MB, gitignored, removed from `dist`) → `npm run images:hero` → `public/img/hero/aziz-cutout-{480,760,1100}.webp` (27–98 KB)
- ✅ Numbers: glass cards over a drifting glow, count-up in the display face, lift + cursor glow on hover
- ✅ Highlights 2026: bento grid (UNU Macau feature tile with photo, QS judge and Ph.D. wide tiles), dark cards, glowing "Upcoming" badges
- ✅ Selected publications and current projects: light sections for rhythm
- ✅ Journey: dark, giant outlined years that fill with the amber gradient as they become active, tilted photos
- ✅ Globe: dark globe, amber dots, glowing arcs and pulses, deep glow, place list in a glass panel
- ✅ Contact: "Let's work together" / "Travaillons ensemble" in the display face, big magnetic glow button
- ✅ Interaction: Lenis everywhere (already), `data-reveal` mask / up / stagger reveals (`lib/reveal.ts`), custom cursor (dot + ring, `mix-blend-mode: difference`, desktop only), magnetic buttons, nav that becomes a glass pill on scroll
- ✅ Reduced motion: static network poster, no reveals, no parallax, no cursor; content is never hidden without JS
- ✅ Phones: Canvas 2D glass-bead network (no three.js), lighter visuals
- Measured (throttled mobile: 4× CPU, slow 4G, Chrome): FCP ≈0.6 s, LCP ≈2.15 s (the cut-out), TBT ≈270 ms, CLS 0, 678 KB. The Lighthouse CLI does not run under the local Node 22.15, so this is a manual measurement, not an official score
- Note: "Download CV" appears (as the primary button) only once `public/CV_Aziz_Mimoudi_2026.pdf` exists; until then the primary is "Explore the research" and the ghost is "Write to Aziz"
- Shared pieces (header, cursor, dark default, tokens) already apply site-wide; inner pages keep their old layout until step 2

## Step 2: roll out to every page ⬜ (after Home is approved)
- About redesign: statement hero + portrait, interactive experience timeline, education cards, supervision people cards, top-3 highlights with "Show all", "Beyond academia" bento
- Teaching, Publications, Talks, Contact in the same system
- Then sections 5–9 below, in the new style

---

# Motion & interaction pass (previous brief): status

Sections 5–9 are **paused**; they will be built in the premium dark style after step 2.

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
