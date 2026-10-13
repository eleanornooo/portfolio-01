// Builds an iCalendar (.ics) file in the browser: one weekly recurring event per session,
// repeating until the end of the semester, with cancelled dates and holidays as EXDATEs.
import type { Semester, Session } from '../content/types';
import { exceptionFor, sessionKey } from './schedule';
import { addDays, firstOnOrAfter, MOROCCO_TZ, zonedToInstant } from './time';

const CRLF = '\r\n';

const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Folds lines longer than 75 octets, as RFC 5545 requires. */
function fold(line: string): string {
  const bytes = new TextEncoder();
  if (bytes.encode(line).length <= 75) return line;
  const out: string[] = [];
  let cur = '';
  for (const ch of line) {
    if (bytes.encode(cur + ch).length > (out.length ? 74 : 75)) {
      out.push(cur);
      cur = ch;
    } else cur += ch;
  }
  out.push(cur);
  return out.join(`${CRLF} `);
}

const local = (ymd: string, hm: string) => `${ymd.replace(/-/g, '')}T${hm.replace(':', '')}00`;
const utcStamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

// Morocco is on UTC+1 except during Ramadan (UTC+0). Calendar apps that know the IANA
// zone (Google, Apple, Outlook.com) use their own rules; this block is a fallback for others.
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  `TZID:${MOROCCO_TZ}`,
  'BEGIN:STANDARD',
  'DTSTART:19700101T000000',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0100',
  'TZNAME:+01',
  'END:STANDARD',
  'END:VTIMEZONE',
];

function event(sem: Semester, s: Session, stamp: string): string[] {
  const first = firstOnOrAfter(sem.start, s.day);
  if (first > sem.end) return [];
  const until = utcStamp(zonedToInstant(addDays(sem.end, 1), '00:00', MOROCCO_TZ) - 1000);

  const exdates: string[] = [];
  for (let d = first; d <= sem.end; d = addDays(d, 7)) {
    if (exceptionFor(sem, s, d)) exdates.push(local(d, s.start));
  }
  const where = s.mode === 'Online' ? 'Online' : (s.room ?? 'UM6P Rabat Campus');
  const description = [s.programme && `Programme: ${s.programme}`, `Type: ${s.type}`, `Mode: ${s.mode}`, s.link]
    .filter(Boolean)
    .join('\n');

  return [
    'BEGIN:VEVENT',
    `UID:${sem.id}-${sessionKey(s).replace(/[^\w-]/g, '')}@mimoudi.com`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${MOROCCO_TZ}:${local(first, s.start)}`,
    `DTEND;TZID=${MOROCCO_TZ}:${local(first, s.end)}`,
    `RRULE:FREQ=WEEKLY;UNTIL=${until}`,
    ...(exdates.length ? [`EXDATE;TZID=${MOROCCO_TZ}:${exdates.join(',')}`] : []),
    `SUMMARY:${escape(`${s.courseCode} — ${s.title} (${s.type})`)}`,
    `LOCATION:${escape(where)}`,
    `DESCRIPTION:${escape(description)}`,
    ...(s.link ? [`URL:${s.link}`] : []),
    'END:VEVENT',
  ];
}

export function buildIcs(sem: Semester, sessions: Session[] = sem.sessions): string {
  const stamp = utcStamp(Date.now());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//mimoudi.com//Timetable//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escape(`Aziz Mimoudi — ${sem.name}`)}`,
    `X-WR-TIMEZONE:${MOROCCO_TZ}`,
    ...VTIMEZONE,
    ...sessions.flatMap((s) => event(sem, s, stamp)),
    'END:VCALENDAR',
  ];
  return lines.map(fold).join(CRLF) + CRLF;
}

/** Triggers a download of the .ics file. */
export function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
