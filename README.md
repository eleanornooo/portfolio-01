# mimoudi.com

Academic website of **Dr. Aziz Mimoudi, Ph.D.** — Assistant Professor and Coordinator of the
Technopedagogy & AI Axis, Institute of Education Sciences (ISE), Mohammed VI Polytechnic
University (UM6P).

React 18 · Vite 5 · TypeScript · Tailwind CSS 3 · react-router 6 · **vite-react-ssg** (every page is
pre-rendered to static HTML) · deployed on Vercel.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173  (live reload)
npm run build      # type-check, pre-render all pages to dist/, write sitemap.xml
npm run preview    # serve dist/ at http://localhost:4173
npm run lint
```

Node 20 or newer is required.

## Where things are

```
src/content/      ← all the text of the site (edit these files)
  profile.ts        name, titles, bio (EN/FR), emails, links, citation metrics
  news.ts           "Highlights" on the home page
  publications.ts   bibliography (APA citations are generated automatically)
  talks.ts          keynotes, panels, papers, workshops
  projects.ts       funded projects, collaborations, research interests, methods
  courses.ts        courses + teaching statement
  timetable.ts      weekly timetable (fallback when no Google Sheet is configured)
  experience.ts     positions and research affiliations
  education.ts      degrees and professional development
  service.ts        boards, committees, peer review, conferences, institutional service
  awards.ts         awards and recognition
  students.ts       Ph.D. students
  beyond.ts         "Beyond academia"
  types.ts          the TypeScript types for all of the above
src/i18n/strings.ts ← interface text in English and French
src/pages/          one file per page (they only render the content files)
src/timetable/      timetable component, time-zone logic, CSV parser, .ics export
public/             static files (images, favicons, robots.txt, CV PDF)
assets-src/         original images; `npm run images` regenerates public/img
docs/               timetable CSV template, notes
```

**The next CV update only needs changes in `src/content/`.** TypeScript checks the shape of every
entry when you run `npm run build`, so a missing field or a typo in a type name is caught before
deployment.

---

## Updating content

Dates are written as `"2026"`, `"2026-04"` or `"2026-04-23"` — use the precision you actually know.
Anything dated in the future is labelled **Upcoming** automatically and the label disappears once
the date has passed (no need to edit it again).

Links that need a UM6P login (SharePoint / OneDrive) should be marked `restricted: true`; they are
shown as small secondary links with a lock icon.

### Add a publication — `src/content/publications.ts`

```ts
{
  id: 'mimoudi-2027-example',          // any unique id
  type: 'article',                     // article | chapter | proceedings | thesis | report
  authors: ['Mimoudi, A.', 'Bouabid, A.'],   // APA form; "Mimoudi, A." is set in bold
  year: 2027,                          // or 'in press'
  title: 'Title in sentence case',
  journal: 'Journal Name',             // articles
  volume: '12', issue: '3', pages: '1–20',
  doi: '10.1234/abcd.5678',            // without https://doi.org/
  links: [{ label: 'Preprint (SSRN)', url: 'https://…' }],   // optional extras
  selected: true,                      // optional: show on the home page
},
```

Book chapters use `container` (book title), `editors` (e.g. `'M. Lahby & Y. Maleh (Eds.)'`),
`chapter`, `pages` and `publisher`. The order of entries does not matter; the page sorts by year.
The "Copy APA citation" button and the type/year filters work from these fields.

### Add a talk — `src/content/talks.ts`

```ts
{
  id: 'rabat-2027',
  date: '2027-03-12',                  // endDate: '2027-03-13' for multi-day events
  type: 'Keynote',                     // Keynote | Panel | Oral | Workshop | Chair
  title: 'Title of the talk',          // optional — the event name is used if absent
  event: 'Name of the conference',
  location: 'Rabat, Morocco',
  virtual: false,
  links: [{ label: 'Video', url: 'https://…' }],
},
```

The "talks and keynotes" number on the home page counts the talks whose date has passed.

### Add a highlight / news item — `src/content/news.ts`

```ts
{
  id: 'award-2027',
  date: '2027-05',
  kind: 'Award',                       // Milestone | Talk | Publication | Award | Service | Teaching
  title: { en: 'English title', fr: 'Titre en français' },
  detail: { en: 'One line of context.', fr: 'Une ligne de contexte.' },   // optional
  url: 'https://…',                    // optional
},
```

### Add a course — `src/content/courses.ts`

```ts
{
  id: 'edu-801',
  code: 'EDU 801',
  title: 'Course title',
  programme: 'Ph.D. in Education, ISE – UM6P',
  level: 'Ph.D.',                      // Ph.D. | Master | Professional development | Teacher training
  years: ['2026–2027'],                // academic years — they feed the year filter
  term: 'Fall 2026',
  credits: '3',
  description: 'One or two sentences.',
  topics: ['Topic one', 'Topic two'],
  materialsUrl: 'https://…',           // only if it is a real, public link
},
```

There is deliberately no "marks" or "grades" link: student grades must never be public.

### Add a project — `src/content/projects.ts`

```ts
{
  id: 'new-project',
  title: 'Project title',
  summary: 'What the project does, in one or two sentences.',
  role: 'Co-coordinator',
  funder: 'Funding body',
  budget: 'MAD 1.2 million',           // as written in the CV
  period: '2027–2029',
  status: 'Pending',                   // Active | Completed | Pending
  group: 'funded',                     // funded | research | digital
  url: 'https://…',
},
```

### Timetable sessions — `src/content/timetable.ts`

Times are **Morocco time (Africa/Casablanca)**, 24-hour `HH:MM`. Each semester has a start and
end date, weekly sessions and exceptions (holidays or cancellations):

```ts
{
  id: 'spring-2027',
  name: 'Spring 2027',
  start: '2027-02-01',
  end: '2027-06-12',
  sessions: [
    {
      day: 'Mon', start: '10:00', end: '12:00',
      courseCode: 'EDU 704', title: 'Digitalization and AI in Education',
      type: 'Lecture',                 // Lecture | Seminar | Office hours | Supervision
      room: 'ISE room 2.14', programme: 'Ph.D. in Education',
      mode: 'On campus',               // On campus | Online
      link: 'https://teams…',          // optional, for online sessions
    },
  ],
  exceptions: [
    { date: '2027-03-30', label: 'Eid al-Fitr (public holiday)' },          // cancels everything
    { date: '2027-04-12', courseCode: 'EDU 704', label: 'Lecture cancelled' }, // one course only
  ],
},
```

If several semesters are listed, a semester switcher appears; the current semester (or the next
one) is selected automatically. With no sessions at all, the page shows "Timetable for the next
semester coming soon". Remove `sample: true` once the data is real — it shows a "sample schedule"
notice.

Visitors can switch between Morocco time and their own time zone, open a session for details, and
download an `.ics` file (one session, or the whole semester) that repeats weekly until the end of
the semester and skips the exception dates.

---

## Timetable from a Google Sheet (optional)

Aziz can maintain his timetable in a Google Sheet instead of editing code.

1. Start from [`docs/timetable-template.csv`](docs/timetable-template.csv)
   (File → Import in Google Sheets).
2. Keep **exactly these column headers** in the first row (any order):

   | Column | Example | Notes |
   |---|---|---|
   | `semester` | `Fall 2026` | Leave empty to repeat the value of the row above |
   | `semester_start` | `2026-09-14` | `YYYY-MM-DD` |
   | `semester_end` | `2027-01-15` | `YYYY-MM-DD` |
   | `day` | `Mon` | Mon–Sat, also `Monday` or French `Lundi` |
   | `start` | `10:00` | Morocco time, 24 h (`10h00` also works) |
   | `end` | `12:00` | |
   | `course_code` | `EDU 704` | |
   | `title` | `Digitalization and AI in Education` | |
   | `type` | `Lecture` | `Lecture`, `Seminar`, `Office hours` or `Supervision` |
   | `room` | `ISE room 2.14` | optional |
   | `programme` | `Ph.D. in Education` | optional |
   | `mode` | `On campus` | `On campus` or `Online` |
   | `link` | `https://…` | optional, must start with `https://` |
   | `exception_date` | `2026-11-06` | fill **only** on exception rows |
   | `exception_label` | `Green March Day` | |

   - A row with a `day` is a weekly session.
   - A row with an `exception_date` is a cancellation: for `course_code` only, or for every session
     when `course_code` is empty.
   - Invalid rows (unknown day, bad time…) are skipped rather than breaking the page.
3. **File → Share → Publish to web** → choose the sheet → **Comma-separated values (.csv)** →
   Publish, and copy the link (it looks like
   `https://docs.google.com/spreadsheets/d/e/…/pub?gid=0&single=true&output=csv`).
4. In Vercel → Project → Settings → Environment Variables, add
   `VITE_TIMETABLE_SHEET_CSV` = that link, then redeploy once.

From then on, edits to the sheet appear on the site within a few minutes (Google's publishing
delay) without a new deployment. The pre-rendered page and visitors whose request to Google fails
see the data from `src/content/timetable.ts`, so keep that file reasonably up to date. The page
shows "Live from Google Sheets" when the sheet was used.

---

## Environment variables

All optional — copy `.env.example` to `.env.local` for local development, and add them in Vercel
for production.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_EMAILJS_SERVICE_ID` | `service_srq3qjb` | EmailJS service used by the contact form |
| `VITE_EMAILJS_TEMPLATE_ID` | `template_ivo607f` | EmailJS template |
| `VITE_EMAILJS_PUBLIC_KEY` | `pd47JUs1ZBhhOIIan` | EmailJS public key (public by design) |
| `VITE_TIMETABLE_SHEET_CSV` | — | Published Google Sheet CSV for the timetable |

`VITE_` variables are embedded in the public JavaScript; never put a secret in them.

## Contact form (EmailJS)

The form sends `from_name`, `email_id`, `message` and `reply_to` (= the sender's email) to the
existing EmailJS template. Anti-spam: a hidden honeypot field, a minimum fill time and a 60-second
cooldown between messages from the same browser.

In the [EmailJS dashboard](https://dashboard.emailjs.com/):

1. **Email Templates → template_ivo607f → Settings**: set **Reply To** to `{{reply_to}}` so that
   "Reply" in Aziz's mailbox answers the visitor directly. The body can keep using
   `{{from_name}}`, `{{email_id}}` and `{{message}}`.
2. **Account → Security → Allowed origins**: add `https://www.mimoudi.com` and
   `https://mimoudi.com` (and `http://localhost:5173` while testing), so the public key cannot be
   reused from other sites.

## Images

Originals live in `assets-src/` (not deployed). After replacing one, run `npm run images` to
regenerate the WebP files in `public/img/` (portrait in three widths, grayscale institution logos)
and the monogram favicons. The share image `public/og-image.jpg` is designed in
`scripts/og-image.html` (render it at 1200×630 in a browser and export as JPEG).

## CV PDF

Put the public CV at `public/CV_Aziz_Mimoudi_2026.pdf` and rebuild — the **Download CV** button
appears automatically once the file exists. **Remove the private header first** (date of birth,
home address, personal phone). See `docs/CV-PDF.md`.

---

## Deploying on Vercel

The repository is ready for Vercel (`vercel.json`):

- Framework preset **Vite**, build command `npm run build`, output directory `dist`.
- `cleanUrls` serves `about.html` at `/about`; unknown URLs get `404.html`.
- Old URLs redirect permanently: `/skills` and `/projects` → `/research`, `/courses` → `/teaching`,
  `/timetable` → `/teaching#timetable`.
- Hashed assets in `/assets/` are cached for a year.

Steps:

1. Push the `redesign-2026` branch to the GitHub repository connected to Vercel. Note: the local
   `origin` remote still points to the original template (`eleanornooo/portfolio-01`); point it to
   your own repository first: `git remote set-url origin https://github.com/<you>/<repo>.git`.
2. Vercel builds a **preview deployment** for the branch — review it with Aziz.
3. Add the environment variables above if needed (Settings → Environment Variables).
4. Merge into `main` to deploy to production. Domains: `www.mimoudi.com` as primary, with
   `mimoudi.com` redirecting to it (the canonical URLs and sitemap use `https://www.mimoudi.com`).
5. After the first production deploy, submit `https://www.mimoudi.com/sitemap.xml` in Google Search
   Console and check the site with [PageSpeed Insights](https://pagespeed.web.dev/).

## Accessibility and quality notes

- Landmarks, a skip link, visible focus, keyboard-operable filters, tabs and dialogs (native
  `<dialog>`: focus stays inside, Esc closes, focus returns to the trigger).
- Colours meet WCAG AA in light and dark themes; motion is limited to a short fade on scroll and is
  disabled with `prefers-reduced-motion`.
- Language (EN/FR) and theme choices are stored in `localStorage` when available; pages are
  pre-rendered in English and switch after loading.
