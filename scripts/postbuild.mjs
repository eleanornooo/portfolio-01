// Runs after `vite-react-ssg build`: writes dist/sitemap.xml from the pre-rendered pages.
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://www.mimoudi.com';
const dist = path.resolve(import.meta.dirname, '..', 'dist');

const pages = (await readdir(dist))
  .filter((f) => f.endsWith('.html') && f !== '404.html')
  .map((f) => (f === 'index.html' ? '/' : `/${f.replace(/\.html$/, '')}`))
  .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

const today = new Date().toISOString().slice(0, 10);
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${SITE}${p}</loc>
    <lastmod>${today}</lastmod>
    <priority>${p === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

await writeFile(path.join(dist, 'sitemap.xml'), xml);
console.log(`sitemap.xml: ${pages.length} pages`);
