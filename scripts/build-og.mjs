// Share images (Open Graph): `npm run og`.
// Renders scripts/og-template.html at 1200×630 in headless Chrome for every page and language
// listed in src/lib/og.json, and writes public/<file> as JPEG (kept under 300 KB).
// Needs Google Chrome (or set CHROME_PATH). Not part of `npm run build`: run it after changing
// the text or the portrait, and give changed images a new file name in og.json.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const og = JSON.parse(await readFile(path.join(root, 'src/lib/og.json'), 'utf8'));
const mark = (await readFile(path.join(root, 'public/d-m-dot-transparent.svg'), 'utf8')).match(/ d="([^"]+)"/)[1];
const template = pathToFileURL(path.join(root, 'scripts/og-template.html')).href;

const chrome =
  process.env.CHROME_PATH ??
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
  ].find((p) => existsSync(p));
if (!chrome) throw new Error('Chrome not found: set CHROME_PATH');

const profile = await mkdtemp(path.join(os.tmpdir(), 'og-'));
const port = 9400 + Math.floor(Math.random() * 400);
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, '--allow-file-access-from-files', '--hide-scrollbars', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let targets;
for (let i = 0; i < 50 && !targets; i++) {
  try {
    targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  } catch {
    await sleep(200);
  }
}
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) pending.get(m.id)(m.result), pending.delete(m.id);
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false });
for (const [key, langs] of Object.entries(og.images)) {
  for (const [lang, img] of Object.entries(langs)) {
    const data = { ...img, name: og.name[lang], title: og.title[lang], m: mark };
    await send('Page.navigate', { url: `${template}?${key}-${lang}#${encodeURIComponent(JSON.stringify(data))}` });
    for (let i = 0; i < 50; i++) {
      const r = await send('Runtime.evaluate', { expression: "document.body?.hasAttribute('data-ready') && [...document.images].every((i) => i.complete)", returnByValue: true });
      if (r.result.value) break;
      await sleep(100);
    }
    await sleep(150);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    let quality = 86;
    let jpg;
    do {
      jpg = await sharp(Buffer.from(shot.data, 'base64')).jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' }).toBuffer();
      quality -= 6;
    } while (jpg.length > 290_000 && quality > 50);
    await writeFile(path.join(root, 'public', img.file), jpg);
    console.log(`${img.file}  ${Math.round(jpg.length / 1024)} KB`);
  }
}
ws.close();
proc.kill();
await sleep(300);
await rm(profile, { recursive: true, force: true }).catch(() => {});
