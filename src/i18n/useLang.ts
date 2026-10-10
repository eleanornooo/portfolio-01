import { createContext, useContext } from 'react';
import type { Lang, Localized } from '../content/types';
import type { Strings } from './strings';

export interface LangContextValue {
  lang: Lang;
  t: Strings;
  setLang: (l: Lang) => void;
  /** Picks the right language from a Localized value. */
  pick: (v: Localized) => string;
}

export const LangContext = createContext<LangContextValue | null>(null);

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}
