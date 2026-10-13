import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { Publication } from '../content/types';
import { apa, doiUrl } from '../lib/apa';
import { useLang } from '../i18n/useLang';
import { Ext, LinkRow } from './Ext';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers/contexts without the async clipboard API.
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** One bibliography entry: APA reference with hanging indent and quiet actions underneath. */
export default function PubEntry({ pub, showType = true }: { pub: Publication; showType?: boolean }) {
  const { t, lang } = useLang();
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const ref = apa(pub);

  const onCopy = async () => {
    const ok = await copyText(ref.text);
    setState(ok ? 'copied' : 'failed');
    window.setTimeout(() => setState('idle'), 2400);
  };

  return (
    <article className="group" lang={pub.lang}>
      <p className="hanging text-[1.0625rem] leading-[1.65]">
        {ref.segments.map((s, i) =>
          s.author ? (
            <strong key={i} className="font-semibold">
              {s.text}
            </strong>
          ) : s.italic ? (
            <i key={i}>{s.text}</i>
          ) : s.text.startsWith(' https://') ? null : (
            <span key={i}>{s.text}</span>
          ),
        )}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 pl-[1.75em] text-sm" lang={lang}>
        {showType && (
          <span className="tag text-ink3">
            {pub.year === 'in press' ? t.publications.inPress : t.publications.typeSingular[pub.type]}
          </span>
        )}
        {pub.doi ? (
          <Ext href={doiUrl(pub.doi)} className="link num">
            {t.publications.doi} {pub.doi}
          </Ext>
        ) : pub.url ? (
          <Ext href={pub.url} className="link">
            {t.publications.link}
          </Ext>
        ) : null}
        <button type="button" onClick={onCopy} className="btn-small no-print">
          {state === 'copied' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          {state === 'copied' ? t.publications.copied : state === 'failed' ? t.publications.copyFailed : t.publications.copy}
        </button>
        <span role="status" aria-live="polite" className="sr-only">
          {state === 'copied' ? t.publications.copied : state === 'failed' ? t.publications.copyFailed : ''}
        </span>
        {pub.links && <LinkRow links={pub.links} />}
      </div>
    </article>
  );
}
