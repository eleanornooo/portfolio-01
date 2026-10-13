// Links between content items, derived from the data files (never typed by hand twice):
// which research themes an item belongs to, and which publications/talks a project produced.
import { publications } from '../content/publications';
import { researchInterests } from '../content/projects';
import { talks } from '../content/talks';
import type { Project, Publication, Talk } from '../content/types';
import { doiUrl } from './apa';

/**
 * Keywords for each research theme, in the order of `researchInterests`.
 * An item belongs to a theme if it is cited by that theme or its text matches.
 */
export const THEME_PATTERNS: RegExp[] = [
  /teacher|enseignant|teaching with|AIA-PCEK|educational values|teacher training/i,
  /generative|personali[sz]|personnalis|divide|fracture|adaptative/i,
  /tutor|tuteur|tutoriel|distance|comodal/i,
  /computational|inclusi|rural|défavoris|digitali[sz]ation|equity|équité|deaf/i,
  /sustainab|durab|entrepreneur|employab|business model/i,
];

export const pubText = (p: Publication) => [p.title, p.journal, p.container].filter(Boolean).join(' ');
export const talkText = (t: Talk) => `${t.title ?? ''} ${t.event}`;
export const projectText = (p: Project) => `${p.title} ${p.summary}`;

export function themesOf(text: string, id?: string): number[] {
  const out: number[] = [];
  researchInterests.forEach((r, i) => {
    if ((id && r.refs?.includes(id)) || THEME_PATTERNS[i].test(text)) out.push(i);
  });
  return out;
}

/** Project-specific keywords, used on top of shared links to find its outputs. */
const PROJECT_PATTERNS: Record<string, RegExp> = {
  volcanic: /volcanic|computational thinking/i,
  sustaineur: /sustainab/i,
  'inclusive-at': /deaf|assistive/i,
  'core-curriculum': /digitali[sz]ation of education/i,
  sil: /rural/i,
  its: /tutor|tuteur|tutoriel/i,
  gsdl: /GSDL/i,
  comodal: /comodal/i,
  cetal: /design inclusif|inclusive design/i,
  d4r: /MOOC/i,
};

const norm = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/+$/, '').toLowerCase();

function linkSet(urls: (string | undefined)[]): Set<string> {
  return new Set(urls.filter((u): u is string => Boolean(u)).map(norm));
}

/** Publications and talks connected to a project (shared link or project keyword). */
export function outputsOf(project: Project): { pubs: Publication[]; talks: Talk[] } {
  const own = linkSet([project.url, ...(project.links ?? []).map((l) => l.url)]);
  const re = PROJECT_PATTERNS[project.id];
  const pubs = publications.filter((p) => {
    const urls = linkSet([p.url, p.doi && doiUrl(p.doi), ...(p.links ?? []).map((l) => l.url)]);
    const shared = [...urls].some((u) => own.has(u) || [...own].some((o) => o.startsWith(u) || u.startsWith(o)));
    return shared || (re ? re.test(pubText(p)) : false);
  });
  const ts = talks.filter((t) => {
    const urls = linkSet((t.links ?? []).map((l) => l.url));
    return [...urls].some((u) => own.has(u)) || (re ? re.test(talkText(t)) : false);
  });
  return { pubs, talks: ts };
}
