// Regenerates the optimised images in public/img from the originals in assets-src/.
// Run with: npm run images  (only needed when a source image changes)
import sharp from 'sharp';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, 'assets-src');
const out = path.join(root, 'public', 'img');

await mkdir(path.join(out, 'logos'), { recursive: true });

// Portrait: 4:5 crop centred on Aziz, three responsive widths.
const crop = { left: 170, top: 160, width: 736, height: 920 };
for (const w of [400, 560, 736]) {
  const file = path.join(out, `portrait-${w}.webp`);
  await sharp(path.join(src, 'portrait-source.jpg'))
    .extract(crop)
    .resize({ width: w })
    .webp({ quality: 78 })
    .toFile(file);
  console.log('portrait', w);
}
// Square headshot crop used by the JSON-LD and as the share-image source.
await sharp(path.join(src, 'portrait-source.jpg'))
  .extract({ left: 300, top: 340, width: 420, height: 420 })
  .resize(400)
  .webp({ quality: 80 })
  .toFile(path.join(out, 'portrait-square.webp'));

// Event photos (journey, gallery, keynotes): two widths each, aspect ratio kept.
await mkdir(path.join(out, 'events'), { recursive: true });
for (const f of await readdir(path.join(src, 'events'))) {
  const name = path.parse(f).name;
  for (const w of [640, 1200]) {
    await sharp(path.join(src, 'events', f))
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: w > 800 ? 72 : 70 })
      .toFile(path.join(out, 'events', `${name}-${w}.webp`));
  }
  console.log('event', name);
}

// Institution logos: grayscale, trimmed, on a white square tile.
for (const f of await readdir(path.join(src, 'logos'))) {
  const name = path.parse(f).name;
  const trimmed = await sharp(path.join(src, 'logos', f))
    .flatten({ background: '#ffffff' })
    .trim({ threshold: 12 })
    .toBuffer();
  await sharp(trimmed)
    .resize(84, 84, { fit: 'contain', background: '#ffffff' })
    .extend({ top: 6, bottom: 6, left: 6, right: 6, background: '#ffffff' })
    .grayscale()
    .webp({ quality: 82 })
    .toFile(path.join(out, 'logos', `${name}.webp`));
  console.log('logo', name);
}

// Favicons (the "m" + dot mark): see build-favicons.mjs.
await import('./build-favicons.mjs');
