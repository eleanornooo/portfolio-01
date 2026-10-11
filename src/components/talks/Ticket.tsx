import type { Talk } from '../../content/types';
import { useLang } from '../../i18n/useLang';
import { SELF } from '../../lib/apa';
import { formatDate, timing } from '../../lib/dates';
import { LinkRow } from '../Ext';
import { TimingTag } from '../Tags';

/**
 * A keynote or panel as an event ticket: an amber date stub, a perforated tear line with
 * notches (CSS mask, see .ticket), and the talk on the main part.
 */
export default function Ticket({ talk, now }: { talk: Talk; now: number }) {
  const { t, lang } = useLang();
  const [y, m, d] = talk.date.split('-');
  const month = m ? new Intl.DateTimeFormat(lang, { month: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(+y, +m - 1, 1))) : '';
  const others = talk.authors?.filter((a) => a !== SELF) ?? [];
  const when = timing(talk.date, talk.endDate, now);

  return (
    <article className="ticket group grid grid-cols-[6.5rem_1fr] sm:grid-cols-[9rem_1fr]">
      <div className="ticket-stub flex flex-col justify-between p-4 text-[#160b05] sm:p-5" aria-hidden="true">
        <span className="text-[0.5625rem] font-semibold uppercase tracking-[0.24em] opacity-70">{t.talks.admit}</span>
        <span>
          {d && <span className="num display block text-[2.75rem] leading-none tracking-[-0.04em] sm:text-[3.5rem]">{d}</span>}
          <span className="display block text-[1.125rem] uppercase leading-tight tracking-[-0.02em] sm:text-[1.375rem]">{month || y}</span>
          {month && <span className="num block text-sm font-semibold">{y}</span>}
        </span>
      </div>
      <div className="ticket-main min-w-0 p-5 sm:p-7" lang={talk.lang}>
        <div className="mb-3 flex flex-wrap items-center gap-2" lang={lang}>
          <TimingTag timing={when} />
          <span className="tag text-accent">{t.talks.types[talk.type]}</span>
          <span className="num ml-auto text-xs text-ink3">{talk.dateLabel ?? formatDate(talk.date, lang, talk.endDate)}</span>
        </div>
        <h3 className="font-serif text-[1.375rem] font-normal leading-snug md:text-[1.75rem]">{talk.title ?? talk.event}</h3>
        {talk.title && <p className="mt-2 text-ink2">{talk.event}</p>}
        <p className="mt-1 text-sm text-ink3">{[talk.location, talk.virtual ? t.talks.virtual : null].filter(Boolean).join(' · ')}</p>
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
