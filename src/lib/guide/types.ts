// Shapes shared by the research guide's providers (local search now, an LLM later).
import type { Lang } from '../../content/types';

export type ResultKind = 'publication' | 'project' | 'theme' | 'talk' | 'course' | 'profile' | 'supervision';

export interface GuideResult {
  id: string;
  kind: ResultKind;
  title: string;
  meta: string;
  /** Internal link (route + optional #anchor). */
  href: string;
  summary?: string;
}

export interface GuideAnswer {
  text: string;
  results: GuideResult[];
  /** Where the text came from: composed from local matches, or written by an LLM from them. */
  source: 'local' | 'llm';
}

/** Anything that can answer a question: the local composer, or an LLM endpoint. */
export type GuideProvider = (question: string, lang: Lang) => Promise<GuideAnswer>;
