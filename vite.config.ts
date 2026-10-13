import { existsSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import researchGraph from './scripts/research-graph-plugin';
// Loads the `ssgOptions` type augmentation for Vite's config.
import type {} from 'vite-react-ssg';

export default defineConfig({
  plugins: [react(), researchGraph()],
  define: {
    __BUILD_TIME__: JSON.stringify(Date.now()),
    // The "Download CV" button only appears once the PDF has been added to /public.
    __HAS_CV__: JSON.stringify(existsSync('public/CV_Aziz_Mimoudi_2026.pdf')),
  },
  ssgOptions: {
    // /about → about.html, served as /about by Vercel (cleanUrls).
    dirStyle: 'flat',
    formatting: 'none',
  },
});
