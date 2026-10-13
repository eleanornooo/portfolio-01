import type { Publication } from '../content/types';

/** A piece of a formatted reference. Italic parts follow APA 7. */
export interface Segment {
  text: string;
  italic?: boolean;
  author?: boolean;
}

export const SELF = 'Mimoudi, A.';

export function joinAuthors(authors: string[]): string {
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]}, & ${authors[1]}`;
  return `${authors.slice(0, -1).join(', ')}, & ${authors[authors.length - 1]}`;
}

/** Splits the author list so "Mimoudi, A." can be set in bold. */
function authorSegments(authors: string[]): Segment[] {
  const out: Segment[] = [];
  authors.forEach((a, i) => {
    if (i > 0) out.push({ text: i === authors.length - 1 ? ', & ' : ', ' });
    out.push({ text: a, author: a === SELF });
  });
  if (authors.length === 1) return [{ text: authors[0], author: authors[0] === SELF }];
  return out;
}

const endPunct = (s: string) => (/[.?!]$/.test(s) ? s : `${s}.`);
export const doiUrl = (doi: string) => `https://doi.org/${doi}`;

export function primaryUrl(p: Publication): string | undefined {
  return p.doi ? doiUrl(p.doi) : p.url;
}

/** Formats a publication as an APA 7 reference, as segments (for display) and plain text (for copying). */
export function apa(p: Publication): { segments: Segment[]; text: string } {
  const s: Segment[] = [];
  const year = p.year === 'in press' ? 'in press' : p.month ? `${p.year}, ${p.month}` : String(p.year);
  s.push(...authorSegments(p.authors), { text: ` (${year}). ` });

  switch (p.type) {
    case 'article': {
      s.push({ text: `${endPunct(p.title)} ` }, { text: p.journal ?? '', italic: true });
      if (p.volume) s.push({ text: ', ' }, { text: p.volume, italic: true });
      if (p.issue) s.push({ text: `(${p.issue})` });
      if (p.pages) s.push({ text: `, ${p.pages}` });
      s.push({ text: '.' });
      break;
    }
    case 'chapter': {
      s.push({ text: `${endPunct(p.title)} In ${p.editors ? `${p.editors}, ` : ''}` });
      s.push({ text: p.container ?? '', italic: true });
      const loc = [p.chapter && `Chap. ${p.chapter}`, p.pages && `pp. ${p.pages}`].filter(Boolean).join(', ');
      s.push({ text: `${loc ? ` (${loc})` : ''}. ${p.publisher ? endPunct(p.publisher) : ''}` });
      break;
    }
    case 'proceedings': {
      s.push({ text: `${endPunct(p.title)} In ${p.editors ? `${p.editors}, ` : ''}` });
      s.push({ text: p.container ?? '', italic: true });
      if (p.volume) {
        s.push({ text: ', ' }, { text: p.volume, italic: true });
        if (p.issue) s.push({ text: `(${p.issue})` });
        if (p.pages) s.push({ text: `, ${p.pages}` });
        s.push({ text: '.' });
      } else if (p.pages) {
        s.push({ text: ` (${p.pages.includes('–') ? 'pp.' : 'p.'} ${p.pages}).` });
      } else s.push({ text: '.' });
      if (p.publisher) s.push({ text: ` ${endPunct(p.publisher)}` });
      break;
    }
    case 'thesis': {
      s.push({ text: p.title, italic: true }, { text: ` [${p.description}]. ` });
      if (p.publisher) s.push({ text: endPunct(p.publisher) });
      break;
    }
    case 'report': {
      s.push({ text: p.title, italic: true });
      s.push({ text: `${p.description ? ` (${p.description})` : ''}. ${p.publisher ? endPunct(p.publisher) : ''}` });
      break;
    }
  }
  const link = primaryUrl(p);
  if (link) s.push({ text: ` ${link}` });

  const text = s.map((x) => x.text).join('').replace(/\s+/g, ' ').trim();
  return { segments: s, text };
}
