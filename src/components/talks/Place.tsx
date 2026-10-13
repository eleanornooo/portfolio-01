import type { Talk } from '../../content/types';
import { useLang } from '../../i18n/useLang';

/** A talk's place, with a small "virtual" tag for events held online (the host city stays). */
export function Place({ talk, className = '' }: { talk: Talk; className?: string }) {
  const { t, lang } = useLang();
  if (!talk.location && !talk.virtual) return null;
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink3 ${className}`} lang={lang}>
      {talk.location && <span>{talk.location}</span>}
      {talk.virtual && (
        <span className="rounded-full border border-ink/20 px-2 py-px text-[0.6875rem] uppercase leading-normal tracking-[0.12em]">
          {t.talks.virtual}
        </span>
      )}
    </p>
  );
}
