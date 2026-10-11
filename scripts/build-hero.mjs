// Hero cut-out: turns the transparent source PNG (public/hero/aziz-cutout.png, ≈16 MB, not
// committed and not deployed) into small alpha WebPs in public/img/hero.
// Run with: npm run images:hero  (only needed when the source image changes)
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const source = path.join(root, 'public', 'hero', 'aziz-cutout.png');
const out = path.join(root, 'public', 'img', 'hero');

if (!existsSync(source)) {
  console.log('No public/hero/aziz-cutout.png: the hero keeps its placeholder.');
  process.exit(0);
}
await mkdir(out, { recursive: true });

// Trim the transparent margin so the image box hugs the silhouette.
const trimmed = await sharp(source).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
console.log('trimmed to', trimmed.info.width, '×', trimmed.info.height);
for (const w of [480, 760, 1100]) {
  await sharp(trimmed.data)
    .resize({ width: w })
    .webp({ quality: w > 800 ? 80 : 82, alphaQuality: 90, effort: 6 })
    .toFile(path.join(out, `aziz-cutout-${w}.webp`));
  console.log('cutout', w);
}
