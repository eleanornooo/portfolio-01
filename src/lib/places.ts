// Where the work happened: the places on the globe, with what took place there pulled
// from the content files (talks, positions, degrees, projects, training).
import { talks } from '../content/talks';
import { positions } from '../content/experience';
import { certifications, degrees } from '../content/education';
import { projects } from '../content/projects';
import type { Localized, PartialDate } from '../content/types';

export interface PlaceItem {
  kind: 'talk' | 'position' | 'degree' | 'project' | 'training';
  title: string;
  meta: string;
  date?: PartialDate;
  href?: string;
}

export interface Place {
  id: string;
  name: string;
  country: Localized;
  lat: number;
  lon: number;
  /** The home base: arcs start here. */
  home?: boolean;
  items: PlaceItem[];
}

interface PlaceDef {
  id: string;
  name: string;
  country: Localized;
  lat: number;
  lon: number;
  home?: boolean;
  /** Matched against talk locations/events, position places and degree schools. */
  match: RegExp;
  /** Projects carried out there (ids). */
  projects?: string[];
}

const DEFS: PlaceDef[] = [
  {
    // Home base: UM6P Rabat Campus (current position, talks in Rabat, current projects).
    id: 'rabat',
    name: 'Rabat',
    country: { en: 'Morocco', fr: 'Maroc' },
    lat: 34.03,
    lon: -6.8,
    home: true,
    match: /Rabat/i,
    projects: ['volcanic', 'sustaineur', 'inclusive-at', 'core-curriculum'],
  },
  {
    // UM6P's Ben Guerir campus: earlier roles held there and the events that took place there.
    id: 'ben-guerir',
    name: 'Ben Guerir',
    country: { en: 'Morocco', fr: 'Maroc' },
    lat: 32.23,
    lon: -7.95,
    match: /Ben ?Gu[eé]rir|Benguerir/i,
    projects: ['sil', 'd4r'],
  },
  {
    id: 'quebec',
    name: 'Sherbrooke · Montréal · Québec',
    country: { en: 'Canada', fr: 'Canada' },
    lat: 45.5,
    lon: -72.6,
    match: /Sherbrooke|Montr[ée]al|Qu[ée]bec|T[ÉE]LUQ|Canada/i,
    projects: ['its', 'gsdl', 'comodal', 'cetal'],
  },
  {
    id: 'saint-etienne',
    name: 'Saint-Étienne',
    country: { en: 'France', fr: 'France' },
    lat: 45.43,
    lon: 4.39,
    match: /Saint-[ÉE]tienne/i,
  },
  {
    id: 'alicante',
    name: 'Alicante',
    country: { en: 'Spain', fr: 'Espagne' },
    lat: 38.35,
    lon: -0.48,
    match: /Alicante/i,
  },
  {
    id: 'abidjan',
    name: 'Abidjan',
    country: { en: 'Côte d’Ivoire', fr: 'Côte d’Ivoire' },
    lat: 5.36,
    lon: -4.01,
    match: /Abidjan/i,
  },
  {
    id: 'macau',
    name: 'Macau',
    country: { en: 'China (Macau SAR)', fr: 'Chine (RAS de Macao)' },
    lat: 22.2,
    lon: 113.54,
    match: /Macau/i,
  },
  {
    id: 'arizona',
    name: 'Arizona State University',
    country: { en: 'United States', fr: 'États-Unis' },
    lat: 33.42,
    lon: -111.93,
    match: /Arizona/i,
  },
];

const year = (d?: string) => (d ? d.slice(0, 4) : '');

function itemsFor(def: PlaceDef): PlaceItem[] {
  const items: PlaceItem[] = [];
  for (const t of talks) {
    // Arizona is a collaboration, not a venue: match the organisers, not the location.
    const text = def.id === 'arizona' ? t.event : `${t.location ?? ''}`;
    if (def.match.test(text)) items.push({ kind: 'talk', title: t.title ?? t.event, meta: year(t.date), date: t.date, href: '/talks' });
  }
  for (const p of positions) {
    if (def.match.test(`${p.place ?? ''} ${def.id === 'quebec' ? p.org : ''}`))
      items.push({ kind: 'position', title: `${p.role} — ${p.org}`, meta: p.periodLabel ?? `${p.start}–${p.end ?? ''}`, href: '/about#experience' });
  }
  for (const d of degrees) {
    if (def.match.test(`${d.school} ${d.place ?? ''}`) && !d.minor)
      items.push({ kind: 'degree', title: `${d.degree} — ${d.school}`, meta: d.year, href: '/about#education' });
  }
  for (const id of def.projects ?? []) {
    const p = projects.find((x) => x.id === id);
    if (p) items.push({ kind: 'project', title: p.short ?? p.title, meta: p.period, href: `/research#case-${p.id}` });
  }
  for (const c of certifications) {
    if (def.id === 'arizona' && def.match.test(c.provider))
      items.push({ kind: 'training', title: `${c.title} — ${c.provider}`, meta: c.year ?? '' });
  }
  return items;
}

let cache: Place[] | null = null;

export function places(): Place[] {
  if (!cache) {
    cache = DEFS.map((d) => ({
      id: d.id,
      name: d.name,
      country: d.country,
      lat: d.lat,
      lon: d.lon,
      home: d.home,
      items: itemsFor(d),
    }));
  }
  return cache;
}

export const countryCount = () => new Set(DEFS.map((d) => d.country.en)).size;
