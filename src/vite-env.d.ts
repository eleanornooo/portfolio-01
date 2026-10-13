/// <reference types="vite/client" />

/** Build timestamp (ms), injected by vite.config.ts — used for "Last updated" and as SSR "now". */
declare const __BUILD_TIME__: number;
/** True when public/CV_Aziz_Mimoudi_2026.pdf exists at build time. */
declare const __HAS_CV__: boolean;

interface ImportMetaEnv {
  readonly VITE_EMAILJS_SERVICE_ID?: string;
  readonly VITE_EMAILJS_TEMPLATE_ID?: string;
  readonly VITE_EMAILJS_PUBLIC_KEY?: string;
  readonly VITE_TIMETABLE_SHEET_CSV?: string;
  /** Optional LLM endpoint for the research guide (e.g. a Vercel function). Unset = local answers only. */
  readonly VITE_ASSISTANT_ENDPOINT?: string;
  /** "on" lets that endpoint write the guide's answers (see src/lib/guide/provider.ts). */
  readonly VITE_ASSISTANT_LLM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Hero network layout, precomputed at build time (see scripts/research-graph-plugin.ts). */
declare module 'virtual:research-graph' {
  export const positions: number[];
}
