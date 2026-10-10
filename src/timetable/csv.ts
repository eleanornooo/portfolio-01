// Parses the timetable Google Sheet ("File → Share → Publish to web → CSV").
// Columns (header row, any order):
//   semester, semester_start, semester_end, day, start, end, course_code, title, type,
//   room, programme, mode, link, exception_date, exception_label
// A row with `day` is a weekly session. A row with `exception_date` is a cancellation
// (for `course_code` only, or for every session when course_code is empty).
// Empty semester cells repeat the value of the row above.
import type { Semester, Session, SessionMode, SessionType, Weekday } from '../content/types';

/** RFC 4180 CSV → rows of cells (handles quotes, escaped quotes and newlines in quotes). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((x) => x.trim() !== ''));
}

const DAY_ALIASES: Record<string, Weekday> = {
  mon: 'Mon', monday: 'Mon', lun: 'Mon', lundi: 'Mon',
  tue: 'Tue', tuesday: 'Tue', mar: 'Tue', mardi: 'Tue',
  wed: 'Wed', wednesday: 'Wed', mer: 'Wed', mercredi: 'Wed',
  thu: 'Thu', thursday: 'Thu', jeu: 'Thu', jeudi: 'Thu',
  fri: 'Fri', friday: 'Fri', ven: 'Fri', vendredi: 'Fri',
  sat: 'Sat', saturday: 'Sat', sam: 'Sat', samedi: 'Sat',
};
const TYPES: SessionType[] = ['Lecture', 'Seminar', 'Office hours', 'Supervision'];
const time = (v: string) => {
  const m = v.trim().match(/^(\d{1,2})[:h.](\d{2})$/);
  return m ? `${m[1].padStart(2, '0')}:${m[2]}` : null;
};
const date = (v: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v.trim()) ? v.trim() : null);

/** Converts sheet rows to semesters. Invalid rows are skipped; returns [] if nothing usable. */
export function sheetToSemesters(text: string): Semester[] {
  const [header, ...rows] = parseCsv(text);
  if (!header) return [];
  const col = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name);
  const idx = Object.fromEntries(
    [
      'semester', 'semester_start', 'semester_end', 'day', 'start', 'end', 'course_code', 'title',
      'type', 'room', 'programme', 'mode', 'link', 'exception_date', 'exception_label',
    ].map((n) => [n, col(n)]),
  ) as Record<string, number>;
  if (idx.semester < 0 || idx.day < 0) return [];

  const byName = new Map<string, Semester>();
  let last = { name: '', start: '', end: '' };
  for (const r of rows) {
    const get = (k: string) => (idx[k] >= 0 ? (r[idx[k]] ?? '').trim() : '');
    const name = get('semester') || last.name;
    const start = date(get('semester_start')) ?? (name === last.name ? last.start : '');
    const end = date(get('semester_end')) ?? (name === last.name ? last.end : '');
    if (!name || !start || !end) continue;
    last = { name, start, end };
    const sem =
      byName.get(name) ??
      byName
        .set(name, {
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name,
          start,
          end,
          sessions: [],
          exceptions: [],
        })
        .get(name)!;

    const exDate = date(get('exception_date'));
    if (exDate) {
      sem.exceptions.push({
        date: exDate,
        label: get('exception_label') || 'Cancelled',
        courseCode: get('course_code') || undefined,
      });
      continue;
    }

    const day = DAY_ALIASES[get('day').toLowerCase()];
    const s = time(get('start'));
    const e = time(get('end'));
    if (!day || !s || !e || s >= e) continue;
    const type = TYPES.find((ty) => ty.toLowerCase() === get('type').toLowerCase()) ?? 'Lecture';
    const mode: SessionMode = /online|en ligne|distance/i.test(get('mode')) ? 'Online' : 'On campus';
    const link = get('link');
    const session: Session = {
      day,
      start: s,
      end: e,
      courseCode: get('course_code') || get('title') || 'Session',
      title: get('title') || get('course_code'),
      type,
      mode,
      room: get('room') || undefined,
      programme: get('programme') || undefined,
      link: /^https?:\/\//.test(link) ? link : undefined,
    };
    sem.sessions.push(session);
  }
  return [...byName.values()].filter((s) => s.sessions.length > 0);
}
