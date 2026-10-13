// Cut-out portraits → small alpha images (only needed when a source image changes).
// Run with: npm run images:hero
//   Home hero: public/hero/aziz-cutout.png (≈16 MB, not committed, not deployed)
//              → public/img/hero/aziz-cutout-{480,760,1100}.webp
//   About:     public/about/aziz-about-cutout.webp (pre-faded edges, 2048 px, committed)
//              → public/about/aziz-about-cutout-{760,1100}.webp + a PNG fallback (1100 px)
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const at = (p) => path.join(root, p);

const hero = at('public/hero/aziz-cutout.png');
if (existsSync(hero)) {
  await mkdir(at('public/img/hero'), { recursive: true });
  // Trim the transparent margin so the image box hugs the silhouette.
  const trimmed = await sharp(hero).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  console.log('hero trimmed to', trimmed.info.width, '×', trimmed.info.height);
  for (const w of [480, 760, 1100]) {
    await sharp(trimmed.data)
      .resize({ width: w })
      .webp({ quality: w > 800 ? 80 : 82, alphaQuality: 90, effort: 6 })
      .toFile(at(`public/img/hero/aziz-cutout-${w}.webp`));
    console.log('hero', w);
  }
} else console.log('No public/hero/aziz-cutout.png: hero skipped.');

const about = at('public/about/aziz-about-cutout.webp');
if (existsSync(about)) {
  // Not trimmed: the faded edges are part of the picture and the bottom must stay flush.
  for (const w of [760, 1100]) {
    await sharp(about).resize({ width: w }).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(at(`public/about/aziz-about-cutout-${w}.webp`));
    console.log('about', w);
  }
  await sharp(about).resize({ width: 1100 }).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(at('public/about/aziz-about-cutout-1100.png'));
  console.log('about png fallback');
} else console.log('No public/about/aziz-about-cutout.webp: About skipped.');
