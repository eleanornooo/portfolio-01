// Cut-out portraits: turns the transparent source PNGs (≈16 MB each, not committed and not
// deployed) into small alpha WebPs:
//   public/hero/aziz-cutout.png        → public/img/hero/aziz-cutout-{480,760,1100}.webp   (Home hero)
//   public/about/aziz-about-cutout.png → public/img/about/aziz-about-cutout-{480,760,1100}.webp (About)
// Run with: npm run images:hero  (only needed when a source image changes)
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const jobs = [
  { source: 'public/hero/aziz-cutout.png', out: 'public/img/hero', name: 'aziz-cutout' },
  { source: 'public/about/aziz-about-cutout.png', out: 'public/img/about', name: 'aziz-about-cutout' },
];

for (const job of jobs) {
  const source = path.join(root, job.source);
  if (!existsSync(source)) {
    console.log(`No ${job.source}: skipped.`);
    continue;
  }
  const out = path.join(root, job.out);
  await mkdir(out, { recursive: true });

  // Trim the transparent margin so the image box hugs the silhouette.
  const trimmed = await sharp(source).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
  console.log(job.name, 'trimmed to', trimmed.info.width, '×', trimmed.info.height);
  for (const w of [480, 760, 1100]) {
    await sharp(trimmed.data)
      .resize({ width: w })
      .webp({ quality: w > 800 ? 80 : 82, alphaQuality: 90, effort: 6 })
      .toFile(path.join(out, `${job.name}-${w}.webp`));
    console.log(job.name, w);
  }
}
