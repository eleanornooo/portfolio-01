// Runs after `vite-react-ssg build`:
//  1. moves <meta charset> and viewport to the very top of <head> (react-helmet puts the
//     page <title> and meta tags before them; browsers want charset in the first 1 KB);
//  2. replaces the SSG's preload of *every* font file with a preload of the display face only
//     (the others load on demand via unicode-range), and drops the preload of the inlined CSS;
//  3. inlines the stylesheet (≈9 KB gzipped) so the first paint needs no extra request;
//  4. writes dist/sitemap.xml from the pre-rendered pages;
//  5. drops the cut-outs' 16 MB source PNGs (public/hero, public/about), which only feed `npm run images:hero`.
import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE = 'https://www.mimoudi.com';
const dist = path.resolve(import.meta.dirname, '..', 'dist');

await rm(path.join(dist, 'hero'), { recursive: true, force: true });
// Only the source PNG, then the folder if it is left empty (an empty dist/about/ could
// shadow about.html on some hosts; it would also hold the /about page if ever pre-rendered there).
await rm(path.join(dist, 'about', 'aziz-about-cutout.png'), { force: true });
if ((await readdir(path.join(dist, 'about')).catch(() => null))?.length === 0) await rm(path.join(dist, 'about'), { recursive: true });

const assets = await readdir(path.join(dist, 'assets'));
// Only the display face is preloaded (the hero title and the nav use it); preloading more
// fonts competes with the first paint on slow phones. The others load on demand (swap).
const criticalFonts = [/^bricolage-grotesque-latin-wght-normal-.*\.woff2$/]
  .map((re) => assets.find((f) => re.test(f)))
  .filter(Boolean)
  .map((f) => `<link rel="preload" as="font" type="font/woff2" href="/assets/${f}" crossorigin>`)
  .join('');

const cssCache = new Map();
for (const f of assets.filter((a) => a.endsWith('.css'))) {
  cssCache.set(`/assets/${f}`, await readFile(path.join(dist, 'assets', f), 'utf8'));
}

const htmlFiles = (await readdir(dist)).filter((f) => f.endsWith('.html'));
for (const f of htmlFiles) {
  const file = path.join(dist, f);
  let html = await readFile(file, 'utf8');
  const first = [];
  html = html.replace(/<meta charset="[^"]*"\s*\/?>|<meta name="viewport"[^>]*>/gi, (tag) => {
    first.push(tag);
    return '';
  });
  html = html.replace(/<head>/i, `<head>${first.join('')}`);
  html = html.replace(/<link rel="preload" as="font"[^>]*>/g, '');
  // The stylesheet is inlined below, so its preload would only download it a second time.
  html = html.replace(/<link rel="preload"[^>]*href="\/assets\/[^"]+\.css"[^>]*as="style"[^>]*>/g, '');
  html = html.replace(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/, (_tag, href) => {
    const css = cssCache.get(href);
    return `${criticalFonts}<style>${css}</style>`;
  });
  await writeFile(file, html);
}

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
