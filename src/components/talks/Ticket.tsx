import type { Talk } from '../../content/types';
import { useLang } from '../../i18n/useLang';
import { SELF } from '../../lib/apa';
import { timing } from '../../lib/dates';
import { talkDate } from '../../lib/talk-cities';
import { LinkRow } from '../Ext';
import { TimingTag } from '../Tags';
import { Place } from './Place';

/**
 * A keynote or panel as an event ticket: an amber stub (his role, then the date), a
 * perforated tear line with notches (CSS mask, see .ticket), and the talk on the main part.
 * The stub always uses one centred layout: day / month / year, or month / year.
 */
export default function Ticket({ talk, now }: { talk: Talk; now: number }) {
  const { t, lang } = useLang();
  const [y, m, d] = talk.date.split('-');
  const month = m ? new Intl.DateTimeFormat(lang, { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(+y, +m - 1, 1))) : '';
  const others = talk.authors?.filter((a) => a !== SELF) ?? [];
  const when = timing(talk.date, talk.endDate, now);

  return (
    <article className="ticket group grid grid-cols-[6.5rem_1fr] sm:grid-cols-[9rem_1fr]">
      <div className="ticket-stub flex flex-col items-center justify-center gap-4 px-3 py-5 text-center text-[#160b05]" aria-hidden="true">
        <span className="text-[0.5625rem] font-semibold uppercase leading-snug tracking-[0.2em] opacity-75">{t.talks.stubRole[talk.type]}</span>
        <span className="flex flex-col items-center">
          {d ? (
            <>
              <span className="num display text-[2.75rem] leading-none tracking-[-0.04em] sm:text-[3.25rem]">{+d}</span>
              <span className="display text-[1.125rem] uppercase leading-tight tracking-[-0.02em] sm:text-[1.25rem]">{month.replace('.', '')}</span>
            </>
          ) : month ? (
            <span className="display text-[2rem] uppercase leading-none tracking-[-0.03em] sm:text-[2.5rem]">{month.replace('.', '')}</span>
          ) : null}
          <span className="num mt-1 text-sm font-semibold">{y}</span>
        </span>
      </div>
      <div className="ticket-main min-w-0 p-5 sm:p-6" lang={talk.lang}>
        <div className="mb-3 flex flex-wrap items-center gap-2" lang={lang}>
          <TimingTag timing={when} />
          <span className="tag text-accent">{t.talks.types[talk.type]}</span>
          <span className="num ml-auto text-xs text-ink3">{talkDate(talk, lang)}</span>
        </div>
        <h3 className="font-serif text-[1.3125rem] font-normal leading-snug md:text-[1.5rem]">{talk.title ?? talk.event}</h3>
        {talk.title && <p className="mt-2 text-ink2">{talk.event}</p>}
        <Place talk={talk} className="mt-1" />
        {others.length > 0 && (
          <p className="mt-1 text-sm text-ink3" lang={lang}>
            {t.talks.withAuthors} {others.join('; ')}
          </p>
        )}
        {talk.note && <p className="mt-2 text-sm text-ink2">{talk.note}</p>}
        {talk.links && <LinkRow links={talk.links} className="mt-3" />}
      </div>
    </article>
  );
}
