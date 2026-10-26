// One-time download of every image, video, font and Lottie file from Framer's CDN
// into ./static/assets, so the site no longer depends on Framer.
//   npm run fetch-assets          (skips files already downloaded)
//   npm run fetch-assets -- --force
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname } from 'node:path';

const CDN = 'https://framerusercontent.com';
const BIG = new Set(['1wzBEowK2y351jfw1XBWvuYZOCs', '7oEJoXgvi5hU5bI9WaKd9yqI']); // very tall images
const force = process.argv.includes('--force');
const list = JSON.parse(readFileSync(new URL('./assets.json', import.meta.url)));

const remote = (p) => {
  const file = p.split('/').pop();
  const id = file.split('.')[0];
  if (p.startsWith('/assets/img/')) return `${CDN}/images/${file}${file.endsWith('.svg') ? '' : `?scale-down-to=${BIG.has(id) ? 4096 : 2048}`}`;
  return `${CDN}/assets/${file}`;
};

let done = 0, skipped = 0, bytes = 0;
const failed = [];
async function get(p) {
  const dest = `static${p}`;
  if (!force && existsSync(dest) && statSync(dest).size > 0) { skipped++; return; }
  const url = remote(p);
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, buf);
      bytes += buf.length; done++;
      process.stdout.write(`\r${done + skipped}/${list.length}  ${p.padEnd(60)}`);
      return;
    } catch (e) {
      if (attempt === 3) failed.push(`${p}  (${url})  ${e.message}`);
    }
  }
}

const queue = [...list];
await Promise.all(Array.from({ length: 6 }, async () => { while (queue.length) await get(queue.shift()); }));
console.log(`\n\nDownloaded ${done} (${(bytes / 1e6).toFixed(1)} MB), skipped ${skipped} already present.`);
if (failed.length) { console.error(`\n${failed.length} failed:\n` + failed.join('\n')); process.exit(1); }
console.log('All assets in place. Run `npm run dev` to preview at http://localhost:3000.');
