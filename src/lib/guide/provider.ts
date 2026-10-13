// Which provider answers the research guide.
//
// Default: local only. The answer is composed from fuse.js matches over the content files
// (engine.ts); nothing leaves the browser.
//
// Optional LLM (later): set both, e.g. in .env.local or the Vercel project settings,
//   VITE_ASSISTANT_LLM=on
//   VITE_ASSISTANT_ENDPOINT=/api/guide        (your own serverless function)
// The endpoint receives POST { question, lang, context: GuideResult[] } and must return
// { answer: string }. The API key lives in that function, never in this front end. Any
// error or timeout falls back to the local answer, and the result cards always come from
// the local search, so every link points to real content on the site.
import type { Lang } from '../../content/types';
import type { GuideProvider } from './types';

const LLM_ON = import.meta.env.VITE_ASSISTANT_LLM === 'on' && Boolean(import.meta.env.VITE_ASSISTANT_ENDPOINT);

const local: GuideProvider = async (question, lang) => {
  const { answerLocally } = await import('./engine');
  return answerLocally(question, lang);
};

const llm: GuideProvider = async (question, lang: Lang) => {
  const base = await local(question, lang);
  if (!base.results.length) return base;
  try {
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 12_000);
    const res = await fetch(import.meta.env.VITE_ASSISTANT_ENDPOINT!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, lang, context: base.results }),
      signal: ctrl.signal,
    });
    window.clearTimeout(timer);
    if (!res.ok) return base;
    const data = (await res.json()) as { answer?: unknown };
    return typeof data.answer === 'string' && data.answer.trim() ? { ...base, text: data.answer.trim(), source: 'llm' } : base;
  } catch {
    return base;
  }
};

export const ask: GuideProvider = LLM_ON ? llm : local;
export const usesLlm = LLM_ON;
