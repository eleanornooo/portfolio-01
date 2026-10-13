import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '../content/types';
import { contentFr } from './content-fr';
import { strings, type Strings } from './strings';
import { LangContext, type LangContextValue } from './useLang';

const STORAGE_KEY = 'lang';

function readStored(): Lang | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === 'fr' || v === 'en' ? v : null;
  } catch {
    return null;
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  // Pages are pre-rendered in English; the saved choice is applied after hydration.
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const stored = readStored();
    if (stored && stored !== 'en') setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* storage unavailable (private mode) — keep the choice for this visit only */
    }
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({ lang, t: strings[lang] as Strings, setLang, pick: (v) => v[lang], tx: (s) => (lang === 'fr' ? (contentFr[s] ?? s) : s) }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
