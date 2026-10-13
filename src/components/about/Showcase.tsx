import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Link } from '../../content/types';
import { useLang } from '../../i18n/useLang';
import { LinkRow } from '../Ext';

export interface Entry {
  key: string;
  period?: string;
  title: ReactNode;
  sub?: ReactNode;
  detail?: ReactNode;
  links?: Link[];
}

/**
 * The top entries of a list as highlight cards; "Show all" reveals the rest as a list
 * whose rows slide in one after another (CSS, see .list-in in index.css).
 */
export default function Showcase({
  entries,
  top = 3,
  heading,
  tone = 'dark',
}: {
  entries: Entry[];
  top?: number;
  heading?: ReactNode;
  tone?: 'dark' | 'light';
}) {
  // Card titles sit one level below the block's own heading (h3) when there is one, else under the section's h2.
  const Title = heading ? 'h4' : 'h3';
  const { t } = useLang();
  const [all, setAll] = useState(false);
  const id = useId();
  const first = entries.slice(0, top);
  const rest = entries.slice(top);
  const card =
    tone === 'dark'
      ? 'card-dark spot group'
      : 'group relative rounded-3xl border border-ink/10 bg-white/60 transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-accent/30 hover:shadow-[0_40px_70px_-40px_rgb(120_50_20/0.45)]';

  return (
    <div>
      {heading}
      <ul data-reveal="stagger" className="grid gap-3 md:grid-cols-3 md:gap-4">
        {first.map((e) => (
          <li key={e.key} className={`${card} flex flex-col p-6`}>
            <div className="relative z-10 flex flex-1 flex-col">
              {e.period && <p className="num eyebrow">{e.period}</p>}
              <Title className="mt-4 font-serif text-[1.25rem] font-normal leading-snug">{e.title}</Title>
              {e.sub && <p className="mt-1 text-[0.9375rem] text-ink2">{e.sub}</p>}
              {e.detail && <div className="mt-3 line-clamp-5 text-sm text-ink2">{e.detail}</div>}
              {e.links && <LinkRow links={e.links} className="mt-auto pt-4" />}
            </div>
          </li>
        ))}
      </ul>

      {rest.length > 0 && (
        <>
          <ul id={id} hidden={!all} className="list-in mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {rest.map((e, i) => (
              <li
                key={e.key}
                style={{ '--i': i } as CSSProperties}
                className="grid grid-cols-1 gap-x-8 gap-y-1 py-5 sm:grid-cols-[9rem_1fr]"
              >
                <p className="num text-sm text-ink3 sm:pt-0.5">{e.period}</p>
                <div>
                  <p className="font-serif text-[1.125rem] leading-snug">{e.title}</p>
                  {e.sub && <p className="text-[0.9375rem] text-ink2">{e.sub}</p>}
                  {e.detail && <div className="prose-measure mt-1 text-sm text-ink2">{e.detail}</div>}
                  {e.links && <LinkRow links={e.links} className="mt-2" />}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6">
            <button type="button" className="btn-ghost" aria-expanded={all} aria-controls={id} onClick={() => setAll((v) => !v)}>
              {all ? t.about.showLess : t.about.showAll(entries.length)}
              <ChevronDown size={16} aria-hidden="true" className={`transition-transform duration-300 ${all ? 'rotate-180' : ''}`} />
            </button>
          </p>
        </>
      )}
    </div>
  );
}
