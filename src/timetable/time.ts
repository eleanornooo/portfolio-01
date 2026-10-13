// Small time-zone helpers built on Intl (no library). Sessions are stored as wall-clock
// times in Africa/Casablanca; these functions turn them into real instants for a given
// date (Morocco's clock changes during Ramadan) and back into any display time zone.
import type { Weekday } from '../content/types';

export const MOROCCO_TZ = 'Africa/Casablanca';
export const WEEKDAYS: (Weekday | 'Sun')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function dtf(tz: string) {
  let f = dtfCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'short',
    });
    dtfCache.set(tz, f);
  }
  return f;
}

export interface Wall {
  ymd: string; // "2026-10-12"
  weekday: Weekday | 'Sun';
  minutes: number; // minutes since local midnight
}

/** Wall-clock date/time of an instant in a time zone. */
export function wallTime(instant: number, tz: string): Wall {
  const p: Record<string, string> = {};
  for (const part of dtf(tz).formatToParts(new Date(instant))) p[part.type] = part.value;
  return {
    ymd: `${p.year}-${p.month}-${p.day}`,
    weekday: p.weekday as Weekday | 'Sun',
    minutes: Number(p.hour) * 60 + Number(p.minute),
  };
}

/** Offset of a time zone from UTC at an instant, in ms. */
function offsetAt(instant: number, tz: string): number {
  const p: Record<string, string> = {};
  for (const part of dtf(tz).formatToParts(new Date(instant))) p[part.type] = part.value;
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return asUtc - Math.floor(instant / 1000) * 1000;
}

/** Instant for a wall-clock date + "HH:MM" in a time zone. */
export function zonedToInstant(ymd: string, hm: string, tz: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  const [h, mi] = hm.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const first = guess - offsetAt(guess, tz);
  // Re-check with the offset at the candidate instant (handles offset changes).
  return guess - offsetAt(first, tz);
}

export const toMinutes = (hm: string) => {
  const [h, m] = hm.split(':').map(Number);
  return h * 60 + m;
};

export const fmtMinutes = (min: number) =>
  `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

/** Adds days to a "YYYY-MM-DD" date. */
export function addDays(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

/** Weekday of a calendar date (independent of time zone). */
export function weekdayOf(ymd: string): Weekday | 'Sun' {
  const [y, m, d] = ymd.split('-').map(Number);
  return WEEKDAYS[(new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7];
}

/** Monday of the week containing a date. */
export function mondayOf(ymd: string): string {
  return addDays(ymd, -WEEKDAYS.indexOf(weekdayOf(ymd)));
}

/** First date on or after `ymd` that falls on `day`. */
export function firstOnOrAfter(ymd: string, day: Weekday): string {
  const diff = (WEEKDAYS.indexOf(day) - WEEKDAYS.indexOf(weekdayOf(ymd)) + 7) % 7;
  return addDays(ymd, diff);
}

/** Visitor's IANA time zone, or Morocco if unavailable. */
export function visitorTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || MOROCCO_TZ;
  } catch {
    return MOROCCO_TZ;
  }
}

/** Short human label for a time zone as an offset, e.g. "GMT+1". */
export function tzLabel(tz: string, at: number, lang: string): string {
  try {
    const part = new Intl.DateTimeFormat(lang, { timeZone: tz, timeZoneName: 'shortOffset' })
      .formatToParts(new Date(at))
      .find((p) => p.type === 'timeZoneName');
    return part?.value ?? tz;
  } catch {
    return tz;
  }
}
