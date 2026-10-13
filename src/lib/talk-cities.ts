// Talks for the Talks page: grouped by city for the tour poster, and grouped into list
// entries (one source of truth for the list). The city is read from each talk's location
// ("Palais des congrès, Montréal, Canada" → "Montréal"); spelling variants are merged.
import { talks } from '../content/talks';
import type { Lang, Talk, TalkType } from '../content/types';
import { photos, type Photo } from './photos';
import { byDateDesc, formatDate } from './dates';

export interface TalkCity {
  id: string;
  /** City name, or null for talks given online with no host city. */
  name: string | null;
  country?: string;
  talks: Talk[];
  /** A photo actually taken in that city, when we have one. */
  photo?: Photo;
}

const ALIASES: [RegExp, string][] = [
  [/^ben ?gu[eé]rir$/i, 'Ben Guerir'],
  [/^macau sar$/i, 'Macau'],
];

/** Photos taken in a given city (only real matches; most cities have none). */
const PHOTOS: Record<string, Photo> = {
  'Ben Guerir': photos.scienceWeekSpeaking,
  Montréal: photos.montreal,
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]+/g, '-');

/**
 * Where a talk goes on the poster. A virtual event keeps its host city when it has one
 * (Alicante, Ifrane); a virtual event with only a country (Cannexus 2023) is "Online".
 * No place and not online (ICAIR 2024): null, it stays off the poster (it is in the list).
 */
function cityOf(t: Talk): { id: string; name: string | null; country?: string } | null {
  const parts = t.location?.split(',').map((s) => s.trim()) ?? [];
  if (parts.length < 2) return t.virtual ? { id: 'online', name: null } : null;
  const country = parts[parts.length - 1];
  let name = parts[parts.length - 2];
  for (const [re, to] of ALIASES) if (re.test(name)) name = to;
  return { id: slug(name), name, country };
}

export const cityIdOf = (t: Talk) => cityOf(t)?.id ?? null;

export function talkCities(): TalkCity[] {
  const map = new Map<string, TalkCity>();
  for (const t of [...talks].sort(byDateDesc)) {
    const c = cityOf(t);
    if (!c) continue;
    const city = map.get(c.id) ?? { id: c.id, name: c.name, country: c.country, talks: [], photo: c.name ? PHOTOS[c.name] : undefined };
    city.talks.push(t);
    map.set(c.id, city);
  }
  // Most recent first, like a tour poster's list of dates.
  return [...map.values()];
}

/** One date format everywhere: "25–26 November 2026", "June 2026", "2–3 & 9 October 2020". */
export const talkDate = (t: Talk, lang: Lang) => (t.dateLabel ? t.dateLabel[lang] : formatDate(t.date, lang, t.endDate));

/* ------------------------------------------------------------- list entries */

export interface TalkEntry {
  id: string;
  /** Newest first. One talk, or the same talk at several venues, or several roles at one event. */
  talks: Talk[];
  kind: 'single' | 'venues' | 'roles';
}

/** The same talk given at several venues (newest first; the first one's title is used). */
const SAME_TALK = [
  ['udes-2021', 'ipn-2020'],
  ['rise-2021', 'crifpe-2021-180s'],
];
/** Several roles at one event (the first is the main one: its title and event are used). */
const SAME_EVENT = [['africa-2020-paper', 'africa-2020-chair']];

export function talkEntries(): TalkEntry[] {
  const byId = new Map(talks.map((t) => [t.id, t]));
  const used = new Set<string>();
  const out: TalkEntry[] = [];
  const group = (ids: string[], kind: TalkEntry['kind']) => {
    const list = ids.map((id) => byId.get(id)).filter((t): t is Talk => !!t);
    if (list.length < 2) return;
    list.forEach((t) => used.add(t.id));
    out.push({ id: list[0].id, talks: list, kind });
  };
  SAME_TALK.forEach((ids) => group(ids, 'venues'));
  SAME_EVENT.forEach((ids) => group(ids, 'roles'));
  for (const t of talks) if (!used.has(t.id)) out.push({ id: t.id, talks: [t], kind: 'single' });
  // Newest first, by each entry's latest talk.
  return out.sort((a, b) => byDateDesc(a.talks[0], b.talks[0]));
}

export const entryTypes = (e: TalkEntry): TalkType[] => [...new Set(e.talks.map((t) => t.type))];
export const entryCities = (e: TalkEntry) => new Set(e.talks.map(cityIdOf).filter((c): c is string => !!c));
