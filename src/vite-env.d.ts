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
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
