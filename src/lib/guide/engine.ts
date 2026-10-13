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
import { news } from '../../content/news';
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
    intro: (q: string) => `Here is what this site says about “${q}”.`,
    alsoSee: (parts: string[]) => `Related on the site: ${parts.join(', ')}.`,
    count: { publication: ['publication', 'publications'], project: ['project', 'projects'], talk: ['talk', 'talks'], course: ['course', 'courses'], theme: ['research theme', 'research themes'], profile: ['profile entry', 'profile entries'], supervision: ['doctoral student', 'doctoral students'], highlight: ['highlight', 'highlights'], cv: ['CV', 'CVs'] } as Record<ResultKind, [string, string]>,
    upcoming: (n: number, list: string) =>
      n ? `${n === 1 ? 'One upcoming talk' : `${n} upcoming talks`}: ${list}.` : 'No upcoming talks are listed right now; the latest ones are below.',
    supervision: (n: number, list: string) => `He co-supervises ${n} Ph.D. students at ISE – UM6P: ${list}.`,
    defined: (title: string, venue: string) => `${title}${venue ? ` (${venue})` : ''}.`,
    fromBio: 'From the biography:',
    start: (q: string) => `Nothing on this site matches “${q}” closely. Here’s where to start:`,
    latest: (list: string) => `Latest highlights: ${list}.`,
    about: 'About — biography, experience, education',
    cv: 'Curriculum vitae (PDF)',
  },
  fr: {
    intro: (q: string) => `Voici ce que ce site dit de « ${q} ».`,
    alsoSee: (parts: string[]) => `À voir aussi sur le site : ${parts.join(', ')}.`,
    count: { publication: ['publication', 'publications'], project: ['projet', 'projets'], talk: ['conférence', 'conférences'], course: ['cours', 'cours'], theme: ['thème de recherche', 'thèmes de recherche'], profile: ['élément du profil', 'éléments du profil'], supervision: ['doctorant', 'doctorants'], highlight: ['fait marquant', 'faits marquants'], cv: ['CV', 'CV'] } as Record<ResultKind, [string, string]>,
    upcoming: (n: number, list: string) =>
      n
        ? `${n === 1 ? 'Une conférence à venir' : `${n} conférences à venir`} : ${list}.`
        : 'Aucune conférence à venir n’est annoncée pour l’instant ; les plus récentes sont ci-dessous.',
    supervision: (n: number, list: string) => `Il codirige ${n} doctorants à l’ISE – UM6P : ${list}.`,
    defined: (title: string, venue: string) => `${title}${venue ? ` (${venue})` : ''}.`,
    fromBio: 'D’après la biographie :',
    start: (q: string) => `Rien sur ce site ne correspond vraiment à « ${q} ». Voici par où commencer :`,
    latest: (list: string) => `Faits marquants récents : ${list}.`,
    about: 'À propos — biographie, parcours, formation',
    cv: 'Curriculum vitae (PDF)',
  },
};

/** Sentences: a break needs a capital after it, so "Ph.D. in Education" stays whole. */
const sentences = (s: string) => s.split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý])/);
const firstSentence = (s: string) => sentences(s)[0];

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

/**
 * Words stripped before searching: question words and fillers (EN/FR), plus the name and
 * "him/lui" (every page is about him, so they name no topic).
 */
const STOP = new Set(
  [
    // EN
    'who what which whom whose when where why how is are was were be the a an of on in at about for to and or with his him he does do did any there tell me us show list give find site research',
    // FR
    'qui quoi que qu où ou quand quel quelle quels quelles est sont était le la les un une des du de sur pour et avec ses il lui son sa dans au aux moi nous montre liste parle parlez parle-moi parlez-moi dis dites dis-moi dites-moi est-ce ce cest est-il cela',
    // the person
    'aziz mimoudi dr professor professeur',
  ]
    .join(' ')
    .split(' '),
);

/** Words that ask for the profile itself ("biography", "background"…). */
const PROFILE_WORDS = new Set('biography bio profile background cv résumé resume biographie profil parcours présentation propos'.split(' '));

/**
 * Synonym groups. Multi-word forms are folded into the group first ("artificial
 * intelligence" → ai); a group is then searched under all its forms, and each document keeps
 * its best form, so synonyms never add up. Kind synonyms ("talks" = "keynotes" =
 * "conférences"…) are in KIND_WORDS; "students" = "supervision" = "doctorants" is the
 * supervision intent in answerLocally.
 */
const SYNONYMS: Record<string, string[]> = {
  ai: ['AI', 'IA', 'artificial intelligence', 'intelligence artificielle'],
  genai: ['generative AI', 'IA générative', 'GenAI', 'ChatGPT', 'LLM'],
  teachered: ['teacher education', 'teacher training', 'formation des enseignants', 'formation des maîtres', 'preservice teachers'],
  inclusion: ['inclusion', 'inclusive', 'inclusif', 'accessibility', 'accessibilité', 'diverse abilities'],
  ct: ['computational thinking', 'pensée computationnelle'],
  distance: ['distance learning', 'online learning', 'distance education', 'formation à distance', 'enseignement à distance', 'e-learning'],
  employability: ['employability', 'employabilité', 'entrepreneurship', 'entrepreneuriat'],
  sustainability: ['sustainability', 'sustainable', 'durabilité', 'durable'],
  its: ['intelligent tutoring system', 'intelligent tutoring', 'système tutoriel intelligent', 'systèmes tuteurs intelligents'],
};
/** Single words that stand for a whole group. */
const WORD_TO_GROUP: Record<string, string> = {
  ai: 'ai',
  ia: 'ai',
  genai: 'genai',
  chatgpt: 'genai',
  llm: 'genai',
  llms: 'genai',
  inclusion: 'inclusion',
  inclusive: 'inclusion',
  inclusif: 'inclusion',
  accessibility: 'inclusion',
  accessibilité: 'inclusion',
  employability: 'employability',
  employabilité: 'employability',
  sustainability: 'sustainability',
  durabilité: 'sustainability',
};

/** A kind word in the question favours results of that kind (talks = keynotes = conférences…). */
const KIND_WORDS: [RegExp, ResultKind][] = [
  [/^(projects?|projets?)$/, 'project'],
  [/^(publications?|articles?|papers?|chapters?|chapitres?|writings?|écrits?)$/, 'publication'],
  [/^(talks?|keynotes?|conferences?|conférences?|panels?|presentations?|lectures?|communications?|interventions?|speeches?)$/, 'talk'],
  [/^(courses?|cours|teaching|teaches|enseignement|enseigne|classes?)$/, 'course'],
  [/^(themes?|thèmes?|topics?|interests?|intérêts?)$/, 'theme'],
];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordRe = (s: string, flags = 'u') => new RegExp(`(^|[^\\p{L}])${esc(s)}(?=[^\\p{L}]|$)`, flags);

/** Splits a question into topic terms, synonym groups, the kinds it names, and profile words. */
function parse(q: string) {
  let text = ` ${q.toLowerCase().replace(/[’']/g, ' ')} `;
  const groups = new Set<string>();
  // Fold multi-word synonyms into their group.
  for (const [key, forms] of Object.entries(SYNONYMS))
    for (const f of forms.filter((x) => x.includes(' ')).map((x) => x.toLowerCase()))
      if (wordRe(f).test(text)) {
        groups.add(key);
        text = text.split(f).join(' ');
      }
  const words = text
    .split(/[^\p{L}\p{N}+.-]+/u)
    .map((w) => w.replace(/^[.-]+|[.?-]+$/g, ''))
    .filter((w) => w.length >= 2 && !STOP.has(w));
  const kinds = new Set<ResultKind>();
  const terms: string[] = [];
  let profileWords = 0;
  for (const w of words) {
    const k = KIND_WORDS.find(([re]) => re.test(w));
    if (k) kinds.add(k[1]);
    else if (PROFILE_WORDS.has(w)) profileWords++;
    else if (WORD_TO_GROUP[w]) groups.add(WORD_TO_GROUP[w]);
    else terms.push(w);
  }
  return { terms, groups: [...groups], kinds, profileWords };
}

/** One search form: fuzzy for words, whole-word for short ones such as "AI" (so not "sustAInable"). */
function scoreForm(fuse: Fuse<Doc>, docs: Doc[], form: string): Map<Doc, number> {
  const out = new Map<Doc, number>();
  if (form.length <= 3) {
    const re = wordRe(form.toLowerCase(), 'iu');
    for (const d of docs) {
      if (re.test(d.title)) out.set(d, 1);
      else if (re.test(d.text)) out.set(d, 0.85);
    }
    return out;
  }
  // Close matches only (a typo is fine; a random word must not match anything).
  for (const h of fuse.search(form, { limit: 40 })) if ((h.score ?? 1) <= 0.22) out.set(h.item, 1 - (h.score ?? 1));
  return out;
}

function search(fuse: Fuse<Doc>, docs: Doc[], { terms, groups, kinds }: ReturnType<typeof parse>): Doc[] {
  if (!terms.length && !groups.length) {
    // Only a kind ("talks", "publications"): the newest of that kind.
    return docs.filter((d) => kinds.has(d.kind)).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  }
  const score = new Map<Doc, number>();
  const add = (m: Map<Doc, number>) => m.forEach((v, d) => score.set(d, (score.get(d) ?? 0) + v));
  for (const term of terms) add(scoreForm(fuse, docs, term));
  for (const g of groups) {
    const best = new Map<Doc, number>();
    for (const form of SYNONYMS[g]) scoreForm(fuse, docs, form).forEach((v, d) => best.set(d, Math.max(best.get(d) ?? 0, v)));
    add(best);
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

/** Two sentences from the start of the biography. */
const intro = (lang: Lang) => sentences(profile.bio[lang][0]).slice(0, 2).join(' ');

/** The About page, the CV (when it is on the site) and the current position. */
function profileCards(lang: Lang, docs: Doc[]): GuideResult[] {
  const L = T[lang];
  const cards: GuideResult[] = [
    { id: 'about', kind: 'profile', title: L.about, meta: `${profile.honorific} ${profile.name} · ${profile.title[lang]}`, href: '/about' },
  ];
  if (__HAS_CV__) cards.push({ id: 'cv', kind: 'cv', title: L.cv, meta: 'PDF', href: profile.cvPdf, download: true });
  const current = docs.find((d) => d.id.startsWith('pos-'));
  if (current) cards.push(strip(current));
  return cards;
}

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

  // Intent: doctoral supervision (students = supervision = doctorants).
  if (/supervis|\bstudents?\b|doctoral|ph\.?\s?d\.? students?|doctorant|étudiants?|encadr|codirect/i.test(q)) {
    const list = students.map((s) => `${s.name} (${s.topic}, ${s.cohort})`).join('; ');
    const results = docs.filter((d) => d.kind === 'supervision').slice(0, 4).map(strip);
    return { text: L.supervision(students.length, list), results, source: 'local' };
  }

  // Intent: the person ("Who is Aziz Mimoudi?", "about him", "biography", or just his name):
  // nothing left to search once question words, the name and profile words are removed.
  const parsed = parse(q);
  const topicless = !parsed.terms.length && !parsed.groups.length && !parsed.kinds.size;
  const aboutHim =
    parsed.profileWords > 0 ||
    /\bwho\s+is\b|\bwho's\b|\babout\s+(him|aziz|mimoudi|dr)\b|\bqui\s+est\b|à\s+propos|parle[sz]?-moi|\baziz\b|\bmimoudi\b|\bhim\b|\blui\b/i.test(q);
  if (topicless && aboutHim) return { text: intro(lang), results: profileCards(lang, docs), source: 'local' };

  // Everything else: fuzzy search term by term (question words dropped, synonyms folded),
  // scores summed per document; a kind word ("projects", "talks"…) favours that kind.
  // At most one result per title.
  const hits = search(fuse, docs, parsed);
  if (!hits.length) {
    // Nothing close: don't stop there; offer a way in (the bio and the latest highlights).
    const latest = [...news].sort(byDateDesc).slice(0, 3);
    return {
      text: [L.start(q), intro(lang), L.latest(latest.map((n) => n.title[lang]).join('; '))].join(' '),
      results: [
        profileCards(lang, docs)[0],
        ...latest.map((n) => ({
          id: `news-${n.id}`,
          kind: 'highlight' as const,
          title: n.title[lang],
          meta: formatDate(n.date, lang, n.endDate),
          href: '/#highlights',
        })),
      ],
      source: 'local',
    };
  }
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
