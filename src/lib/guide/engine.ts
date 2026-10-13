// The research guide's local engine: a fuzzy index (fuse.js) over the site's content files,
// and a small composer that turns the best matches into a short answer with linked results.
// Loaded on demand (dynamic import) the first time the guide opens.
import Fuse from 'fuse.js';
import { profile } from '../../content/profile';
import { publications } from '../../content/publications';
import { projects, researchInterests } from '../../content/projects';
import { talks } from '../../content/talks';
import { courses } from '../../content/courses';
import { students } from '../../content/students';
import { positions } from '../../content/experience';
import type { Lang } from '../../content/types';
import { byDateDesc, formatDate, timing } from '../dates';
import type { GuideAnswer, GuideResult, ResultKind } from './types';

interface Doc extends GuideResult {
  /** Searchable text (not shown). */
  text: string;
  /** Sort key for "newest first" where it applies. */
  date?: string;
}

const T = {
  en: {
    noMatch: (q: string) =>
      `I couldn’t find anything about “${q}” on this site. Try a topic (generative AI, inclusion, teacher education), a project name or a year.`,
    intro: (q: string) => `Here is what this site says about “${q}”.`,
    alsoSee: (parts: string[]) => `Related on the site: ${parts.join(', ')}.`,
    count: { publication: ['publication', 'publications'], project: ['project', 'projects'], talk: ['talk', 'talks'], course: ['course', 'courses'], theme: ['research theme', 'research themes'], profile: ['profile entry', 'profile entries'], supervision: ['doctoral student', 'doctoral students'] } as Record<ResultKind, [string, string]>,
    upcoming: (n: number, list: string) =>
      n ? `${n === 1 ? 'One upcoming talk' : `${n} upcoming talks`}: ${list}.` : 'No upcoming talks are listed right now; the latest ones are below.',
    supervision: (n: number, list: string) => `He co-supervises ${n} Ph.D. students at ISE – UM6P: ${list}.`,
    defined: (title: string, venue: string) => `${title}${venue ? ` (${venue})` : ''}.`,
    fromBio: 'From the biography:',
  },
  fr: {
    noMatch: (q: string) =>
      `Je n’ai rien trouvé sur « ${q} » dans ce site. Essayez un thème (IA générative, inclusion, formation des enseignants), un nom de projet ou une année.`,
    intro: (q: string) => `Voici ce que ce site dit de « ${q} ».`,
    alsoSee: (parts: string[]) => `À voir aussi sur le site : ${parts.join(', ')}.`,
    count: { publication: ['publication', 'publications'], project: ['projet', 'projets'], talk: ['conférence', 'conférences'], course: ['cours', 'cours'], theme: ['thème de recherche', 'thèmes de recherche'], profile: ['élément du profil', 'éléments du profil'], supervision: ['doctorant', 'doctorants'] } as Record<ResultKind, [string, string]>,
    upcoming: (n: number, list: string) =>
      n
        ? `${n === 1 ? 'Une conférence à venir' : `${n} conférences à venir`} : ${list}.`
        : 'Aucune conférence à venir n’est annoncée pour l’instant ; les plus récentes sont ci-dessous.',
    supervision: (n: number, list: string) => `Il codirige ${n} doctorants à l’ISE – UM6P : ${list}.`,
    defined: (title: string, venue: string) => `${title}${venue ? ` (${venue})` : ''}.`,
    fromBio: 'D’après la biographie :',
  },
};

const firstSentence = (s: string) => s.split(/(?<=[.!?])\s/)[0];

function buildDocs(lang: Lang): Doc[] {
  const docs: Doc[] = [];
  for (const p of publications) {
    const venue = p.journal ?? p.container ?? p.publisher ?? '';
    docs.push({
      id: `pub-${p.id}`,
      kind: 'publication',
      title: p.title,
      meta: [venue, String(p.year)].filter(Boolean).join(' · '),
      href: '/publications',
      text: [p.title, venue, p.publisher, p.description, p.authors.join(' '), p.year].filter(Boolean).join(' '),
      date: String(p.year === 'in press' ? 9999 : p.year),
    });
  }
  for (const p of projects) {
    docs.push({
      id: `project-${p.id}`,
      kind: 'project',
      title: p.short ?? p.title,
      meta: [p.status, p.period].join(' · '),
      href: `/research#case-${p.id}`,
      summary: p.summary,
      text: [p.title, p.short, p.summary, p.role, p.funder, p.coordinator, p.period].filter(Boolean).join(' '),
    });
  }
  researchInterests.forEach((r, i) =>
    docs.push({
      id: `theme-${i}`,
      kind: 'theme',
      title: r.title[lang],
      meta: '',
      href: '/research#interests',
      summary: firstSentence(r.body[lang]),
      text: [r.title.en, r.title.fr, r.body.en, r.body.fr].join(' '),
    }),
  );
  for (const t of talks) {
    docs.push({
      id: `talk-${t.id}`,
      kind: 'talk',
      title: t.title ?? t.event,
      meta: [t.dateLabel?.[lang] ?? formatDate(t.date, lang, t.endDate), t.location].filter(Boolean).join(' · '),
      href: '/talks',
      text: [t.title, t.event, t.location, t.type, t.note, t.date].filter(Boolean).join(' '),
      date: t.date,
    });
  }
  for (const c of courses) {
    docs.push({
      id: `course-${c.id}`,
      kind: 'course',
      title: c.code ? `${c.code} — ${c.title}` : c.title,
      meta: [c.level, c.term ?? c.years.join(', ')].filter(Boolean).join(' · '),
      href: '/teaching#courses',
      summary: firstSentence(c.description),
      text: [c.code, c.title, c.programme, c.level, c.description, ...(c.topics ?? [])].filter(Boolean).join(' '),
    });
  }
  profile.bio[lang].forEach((para, i) =>
    docs.push({
      id: `bio-${i}`,
      kind: 'profile',
      title: `${profile.honorific} ${profile.name}`,
      meta: profile.title[lang],
      href: '/about',
      summary: firstSentence(para),
      text: para,
    }),
  );
  for (const p of positions) {
    docs.push({
      id: `pos-${p.id}`,
      kind: 'profile',
      title: p.role,
      meta: [p.org, p.periodLabel ?? `${p.start}–${p.end ?? ''}`].join(' · '),
      href: '/about#experience',
      text: [p.role, p.org, p.place, p.note].filter(Boolean).join(' '),
    });
  }
  for (const s of students) {
    docs.push({
      id: `student-${s.name}`,
      kind: 'supervision',
      title: s.name,
      meta: `${s.topic} · ${s.cohort}`,
      href: '/about#supervision',
      text: [s.name, s.topic, s.cohort, s.status, 'supervision doctoral Ph.D. student doctorant encadrement codirection'].join(' '),
    });
  }
  return docs;
}

const cache = new Map<Lang, { docs: Doc[]; fuse: Fuse<Doc> }>();
function index(lang: Lang) {
  let ix = cache.get(lang);
  if (!ix) {
    const docs = buildDocs(lang);
    ix = {
      docs,
      fuse: new Fuse(docs, {
        keys: [
          { name: 'title', weight: 3 },
          { name: 'text', weight: 1 },
        ],
        includeScore: true,
        ignoreLocation: true,
        // Long summaries must not score worse than short titles for the same word.
        ignoreFieldNorm: true,
        threshold: 0.3,
        minMatchCharLength: 2,
      }),
    };
    cache.set(lang, ix);
  }
  return ix;
}

/** Words that carry no topic (EN/FR question words and fillers). */
const STOP = new Set(
  'what which who whom whose when where why how is are was were the a an of on in on about for to and or with his he does do did any there tell me show list give site research aziz mimoudi dr que quoi qui quel quelle quels quelles est sont le la les un une des du de sur pour et ou avec ses il son sa dans au aux moi montre liste qu est-ce ce cest est-il quoi quels cela'.split(' '),
);
/** A kind word in the question favours results of that kind. */
const KIND_WORDS: [RegExp, ResultKind][] = [
  [/^(projects?|projets?)$/, 'project'],
  [/^(publications?|articles?|papers?|chapters?|chapitres?)$/, 'publication'],
  [/^(talks?|keynotes?|conferences?|conférences?|panels?)$/, 'talk'],
  [/^(courses?|cours|teaching|enseignement)$/, 'course'],
  [/^(themes?|thèmes?|topics?)$/, 'theme'],
];

function search(fuse: Fuse<Doc>, q: string): Doc[] {
  const words = q
    .toLowerCase()
    .replace(/[’']/g, ' ')
    .split(/[^\p{L}\p{N}+.-]+/u)
    .map((w) => w.replace(/^[.-]+|[.?-]+$/g, ''))
    .filter((w) => w.length >= 2 && !STOP.has(w));
  const kinds = new Set<ResultKind>();
  const terms: string[] = [];
  for (const w of words) {
    const k = KIND_WORDS.find(([re]) => re.test(w));
    if (k) kinds.add(k[1]);
    else terms.push(w);
  }
  if (!terms.length) return [];
  const score = new Map<Doc, number>();
  for (const term of terms) {
    // Close matches only (a typo is fine; a random word must not match anything).
    for (const h of fuse.search(term, { limit: 40 }))
      if ((h.score ?? 1) <= 0.22) score.set(h.item, (score.get(h.item) ?? 0) + (1 - (h.score ?? 1)));
  }
  const ranked = [...score]
    .map(([d, s]) => [d, s + (kinds.has(d.kind) ? 0.75 : 0)] as const)
    // If the question names a kind and some results are of that kind, keep only those.
    .filter(([d], _, all) => !kinds.size || kinds.has(d.kind) || !all.some(([x]) => kinds.has(x.kind)))
    .sort((a, b) => b[1] - a[1]);
  // Drop the long tail of weak matches.
  const best = ranked[0]?.[1] ?? 0;
  return ranked.filter(([, s]) => s >= best * 0.4).map(([d]) => d);
}

const strip = (d: Doc): GuideResult => ({ id: d.id, kind: d.kind, title: d.title, meta: d.meta, href: d.href, summary: d.summary });

/** Answers a question from the site's content only. `now` decides what is "upcoming". */
export function answerLocally(question: string, lang: Lang, now = Date.now()): GuideAnswer {
  const L = T[lang];
  const q = question.trim();
  const { docs, fuse } = index(lang);

  // Intent: upcoming talks.
  if (/\b(upcoming|next|future|coming)\b|à venir|prochaine?s?|futur/i.test(q) && /talk|keynote|panel|conf|lecture|event|intervention|communication/i.test(q)) {
    const upcoming = talks.filter((t) => timing(t.date, t.endDate, now) !== 'past').sort((a, b) => byDateDesc(b, a));
    const shown = (upcoming.length ? upcoming : [...talks].sort(byDateDesc)).slice(0, 4);
    const results = shown.map((t) => strip(docs.find((d) => d.id === `talk-${t.id}`)!));
    const list = upcoming
      .slice(0, 4)
      .map((t) => `${t.title ?? t.event} (${t.dateLabel?.[lang] ?? formatDate(t.date, lang, t.endDate)}${t.location ? `, ${t.location}` : ''})`)
      .join('; ');
    return { text: L.upcoming(upcoming.length, list), results, source: 'local' };
  }

  // Intent: doctoral supervision.
  if (/supervis|doctoral students?|ph\.?\s?d\.? students?|doctorant|encadr|codirect/i.test(q)) {
    const list = students.map((s) => `${s.name} (${s.topic}, ${s.cohort})`).join('; ');
    const results = docs.filter((d) => d.kind === 'supervision').slice(0, 4).map(strip);
    return { text: L.supervision(students.length, list), results, source: 'local' };
  }

  // Everything else: fuzzy search term by term (question words dropped), scores summed per
  // document; a kind word ("projects", "talks"…) favours that kind. At most one result per title.
  const hits = search(fuse, q);
  if (!hits.length) return { text: L.noMatch(q), results: [], source: 'local' };
  const seen = new Set<string>();
  const top = hits.filter((d) => (seen.has(d.title) ? false : (seen.add(d.title), true)));
  const results = top.slice(0, 4).map(strip);

  const best = top[0];
  const sentences = [L.intro(q)];
  if (best.kind === 'publication') {
    // e.g. "What is AIA-PCEK?": list the matching works.
    const pubs = top.filter((d) => d.kind === 'publication').slice(0, 3);
    sentences.push(pubs.map((d) => L.defined(d.title, d.meta)).join(' '));
  } else if (best.summary) {
    sentences.push(best.kind === 'profile' ? `${L.fromBio} ${best.summary}` : `${best.title}: ${best.summary}`);
  } else {
    sentences.push(L.defined(best.title, best.meta));
  }
  const counts = new Map<ResultKind, number>();
  for (const d of top) counts.set(d.kind, (counts.get(d.kind) ?? 0) + 1);
  const parts = [...counts].slice(0, 3).map(([k, n]) => `${n} ${L.count[k][n === 1 ? 0 : 1]}`);
  if (parts.length) sentences.push(L.alsoSee(parts));
  return { text: sentences.join(' '), results, source: 'local' };
}
