// Talks grouped by city for the Talks page's tour poster. The city is read from each talk's
// location ("Palais des congrès, Montréal, Canada" → "Montréal"); spelling variants are merged.
import { talks } from '../content/talks';
import type { Talk } from '../content/types';
import { photos, type Photo } from './photos';
import { byDateDesc } from './dates';

export interface TalkCity {
  id: string;
  /** City name, or null for talks given online (no place). */
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

function cityOf(t: Talk): { name: string | null; country?: string } {
  if (!t.location) return { name: null };
  const parts = t.location.split(',').map((s) => s.trim());
  if (parts.length === 1) return { name: parts[0] };
  const country = parts[parts.length - 1];
  let name = parts[parts.length - 2];
  for (const [re, to] of ALIASES) if (re.test(name)) name = to;
  return { name, country };
}

export function talkCities(): TalkCity[] {
  const map = new Map<string, TalkCity>();
  for (const t of [...talks].sort(byDateDesc)) {
    const { name, country } = cityOf(t);
    // No place and not online: unknown city, so it stays off the poster (it is in the list).
    if (name === null && !t.virtual) continue;
    const id = (name ?? 'online')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z]+/g, '-');
    const c = map.get(id) ?? { id, name, country, talks: [], photo: name ? PHOTOS[name] : undefined };
    c.talks.push(t);
    map.set(id, c);
  }
  // Most recent first, like a tour poster's list of dates.
  return [...map.values()];
}
