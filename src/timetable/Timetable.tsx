import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarPlus, Printer } from 'lucide-react';
import { semesters as localSemesters } from '../content/timetable';
import type { Semester, Session, SessionType, Weekday } from '../content/types';
import { useLang } from '../i18n/useLang';
import { useMounted, useNow } from '../hooks/useNow';
import Dialog from '../components/Dialog';
import { Ext } from '../components/Ext';
import { sheetToSemesters } from './csv';
import { buildIcs, downloadIcs } from './ics';
import {
  exceptionFor,
  isInSemester,
  nowAndNext,
  pickSemester,
  referenceMonday,
  sessionKey,
  type Occurrence,
} from './schedule';
import {
  addDays,
  fmtMinutes,
  MOROCCO_TZ,
  tzLabel,
  visitorTimeZone,
  wallTime,
  WEEKDAYS,
  zonedToInstant,
} from './time';

type Day = Weekday | 'Sun';
const HOUR_PX = 64;

const TYPE_VARS: Record<SessionType, string> = {
  Lecture: 'lecture',
  Seminar: 'seminar',
  'Office hours': 'office',
  Supervision: 'supervision',
};
const typeStyle = (type: SessionType) => ({
  backgroundColor: `rgb(var(--tt-${TYPE_VARS[type]}))`,
  borderColor: `rgb(var(--tt-${TYPE_VARS[type]}-line))`,
});

/** A session placed in the displayed week, converted to the display time zone. */
interface Placed extends Occurrence {
  day: Day;
  startMin: number;
  endMin: number;
  outside: boolean;
}

function placeWeek(sem: Semester, monday: string, tz: string): Placed[] {
  return sem.sessions
    .map((s) => {
      const date = addDays(monday, WEEKDAYS.indexOf(s.day));
      const start = zonedToInstant(date, s.start, MOROCCO_TZ);
      const end = zonedToInstant(date, s.end, MOROCCO_TZ);
      const a = wallTime(start, tz);
      const b = wallTime(end, tz);
      return {
        session: s,
        date,
        start,
        end,
        cancelled: exceptionFor(sem, s, date),
        outside: date < sem.start || date > sem.end,
        day: a.weekday,
        startMin: a.minutes,
        endMin: b.ymd === a.ymd ? b.minutes : 24 * 60,
      };
    })
    .sort((x, y) => x.start - y.start);
}

/** Loads the timetable: the Google Sheet if configured and reachable, otherwise the local file. */
function useSemesters() {
  const [state, setState] = useState<{ semesters: Semester[]; live: boolean }>({
    semesters: localSemesters,
    live: false,
  });
  useEffect(() => {
    const url = import.meta.env.VITE_TIMETABLE_SHEET_CSV;
    if (!url) return;
    const ctrl = new AbortController();
    fetch(url, { signal: ctrl.signal, cache: 'no-store' })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((text) => {
        const parsed = sheetToSemesters(text);
        if (parsed.length) setState({ semesters: parsed, live: true });
      })
      .catch(() => {
        /* keep the local fallback */
      });
    return () => ctrl.abort();
  }, []);
  return state;
}

export default function Timetable() {
  const { t, lang } = useLang();
  const now = useNow(30_000);
  const mounted = useMounted();
  const { semesters, live } = useSemesters();
  const [semId, setSemId] = useState<string | null>(null);
  const [zone, setZone] = useState<'morocco' | 'local'>('morocco');
  const [selected, setSelected] = useState<Placed | null>(null);
  const [agendaDay, setAgendaDay] = useState<Day | null>(null);
  const closeDetails = useCallback(() => setSelected(null), []);
  const semSelectId = useId();
  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';

  const sem = (semId && semesters.find((s) => s.id === semId)) || pickSemester(semesters, now);
  const visitorTz = mounted ? visitorTimeZone() : MOROCCO_TZ;
  const tzDiffers = mounted && tzLabel(visitorTz, now, 'en') !== tzLabel(MOROCCO_TZ, now, 'en');
  const tz = zone === 'local' && tzDiffers ? visitorTz : MOROCCO_TZ;

  const monday = sem ? referenceMonday(sem, now) : '';
  const placed = useMemo(() => (sem ? placeWeek(sem, monday, tz) : []), [sem, monday, tz]);

  if (!sem || sem.sessions.length === 0) {
    return <p className="border-y border-rule py-10 font-serif text-h3 font-light text-ink2">{t.timetable.empty}</p>;
  }

  const cols: Day[] = placed.some((p) => p.day === 'Sun') ? WEEKDAYS : WEEKDAYS.slice(0, 6);
  const firstHour = Math.floor(Math.min(...placed.map((p) => p.startMin)) / 60);
  const lastHour = Math.ceil(Math.max(...placed.map((p) => p.endMin)) / 60);
  const hours = Array.from({ length: Math.max(1, lastHour - firstHour) }, (_, i) => firstHour + i);
  const gridHeight = hours.length * HOUR_PX;

  // "Today" and the now-line only make sense once we know the visitor's clock.
  const weekStart = zonedToInstant(monday, '00:00', MOROCCO_TZ);
  const inThisWeek = mounted && now >= weekStart && now < weekStart + 7 * 864e5;
  const nowWall = wallTime(now, tz);
  const today: Day | null = inThisWeek ? nowWall.weekday : null;
  const nowTop = (nowWall.minutes - firstHour * 60) * (HOUR_PX / 60);
  const showNowLine = today !== null && nowTop >= 0 && nowTop <= gridHeight;

  const { current, next } = mounted ? nowAndNext(sem, now) : {};
  const timeIn = (ms: number) => fmtMinutes(wallTime(ms, tz).minutes);
  const dayIn = (ms: number) => t.timetable.daysShort[wallTime(ms, tz).weekday as Weekday] ?? '';

  // Long month names: short ones differ between ICU versions ("Sep"/"Sept") and would break hydration.
  const fmtDate = (ymd: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
    new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...opts }).format(new Date(`${ymd}T00:00:00Z`));

  const dayName = (d: Day) => (d === 'Sun' ? (lang === 'fr' ? 'Dimanche' : 'Sunday') : t.timetable.days[d]);
  const dayShort = (d: Day) => (d === 'Sun' ? (lang === 'fr' ? 'Dim' : 'Sun') : t.timetable.daysShort[d]);
  const label = (p: Placed) =>
    `${dayName(p.day)} ${fmtMinutes(p.startMin)}–${fmtMinutes(p.endMin)}, ${p.session.courseCode} ${p.session.title}, ${
      t.timetable.types[p.session.type]
    }, ${t.timetable.modes[p.session.mode]}${p.cancelled ? ` — ${p.cancelled.label}` : ''}`;

  const exportAll = () => downloadIcs(`timetable-${sem.id}.ics`, buildIcs(sem));
  const exportOne = (s: Session) =>
    downloadIcs(`${s.courseCode.replace(/\W+/g, '-').toLowerCase()}-${sem.id}.ics`, buildIcs(sem, [s]));

  // Phone agenda opens on today if there is something on, else on the next day with sessions.
  const hasSessions = (d: Day) => placed.some((p) => p.day === d);
  const fromToday = today ? [...cols.slice(cols.indexOf(today)), ...cols.slice(0, cols.indexOf(today))] : cols;
  const currentAgendaDay = agendaDay ?? fromToday.find(hasSessions) ?? cols[0];

  return (
    <div>
      {/* ---------------------------------------------------------- controls */}
      <div className="no-print flex flex-col gap-4 border-y border-rule py-4 lg:flex-row lg:flex-wrap lg:items-center">
        {semesters.length > 1 && (
          <div className="flex items-center gap-2">
            <label htmlFor={semSelectId} className="label">
              {t.timetable.semester}
            </label>
            <select
              id={semSelectId}
              value={sem.id}
              onChange={(e) => setSemId(e.target.value)}
              className="field w-auto py-1.5 text-sm"
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {tzDiffers && (
          <div role="group" aria-label={t.timetable.timezone} className="flex gap-1">
            <button type="button" className="chip" aria-pressed={zone === 'morocco'} onClick={() => setZone('morocco')}>
              {t.timetable.morocco}
            </button>
            <button type="button" className="chip" aria-pressed={zone === 'local'} onClick={() => setZone('local')}>
              {t.timetable.local} <span className="opacity-70">({tzLabel(visitorTz, now, locale)})</span>
            </button>
          </div>
        )}
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          <button type="button" className="btn-line py-2" onClick={exportAll}>
            <CalendarPlus size={16} aria-hidden="true" /> {t.timetable.addAll}
          </button>
          <button type="button" className="btn-line py-2" onClick={() => window.print()}>
            <Printer size={16} aria-hidden="true" /> {t.timetable.print}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------ status line */}
      <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink2">
          <span className="font-medium text-ink">{sem.name}</span>
          <span className="num">
            {' '}
            · {fmtDate(sem.start)} – {fmtDate(sem.end)}
          </span>
          <span>
            {' '}
            · {t.timetable.tzNote(`${tz === MOROCCO_TZ ? t.timetable.morocco : t.timetable.local}${mounted ? ` (${tzLabel(tz, now, locale)})` : ''}`)}
          </span>
          {live && <span className="text-ink3"> · {t.timetable.live}</span>}
        </p>
        <p className="min-h-[1.75rem]" aria-live="polite">
          {mounted && (current || next) && (
            <span className="inline-flex items-center gap-2 rounded-full border border-rule bg-paper2 px-3 py-1 text-sm">
              <span
                className={`h-2 w-2 rounded-full ${current ? 'bg-vivid motion-safe:animate-pulse' : 'bg-ink3'}`}
                aria-hidden="true"
              />
              {current ? (
                <span>
                  <strong className="font-medium">{t.timetable.nowTeaching}:</strong> {current.session.courseCode} ·{' '}
                  {t.timetable.until} {timeIn(current.end)}
                </span>
              ) : next ? (
                <span>
                  <strong className="font-medium">{t.timetable.next}:</strong> {next.session.courseCode} ·{' '}
                  <span className="num">
                    {wallTime(next.start, tz).ymd === nowWall.ymd ? t.timetable.today : dayIn(next.start)}{' '}
                    {timeIn(next.start)}
                  </span>
                </span>
              ) : null}
            </span>
          )}
          {mounted && !isInSemester(sem, now) && !next && (
            <span className="text-sm text-ink3">{t.timetable.outside}</span>
          )}
        </p>
      </div>

      {sem.sample && (
        <p className="mb-6 border-l-2 border-dashed border-vivid bg-paper2 px-4 py-3 text-sm text-ink2">
          {t.timetable.sample}
        </p>
      )}

      {/* ----------------------------------------------------- desktop grid */}
      <div className="tt-grid hidden overflow-x-auto md:block">
        <div
          className="grid min-w-[44rem]"
          style={{ gridTemplateColumns: `3.25rem repeat(${cols.length}, minmax(0, 1fr))` }}
        >
          <div />
          {cols.map((d) => (
            <div
              key={d}
              className={`border-b border-ink/70 px-2 pb-2 text-sm ${d === today ? 'font-medium text-accent' : 'text-ink2'}`}
            >
              {dayName(d)}
              {d === today && <span className="label ml-2 text-accent">{t.timetable.today}</span>}
            </div>
          ))}

          {/* hour gutter */}
          <div className="relative" style={{ height: gridHeight }}>
            {hours.map((h, i) => (
              <span key={h} className="num absolute -translate-y-1/2 text-[0.75rem] text-ink3" style={{ top: i * HOUR_PX }}>
                {fmtMinutes(h * 60)}
              </span>
            ))}
            {showNowLine && (
              <span
                className="num absolute right-1 -translate-y-1/2 rounded-sm bg-vivid px-1 text-[0.6875rem] font-medium text-paper"
                style={{ top: nowTop }}
              >
                {fmtMinutes(nowWall.minutes)}
              </span>
            )}
          </div>

          {cols.map((d) => (
            <div
              key={d}
              className={`relative border-l border-rule ${d === today ? 'bg-vivid/[0.06]' : ''}`}
              style={{
                height: gridHeight,
                backgroundImage: `repeating-linear-gradient(to bottom, rgb(var(--rule)) 0 1px, transparent 1px ${HOUR_PX}px)`,
              }}
            >
              {placed
                .filter((p) => p.day === d)
                .map((p) => {
                  const top = (p.startMin - firstHour * 60) * (HOUR_PX / 60);
                  const height = Math.max(28, (p.endMin - p.startMin) * (HOUR_PX / 60) - 3);
                  const dim = p.cancelled || p.outside;
                  return (
                    <button
                      key={sessionKey(p.session)}
                      type="button"
                      aria-haspopup="dialog"
                      aria-label={label(p)}
                      onClick={() => setSelected(p)}
                      className={`absolute inset-x-1 overflow-hidden rounded-[3px] border-l-[3px] px-2 py-1.5 text-left text-[0.8125rem] leading-tight text-ink transition-[filter] hover:brightness-[0.97] focus-visible:z-10 ${
                        dim ? 'opacity-50' : ''
                      }`}
                      style={{ top, height, ...typeStyle(p.session.type) }}
                    >
                      <span className="num block text-[0.75rem] text-ink2">
                        {fmtMinutes(p.startMin)}–{fmtMinutes(p.endMin)}
                      </span>
                      <span className={`block font-semibold ${p.cancelled ? 'line-through' : ''}`}>{p.session.courseCode}</span>
                      {height > 70 && <span className="block truncate text-ink2">{p.session.title}</span>}
                      {height > 96 && (
                        <span className="mt-0.5 block truncate text-[0.75rem] text-ink3">
                          {p.cancelled ? p.cancelled.label : p.session.mode === 'Online' ? t.timetable.modes.Online : p.session.room}
                        </span>
                      )}
                    </button>
                  );
                })}
              {showNowLine && d === today && (
                <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-20 h-0" style={{ top: nowTop }}>
                  <span className="absolute -left-[4px] -top-[4px] h-2 w-2 rounded-full bg-vivid" />
                  <span className="absolute inset-x-0 border-t-2 border-vivid" />
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ----------------------------------------------------- mobile agenda */}
      <Agenda
        cols={cols}
        today={today}
        day={currentAgendaDay}
        setDay={setAgendaDay}
        placed={placed}
        dayShort={dayShort}
        dayName={dayName}
        onOpen={setSelected}
      />

      {/* ------------------------------------------------------------ legend */}
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink2">
        {(Object.keys(TYPE_VARS) as SessionType[])
          .filter((ty) => sem.sessions.some((s) => s.type === ty))
          .map((ty) => (
            <li key={ty} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-[2px] border-l-[3px]" style={typeStyle(ty)} aria-hidden="true" />
              {t.timetable.types[ty]}
            </li>
          ))}
      </ul>

      {sem.exceptions.length > 0 && (
        <div className="mt-10">
          <h3 className="label mb-2 font-sans">{t.timetable.exceptions}</h3>
          <ul className="divide-y divide-rule border-y border-rule text-sm">
            {[...sem.exceptions]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((e) => {
                const past = mounted && e.date < wallTime(now, MOROCCO_TZ).ymd;
                return (
                  <li key={`${e.date}-${e.courseCode ?? 'all'}`} className={`flex flex-wrap gap-x-6 py-2.5 ${past ? 'text-ink3' : ''}`}>
                    <span className="num w-56">{fmtDate(e.date, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    <span>
                      {e.courseCode && <strong className="font-medium">{e.courseCode} — </strong>}
                      {e.label}
                    </span>
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {/* ----------------------------------------------------------- details */}
      <Dialog
        open={selected !== null}
        onClose={closeDetails}
        title={
          selected && (
            <>
              <span className="label mb-1 block font-sans text-accent">
                {selected.session.courseCode} · {t.timetable.types[selected.session.type]}
              </span>
              {selected.session.title}
            </>
          )
        }
      >
        {selected && (
          <div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 border-y border-rule py-4 text-sm">
              <dt className="label pt-0.5">{t.timetable.when}</dt>
              <dd>
                {dayName(selected.day)} <span className="num">{fmtMinutes(selected.startMin)}–{fmtMinutes(selected.endMin)}</span>
                <span className="text-ink3"> ({tzLabel(tz, selected.start, locale)})</span>
                <br />
                <span className="text-ink3">
                  {t.timetable.weekly} {fmtDate(sem.start)} {t.timetable.until} {fmtDate(sem.end)}
                </span>
              </dd>
              {selected.session.room && (
                <>
                  <dt className="label pt-0.5">{t.timetable.room}</dt>
                  <dd>{selected.session.room}</dd>
                </>
              )}
              {selected.session.programme && (
                <>
                  <dt className="label pt-0.5">{t.timetable.programme}</dt>
                  <dd>{selected.session.programme}</dd>
                </>
              )}
              <dt className="label pt-0.5">{t.timetable.mode}</dt>
              <dd>{t.timetable.modes[selected.session.mode]}</dd>
            </dl>
            {selected.cancelled && (
              <p className="mt-4 text-sm text-accent">
                {fmtDate(selected.date, { weekday: 'long', day: 'numeric', month: 'long' })}: {selected.cancelled.label}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="btn-solid" onClick={() => exportOne(selected.session)}>
                <CalendarPlus size={16} aria-hidden="true" /> {t.timetable.addOne}
              </button>
              {selected.session.link && (
                <Ext href={selected.session.link} className="btn-line">
                  {t.timetable.join}
                </Ext>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

/** Phone layout: day tabs, then that day's sessions as a list. */
function Agenda({
  cols,
  today,
  day,
  setDay,
  placed,
  dayShort,
  dayName,
  onOpen,
}: {
  cols: Day[];
  today: Day | null;
  day: Day;
  setDay: (d: Day) => void;
  placed: Placed[];
  dayShort: (d: Day) => string;
  dayName: (d: Day) => string;
  onOpen: (p: Placed) => void;
}) {
  const { t } = useLang();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();
  const items = placed.filter((p) => p.day === day);

  const onKey = (e: KeyboardEvent, i: number) => {
    const move = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!move) return;
    e.preventDefault();
    const j = (i + move + cols.length) % cols.length;
    setDay(cols[j]);
    tabs.current[j]?.focus();
  };

  return (
    <div className="tt-agenda md:hidden">
      <div role="tablist" aria-label={t.teaching.timetable} className="grid border-b border-rule" style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
        {cols.map((d, i) => {
          const active = d === day;
          const count = placed.filter((p) => p.day === d).length;
          return (
            <button
              key={d}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              id={`${base}-tab-${d}`}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls={`${base}-panel`}
              tabIndex={active ? 0 : -1}
              onClick={() => setDay(d)}
              onKeyDown={(e) => onKey(e, i)}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-sm ${active ? 'text-ink' : 'text-ink3'}`}
            >
              <span className={d === today ? 'font-medium text-accent' : ''}>{dayShort(d)}</span>
              <span className={`h-1 w-1 rounded-full ${count ? 'bg-current' : 'bg-transparent'}`} aria-hidden="true" />
              {active && <span className="absolute inset-x-1 -bottom-px h-[2px] bg-vivid" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${day}`} className="pt-2">
        <h3 className="sr-only">{dayName(day)}</h3>
        {items.length === 0 ? (
          <p className="py-8 text-sm text-ink3">{t.timetable.noSessions}</p>
        ) : (
          <ul className="divide-y divide-rule">
            {items.map((p) => (
              <li key={sessionKey(p.session)}>
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => onOpen(p)}
                  className={`grid w-full grid-cols-[4.25rem_1fr] gap-3 py-4 text-left ${p.cancelled || p.outside ? 'opacity-50' : ''}`}
                >
                  <span className="num text-sm">
                    {fmtMinutes(p.startMin)}
                    <span className="block text-ink3">{fmtMinutes(p.endMin)}</span>
                  </span>
                  <span className="border-l-[3px] pl-3" style={{ borderColor: typeStyle(p.session.type).borderColor }}>
                    <span className={`block font-medium ${p.cancelled ? 'line-through' : ''}`}>
                      {p.session.courseCode} — {p.session.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-ink2">
                      {t.timetable.types[p.session.type]} ·{' '}
                      {p.cancelled ? p.cancelled.label : p.session.mode === 'Online' ? t.timetable.modes.Online : (p.session.room ?? t.timetable.modes['On campus'])}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

