import type { ReactNode } from 'react';
import { ArrowUpRight, Lock } from 'lucide-react';
import type { Link } from '../content/types';
import { useLang } from '../i18n/useLang';

/** External link with an arrow; opens in a new tab and says so to screen readers. */
export function Ext({
  href,
  children,
  className = 'link',
  arrow = true,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  arrow?: boolean;
}) {
  const { t } = useLang();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      {arrow && <ArrowUpRight size="0.9em" aria-hidden="true" className="ml-0.5 inline-block align-[-0.08em]" />}
      <span className="sr-only"> {t.common.opensNewTab}</span>
    </a>
  );
}

/** A row of small secondary links; links that need a UM6P login are marked with a lock. */
export function LinkRow({ links, className = '' }: { links: Link[]; className?: string }) {
  const { t } = useLang();
  if (!links.length) return null;
  return (
    <ul className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${className}`}>
      {links.map((l) => (
        <li key={l.url}>
          <Ext href={l.url} className={l.restricted ? 'link-quiet text-ink2' : 'link'}>
            {l.restricted && <Lock size="0.85em" aria-hidden="true" className="mr-1 inline-block align-[-0.05em]" />}
            {l.label}
            {l.restricted && <span className="sr-only"> ({t.common.loginNeeded})</span>}
          </Ext>
        </li>
      ))}
    </ul>
  );
}
