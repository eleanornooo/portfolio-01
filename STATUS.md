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
| Teaching | Statement revealed word by word on scroll | Flip cards; timetable as a framed app | ✅ |
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

### Review fixes (desktop + mobile check)
- A. Site-wide ✅
  - Light↔dark seams: the long 18rem fade and its terracotta glow are gone; sections meet with a short 4.5rem (72px) eased fade
  - Count-ups (Home figures, Publications total, Research budgets): the final value is the `aria-label`; animated digits are `aria-hidden`
  - Sticky filter bars (Publications, Talks, Teaching) use `.sticky-bar`: `top: calc(var(--nav-h) + 12px)`, from tablet up, so they always sit below the nav pill
  - `?noscroll` in the URL disables Lenis (native scroll) for automated checks; no visible change otherwise
- B. Home + About ✅
  - Highlights 2026: the six strongest tiles first (UNU Macau, Innov'EnsSup'26 keynote, Assistant Professor, Ph.D., QS judge, Quality & Quantity article); "See all highlights (11)" expands the other five with an animated stagger (and collapses them again)
  - Journey: the year strip now starts right under the intro (top-aligned pin) instead of being centred in a full-height band
  - About: its own pre-faded cut-out portrait (`public/about/aziz-about-cutout.webp`, 2048 px, edges already transparent, so no CSS mask), served as WebP 760/1100/2048 with a 1100 px PNG fallback (`<picture>`, width/height set, eager, high priority), flush with the section's bottom edge over a warm glow behind the head and shoulders; the Home hero portrait is unchanged. The original 16 MB PNG stays git-ignored and out of the build. Pull quote: the complete first sentence of the bio's last paragraph (twenty years in Moroccan classrooms, incl. Campus Victor Hugo), not the research statement used on Home
  - About experience: numbered chapters (01–08) that light up on scroll, light rows on hairlines, a card look only on the open row; the "Less than a year" duration is gone (just "2026–present")
- C. Research + Publications ✅
  - Research map: no more "…": project labels show in full (one line, or two balanced lines), publication titles show in full on hover (wrapped). A label that would cover a bubble on its right moves to the node's left. Themes sit on an arc that avoids the bottom-left, and a title force keeps every node and label out of the title/intro/legend box (`TITLE_ZONE`, measured from 1024×768 to 1920×1080), also while the map drifts live
  - Publications: the type chips are one row that scrolls sideways when it doesn't fit (`FilterChips scroll`, no scrollbar, soft right edge), so "Thesis" no longer wraps alone
- D. Talks ✅
  - One source of truth: the poster is now the navigator. Hover/focus a city → a small preview only (photo where one was taken there, "N talks · country", the latest title on one line); the right-hand panel that repeated the talks is gone. Selecting a city filters the list below and scrolls to it, with a "Showing: Rabat ×" chip; the type and city filters combine
  - Grouped entries (`lib/talk-cities.ts` `talkEntries`): "Recension des écrits…" (Sherbrooke Feb 2021 + Rabat Dec 2020) and "Impact de l'usage de l'intelligence artificielle…" (UM6P Jun 2021 + CRIFPE Apr 2021) are one entry each, "Presented at 2 venues", each venue listed with date, event, place and links; ROC 2021 stays separate. The Oct 2020 Al Akhawayn & UM6P conference is one entry with two roles (Speaker · Session chair — STEM Session). 21 talks → 18 entries; type counts are per entry
  - Cities: Cannexus 2023 marked virtual in the data and listed under "Online / virtual" (no more "Canada" on the poster); one spelling "Ben Guerir" in the talks and service data; virtual events keep their host city with a small "virtual" tag (Alicante, Ifrane); ICAIR 2024 stays off the poster (no location) but is in the list
  - Tickets: the stub shows the role ("Keynote speaker", "Panelist") instead of "Admit one"; one centred layout (day / month / year, or month / year); the stub no longer has a big empty band, and titles are a size smaller so tickets are shorter
  - One date format everywhere (poster, tickets, rows): "25–26 November 2026", "June 2026", "2–3 & 9 October 2020" (FR: "2–3 et 9 octobre 2020"; `dateLabel` is now localized)
  - "(UM6P login may be required)" is no longer text: links that may need a login show a lock with a tooltip (on hover and keyboard focus; the lock is labelled for screen readers), on every page
  - Phones: the poster shows the latest date and "+n" per city so names keep their size
- E. Teaching ✅ (Step 3 "Syllabus")
  - Note: `docs/PROMPT_4` is not in the repo; the Teaching spec from the step-3 brief was used
  - "Year not specified" is gone (nothing is shown when a course has no year)
  - Opening (`components/teaching/StatementReveal.tsx`): the teaching statement in large italic serif, revealed word by word as you scroll (each word goes from dim to bright; one CSS variable per scroll, opacity computed in CSS). On desktop the stage sticks for an extra screen so the words light up in place; on phones they light up as the text passes; the first words are lit on arrival. Reduced motion: all bright, no sticky stage
  - The right half of the opener: two photos of him teaching at UM6P, overlapping (the Now/Next chip was not used because the timetable still holds the sample schedule)
  - Courses as flip cards (`components/teaching/FlipCard.tsx`), the default view: front = the course code in giant type (EDU 704, CAES-PD008; the course number in outline when there is no code) + title + term; back (dark) = programme, level, term, up to four key topics and a "Details" button (the existing dialog). Turns on hover (mouse), on tap, and with Enter/Space (front is a button with aria-expanded; focus moves to the visible side; the hidden side is inert). Reduced motion: cross-fade. The list view stays one click away ("Cards / List")
  - Timetable as a dark framed app window (title bar with three dots, glow, deep shadow), dark in both themes (the `--tt-*` colours now also follow `.tone-dark`); the live "now" line glows and its dot breathes. Timetable logic unchanged (only class names added to the now-line)

### Next ⬜
- Section 8 (remaining micro-interactions), then final checks

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

## 7. "In the field" gallery ✅
- New About section right after the biography (no other About section changed): `components/about/FieldGallery.tsx`, data in `lib/gallery.ts`
- Seven real photos already in the assets (Science Week keynote and panels, teaching and a workshop at UM6P, the 2019 instructional-design conference); not used: the Home hero and About cut-outs, the campus and Montréal street photos. Captions: event · place · year, only from the site's data (Science Week = ISE symposium, February 2025, Ben Guerir, per talks.ts and service.ts; 2019 from the banner); the two UM6P teaching photos have no place/year in the data, so none is shown
- Asymmetric masonry: three columns of unequal width, the middle one set lower; each column drifts at its own speed while scrolling (GSAP scrub; desktop, motion allowed). Phones: two plain columns. WebP 640/1200 with width/height, lazy-loaded
- Lightbox (`components/about/Lightbox.tsx`, native `<dialog>`): ← / →, Esc, swipe on touch, focus trapped and returned to the photo, "n / 7" announced; reduced motion: no slide-in
- Note: `science-week-panel-a` has a Windows taskbar strip across its top (it is in the source image)

## 8. Micro-interactions 🟡
- ✅ `Magnetic` component (used on the hero CTAs only)
- ✅ Lenis smooth scroll synced with ScrollTrigger
- ⬜ Magnetic on the other primary buttons, animated underline links
- ⬜ Nav that hides on scroll down and shows on scroll up, a sliding active-section indicator
- ⬜ Route transitions (terracotta wipe, < 600 ms)
- ⬜ Custom cursor (desktop, fine pointer only)
- ⬜ Zellige divider that draws itself
- ⬜ Timetable: animated "now" line, blocks scale in

## 9. Research guide ("Ask about the research") ✅
- Floating button bottom-right (desktop: glass pill "Ask about the research ⌘K/Ctrl K"; phones: a round icon) and Ctrl/⌘+K open a slide-in glass panel (`components/ResearchGuide.tsx`, native modal `<dialog>`: page inert behind, Tab trapped, Esc closes, focus returns). Labelled "Research guide — answers from this site's content" (FR: "Guide de la recherche — réponses tirées du contenu de ce site")
- Engine (`lib/guide/engine.ts`, lazy chunk ≈12 KB gzipped, loaded on first open or on button hover): fuse.js over publications, projects, research themes, talks, courses, bio, positions and doctoral students; question words dropped (EN/FR), term-by-term scoring, a kind word ("projects", "talks"…) favours that kind, weak and random matches rejected ("I couldn't find anything…"). Composes a short answer (typed out; reduced motion: instant; screen readers get the full text once via a live region) and 2–4 linked result cards to the right page/anchor. Dedicated answers for upcoming talks (from today's date) and doctoral supervision
- Suggestion chips: What is AIA-PCEK? · Projects on inclusion · Upcoming talks · Ph.D. supervision (and the FR equivalents)
- LLM later (`lib/guide/provider.ts`): off by default; `VITE_ASSISTANT_LLM=on` + `VITE_ASSISTANT_ENDPOINT` (your own serverless function, which holds the key) lets it write the answer from the same local results; cards stay local; any error/timeout falls back to the local answer; a note then says the text is AI-written. No key in the repo (`.env.example` documents the two variables)
- Placement: below the custom cursor (z 40 vs 90), inside the safe area; on phones hidden over the first screen and while scrolling down; it steps aside whenever the contact form's Send button (`data-guide-avoid`) is on screen
- Also fixed: inside any modal dialog (course details, menu, lightbox, guide) the custom cursor was drawn under the top layer and the system cursor was hidden; the system cursor now returns while a modal is open

## Final checks ⬜
- `npm run build` (SSG), reduced motion, keyboard, Lighthouse mobile
