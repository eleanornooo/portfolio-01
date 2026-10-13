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

// Monogram favicon set (drawn as strokes, so no font is needed).
const monogram = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#172033"/>
  <g fill="none" stroke="#F6F2EA" stroke-width="4.5" stroke-linecap="square" stroke-linejoin="miter">
    <polyline points="12,46 21,18 30,46"/>
    <line x1="15.6" y1="36" x2="26.4" y2="36"/>
    <polyline points="35,46 35,18 43.5,35 52,18 52,46"/>
  </g>
  <line x1="12" y1="53.5" x2="52" y2="53.5" stroke="#C8512B" stroke-width="2.5"/>
</svg>`;
await writeFile(path.join(root, 'public', 'favicon.svg'), monogram);
for (const [size, name] of [
  [32, 'favicon-32.png'],
  [180, 'apple-touch-icon.png'],
  [192, 'icon-192.png'],
  [512, 'icon-512.png'],
]) {
  await sharp(Buffer.from(monogram)).resize(size, size).png().toFile(path.join(root, 'public', name));
}
console.log('favicons done');
