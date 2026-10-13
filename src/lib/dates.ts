import type { Lang, PartialDate } from '../content/types';

const locale = (lang: Lang) => (lang === 'fr' ? 'fr-FR' : 'en-GB');

function parts(d: PartialDate) {
  const [y, m, day] = d.split('-').map(Number);
  return { y, m: m || undefined, day: day || undefined };
}

/** First instant of a partial date ("2026-04" → 1 April 2026, 00:00 UTC). */
export function startOf(d: PartialDate): number {
  const { y, m, day } = parts(d);
  return Date.UTC(y, (m ?? 1) - 1, day ?? 1);
}

/** Last instant of a partial date ("2026-04" → 30 April 2026, 23:59:59 UTC). */
export function endOf(d: PartialDate): number {
  const { y, m, day } = parts(d);
  if (day) return Date.UTC(y, m! - 1, day, 23, 59, 59);
  if (m) return Date.UTC(y, m, 0, 23, 59, 59);
  return Date.UTC(y, 11, 31, 23, 59, 59);
}

export type Timing = 'upcoming' | 'ongoing' | 'past';

/**
 * Where an event sits relative to `now`. Year-only dates are never "upcoming":
 * we only tag items whose day or month is actually known.
 */
export function timing(date: PartialDate, endDate: PartialDate | undefined, now: number): Timing {
  const precise = date.length > 4;
  if (precise && now < startOf(date)) return 'upcoming';
  if (now <= endOf(endDate ?? date) && precise) return 'ongoing';
  return 'past';
}

/** Sort key, newest first; a full date sorts before month-only and year-only in the same year. */
export const byDateDesc = <T extends { date: PartialDate }>(a: T, b: T) =>
  startOf(b.date) - startOf(a.date) || b.date.length - a.date.length;

const fmt = (lang: Lang, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale(lang), { timeZone: 'UTC', ...opts });

/** "2026" · "April 2026" · "23 April 2026", with ranges collapsed ("25–26 November 2026"). */
export function formatDate(date: PartialDate, lang: Lang, endDate?: PartialDate): string {
  const a = parts(date);
  const start = new Date(startOf(date));
  if (!a.m) return String(a.y);
  if (!a.day) return fmt(lang, { month: 'long', year: 'numeric' }).format(start);
  const full = fmt(lang, { day: 'numeric', month: 'long', year: 'numeric' });
  if (!endDate || endDate === date) return full.format(start);
  const b = parts(endDate);
  const end = new Date(startOf(endDate));
  if (a.y === b.y && a.m === b.m) {
    const monthYear = fmt(lang, { month: 'long', year: 'numeric' }).format(start);
    return `${a.day}–${b.day} ${monthYear}`;
  }
  return `${full.format(start)} – ${full.format(end)}`;
}

/** Short margin label: "Nov 2026", "Apr 2026" or "2026". */
export function formatShort(date: PartialDate, lang: Lang): string {
  const a = parts(date);
  if (!a.m) return String(a.y);
  return fmt(lang, { month: 'short', year: 'numeric' }).format(new Date(startOf(date)));
}

export function yearOf(date: PartialDate): number {
  return parts(date).y;
}

/** "June 2026" from an ISO-ish month, used for metrics and "last updated". */
export function monthYear(date: PartialDate | number, lang: Lang): string {
  const d = typeof date === 'number' ? new Date(date) : new Date(startOf(date));
  return fmt(lang, { month: 'long', year: 'numeric' }).format(d);
}
