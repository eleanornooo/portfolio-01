// Favicon set from the "m" + dot mark (`npm run favicons`; also run by `npm run images`).
// - Browser tab: public/d-m-dot-transparent.svg is used as is (transparent; dark or light "m"
//   via prefers-color-scheme), linked from index.html.
// - Icons that need a background come from public/d-m-dot.svg (dark rounded square):
//   favicon.ico (32 px), apple-touch-icon.png (180), icon-192.png and icon-512.png (manifest).
// The "m" in both SVGs is an outline (no font needed), so every size renders the same.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const pub = path.resolve(import.meta.dirname, '..', 'public');
const svg = await readFile(path.join(pub, 'd-m-dot.svg'));
const png = (size) => sharp(svg, { density: Math.ceil((72 * size) / 64) * 2 }).resize(size, size).png().toBuffer();

for (const [size, name] of [
  [180, 'apple-touch-icon.png'],
  [192, 'icon-192.png'],
  [512, 'icon-512.png'],
]) {
  await writeFile(path.join(pub, name), await png(size));
}

// favicon.ico: one 32×32 PNG wrapped in an ICO container (supported by every current browser).
const ico32 = await png(32);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // no palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(ico32.length, 14); // image size
header.writeUInt32LE(22, 18); // image offset
await writeFile(path.join(pub, 'favicon.ico'), Buffer.concat([header, ico32]));

console.log('favicons done');
