// Zero-dependency local server for ./dist with Vercel-style clean URLs.
//   node scripts/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../dist/', import.meta.url)); // fileURLToPath: the folder path may contain spaces
const PORT = Number(process.argv[2] || process.env.PORT || 3000);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};
const REDIRECTS = { '/projects': '/Projects', '/projects/': '/Projects' };

async function resolve(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  const candidates = clean.endsWith('/') ? [join(clean, 'index.html')] : [clean, `${clean}.html`, join(clean, 'index.html')];
  for (const c of candidates) {
    try { const p = join(ROOT, c); if ((await stat(p)).isFile()) return p; } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const path = new URL(req.url, 'http://x').pathname;
  if (REDIRECTS[path]) { res.writeHead(308, { Location: REDIRECTS[path] }); return res.end(); }
  const file = await resolve(path);
  if (!file) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end(`404: ${path}`); }
  const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
  const size = (await stat(file)).size;
  const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
  if (range) {
    // Safari needs byte ranges to play video
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Number(range[2]) : size - 1;
    const buf = (await readFile(file)).subarray(start, end + 1);
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': buf.length });
    return res.end(buf);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
  res.end(await readFile(file));
}).on('error', (e) => {
  console.error(e.code === 'EADDRINUSE' ? `Port ${PORT} is busy. Try: npm run dev -- 3001` : e.message);
  process.exit(1);
}).listen(PORT, () => console.log(`\n  NO/ONES/WATCHING running at http://localhost:${PORT}\n  (Ctrl+C to stop)\n`));
