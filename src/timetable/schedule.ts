import type { Semester, Session, TimetableException } from '../content/types';
import { addDays, mondayOf, MOROCCO_TZ, WEEKDAYS, wallTime, zonedToInstant } from './time';

export interface Occurrence {
  session: Session;
  /** Calendar date in Morocco ("YYYY-MM-DD"). */
  date: string;
  start: number;
  end: number;
  cancelled?: TimetableException;
}

export const sessionKey = (s: Session) => `${s.courseCode}-${s.day}-${s.start}`;

const todayInMorocco = (now: number) => wallTime(now, MOROCCO_TZ).ymd;

/** The semester running now; otherwise the next one; otherwise the most recent. */
export function pickSemester(semesters: Semester[], now: number): Semester | undefined {
  const today = todayInMorocco(now);
  const sorted = [...semesters].sort((a, b) => a.start.localeCompare(b.start));
  return (
    sorted.find((s) => s.start <= today && today <= s.end) ??
    sorted.find((s) => s.start > today) ??
    sorted[sorted.length - 1]
  );
}

export function exceptionFor(sem: Semester, s: Session, date: string) {
  return sem.exceptions.find((e) => e.date === date && (!e.courseCode || e.courseCode === s.courseCode));
}

/** Monday of the week to display: this week, clamped to the semester. */
export function referenceMonday(sem: Semester, now: number): string {
  const today = todayInMorocco(now);
  const clamped = today < sem.start ? sem.start : today > sem.end ? sem.end : today;
  return mondayOf(clamped);
}

export function occurrencesForWeek(sem: Semester, monday: string): Occurrence[] {
  const out: Occurrence[] = [];
  for (const s of sem.sessions) {
    const date = addDays(monday, WEEKDAYS.indexOf(s.day));
    if (date < sem.start || date > sem.end) continue;
    out.push({
      session: s,
      date,
      start: zonedToInstant(date, s.start, MOROCCO_TZ),
      end: zonedToInstant(date, s.end, MOROCCO_TZ),
      cancelled: exceptionFor(sem, s, date),
    });
  }
  return out.sort((a, b) => a.start - b.start);
}

/** The session happening now (if any) and the next one, looking up to three weeks ahead. */
export function nowAndNext(sem: Semester, now: number): { current?: Occurrence; next?: Occurrence } {
  let monday = mondayOf(todayInMorocco(now));
  for (let w = 0; w < 4; w++) {
    const occ = occurrencesForWeek(sem, monday).filter((o) => !o.cancelled && o.end > now);
    const current = occ.find((o) => o.start <= now);
    const next = occ.find((o) => o.start > now);
    if (current || next) return { current, next };
    monday = addDays(monday, 7);
  }
  return {};
}

export function isInSemester(sem: Semester, now: number): boolean {
  const today = todayInMorocco(now);
  return sem.start <= today && today <= sem.end;
}
