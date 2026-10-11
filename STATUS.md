# Premium dark direction (branch `premium-dark`): status

New art direction: dark, cinematic, premium (depth, glass, glow). It replaces the earlier "paper / no glassmorphism / minimal" rules. Content, data files, routes, EmailJS, timetable logic, EN/FR and SEO pre-rendering are unchanged.

## Step 1: Home page ✅ (approved)
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
- ✅ CV PDF added (`public/CV_Aziz_Mimoudi_2026.pdf`): "Download CV" is the hero's primary button (checked: the file downloads, 552 KB)
- ✅ Review fixes: cursor hidden until the first mouse move and when the mouse leaves the window; dark scrim behind the hero quote; UNU Macau tile without photo (glow + giant "MACAU 2026"); Google Scholar 88 citations, October 2026 (single source: `content/profile.ts`, EN and FR); hero portrait alt text now describes the cut-out
- Shared pieces (header, cursor, dark default, tokens) already apply site-wide; inner pages keep their old layout until step 2

## Step 2: roll out to every page 🟡
### About ✅
- ✅ Dark hero: giant "About", the statement as a large serif-italic quote, the cut-out portrait with a glow (the header floats over it: `DARK_HERO_ROUTES` in `components/nav.ts`)
- ✅ Biography with researcher profiles as glass pills
- ✅ Experience: vertical timeline (`components/about/ExperienceTimeline.tsx`), scroll-progress line, dots that light up, each role an accordion card (place, period + duration, link), "Current" badge, logos on white tiles that glow on hover; research affiliations as glass cards
- ✅ Education (light section): Ph.D. featured with the thesis and DOI, Master's and Bachelor's cards, earlier diplomas small
- ✅ Supervision: people cards with initials avatars, topic, cohort, status
- ✅ Service (4 groups incl. peer review), Awards, Professional development: top 3 as highlight cards, "Show all (n)" reveals the rest as an animated list (`components/about/Showcase.tsx`)
- ✅ Beyond academia: bento with icons (Taekwondo 2nd Dan as the large tile)
- ✅ Reveals on every section; reduced motion: everything visible, timeline fully lit
- Shared: `components/SectionHeading.tsx` (numbered label + giant masked title), now used by Home and About

### Teaching, Publications, Talks, Contact ✅
- ✅ Shared: `components/PageHero.tsx` (dark hero, giant title rising line by line, sized so the longest word fits; header floats over it), `components/FilterChips.tsx` (glass track, amber pill that slides between options via framer-motion `layoutId`, `aria-pressed`), list items animate in/out on filter change (framer-motion `AnimatePresence` + `layout`, reduced motion respected via `MotionConfig`)
- ✅ Restyled shared classes: `.btn-solid` / `.btn-line` / `.btn-small` / `.chip` / `.field` / `.tag` (pill shapes, amber focus), `TimingTag` = glowing "Upcoming" badge, glass-style `Dialog`. The timetable picks these up; its logic is unchanged
- ✅ Publications: count-up metric glass cards in the hero, sticky glass filter bar (type chips, search, year), light reading area with giant year labels and hovering entries
- ✅ Talks: type chips in the hero; dark timeline whose rail draws itself on scroll, outlined giant years, glowing diamonds for upcoming talks, keynotes and panels as large cards
- ✅ Teaching: teaching statement as a serif-italic intro; courses in a light section (glass filter bar, list/grid toggle with animated layout, course dialog unchanged); timetable in a framed panel
- ✅ Contact: glass cards (email, address + map, profiles) and the form in a glass panel over a glow; magnetic glow "Send" button. EmailJS, cooldown and honeypot code untouched

## Step 3: a signature per page 🟡
Feedback: the pages felt like one template (dark opener + giant rising title + glass-card grids). Each page now gets its own opening and its own signature interaction; the design system (colours, type, nav, buttons, glass, glow) is shared.

| Page | Opening | Signature interaction | Status |
|---|---|---|---|
| Research | Interactive knowledge graph | Pinned split-screen case studies | ✅ awaiting review |
| Publications | Giant count-up + two journal marquees | Cursor-following preview on a typographic index | ✅ |
| Talks | Tour-poster stack of city names | Hover a city → photo + talks; ticket cards | ✅ |
| Teaching | Statement revealed word by word on scroll | Flip cards; timetable as a framed app | ⬜ |
| About | Magazine split: portrait + pull quote, drop cap | Horizontal draggable timeline or chapters | ⬜ |
| Contact | (kept as is) | Glass form over glow | ✅ |

### Research ✅ (awaiting review)
- Opening: full-screen knowledge graph (`components/research/ResearchMap.tsx`, `lib/research-map.ts`, d3-force): the 5 research themes from `content/projects.ts` as large glowing nodes, the 10 projects and 14 publications as smaller nodes, linked by the site's existing relations (`lib/related.ts`). Seeded layout, so the pre-rendered SVG matches the client. Nodes drift and shy away from the cursor; hover lights a node's links and dims the rest; clicking a theme filters the themes list and the projects below; clicking a project jumps to its case study. Paused off-screen. Note: the content defines 5 themes (not 7): employability/sustainability and inclusion/computational thinking are combined themes
- Themes: numbered editorial list; each title is also the (accessible) filter button; methods line
- Projects: pinned split screen (`components/research/ProjectCases.tsx`): sticky left half with the giant project name, status, period and budget counting up, plus a 01/10 side index; right half scrolls the case studies (context → role → outputs with linked publications and talks → partners). Every case has `#case-<id>` (the globe and the map land there)
- Phones: a tappable theme cloud instead of the graph; stacked case studies
- Reduced motion: static graph (hover and filter still work), no drift, no count-up

### Publications ✅
- Opening: the total in giant display type, counting up from zero on arrival (pre-rendered as the real number), with "Publications", the intro and the Scholar metrics beside it; two marquee rows scrolling in opposite directions with the journal and publisher names taken from the data, outlined and filled alternately (`components/publications/Marquee.tsx`; pause on hover; reduced motion: still, wrapping rows)
- Index (`components/publications/PubIndex.tsx`): one large row per work (number · year · title · venue); the row under the cursor stays bright while the others recede and the title slides; a dark glass preview card follows the cursor (type, year, venue, co-authors, DOI). Every row is a disclosure button that expands to the full APA reference with DOI, links and "Copy APA citation" (a card that follows the cursor can't hold a button, so copying is one click away in the row) — the touch, keyboard and screen-reader path too
- Filters (type chips, search, year) unchanged in behaviour; sticky from tablet up; rows animate in/out on filter

### Talks ✅
- Opening: a tour poster (`components/talks/TourPoster.tsx`): every city stacked in huge uppercase display type with its dates beside it, most recent first; bigger = more talks, capped so a name never exceeds its column (container query units). Cities are read from each talk's location (`lib/talk-cities.ts`; "Benguerir"/"Ben Guérir" merged). Hovering or focusing a city fades the others and shows its talks on the right, with a photo only where one was really taken there (Ben Guerir, Montréal). Click pins a city; on phones the talks open under it. One talk with no location and not online (ICAIR 2024) is not on the poster, but is in the list
- Keynotes and panels as tickets (`components/talks/Ticket.tsx`): amber date stub ("Admit one"), dashed tear line with two notches (CSS mask), talk on the main part; papers, workshops and sessions as compact rows. The type filter and animated filtering are kept. The vertical timeline is gone
- Reduced motion: no poster entrance, no ticket tilt

### Next ⬜
- Teaching, About (in this order), then sections 7, 9 and 8

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
