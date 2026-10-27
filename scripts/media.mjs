// Derive thumbnails, video posters and a size manifest from the media in static/assets.
//   node scripts/media.mjs            (needs ffmpeg + ffprobe on the PATH)
// Writes:
//   static/assets/thumb/<id>.jpg     640px wide, for grid tiles, filmstrips and index rows
//   static/assets/poster/<id>.jpg    1280px wide first frame of each video (lightbox poster)
//   src/media-manifest.json          { id: { width, height } } for aspect ratios
// Run it again after adding files to static/assets/{img,video}. Outputs are committed.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, basename, extname } from 'node:path';
import { projects, singles } from '../src/work.mjs';

const IMG = 'static/assets/img', VID = 'static/assets/video';
const THUMB = 'static/assets/thumb', POSTER = 'static/assets/poster';
mkdirSync(THUMB, { recursive: true }); mkdirSync(POSTER, { recursive: true });

// Background colour declared in work.mjs, used to flatten transparent PNGs.
const bgOf = {};
for (const p of projects) for (const [m] of p.assets) if (m.bg) bgOf[m.id] = m.bg;
for (const [m] of singles) if (m.bg) bgOf[m.id] = m.bg;

// Display size. Several videos are stored with non-square pixels (sample aspect ratio),
// e.g. 1440x1080 at 3:4 displays as a 1080x1080 square; browsers honour that, so must we.
const probe = (file) => {
  const out = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,sample_aspect_ratio', '-of', 'csv=p=0', file]).toString().trim();
  const [w, h, sar] = out.split(',');
  const [sn, sd] = (sar && sar !== 'N/A' ? sar : '1:1').split(':').map(Number);
  const k = sn && sd ? sn / sd : 1;
  return { width: Math.round(Number(w) * k), height: Number(h) };
};
// video frames resampled to square pixels before scaling
const SQUARE = 'scale=iw*sar:ih,setsar=1';
const ffmpeg = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);

const manifest = {};
let made = 0;

for (const f of readdirSync(IMG)) {
  const id = basename(f, extname(f));
  if (id === 'AGzsB6H28fPQW2ZNTdGj0kZCqZs' || id === 'GD3vUS9JXVVwY5rzJ312DTkuM') continue; // favicon, og image
  const src = join(IMG, f);
  manifest[id] = probe(src);
  const out = join(THUMB, `${id}.jpg`);
  if (!existsSync(out)) {
    const bg = (bgOf[id] || '#ffffff').replace('#', '0x');
    // flatten alpha onto the tile background, then scale
    ffmpeg(['-i', src, '-filter_complex', `[0]format=rgba,scale=640:-2[a];color=c=${bg}:s=640x4000[b];[b][a]scale2ref[b2][a2];[b2][a2]overlay=shortest=1,format=yuvj420p`, '-q:v', '4', out]);
    made++;
  }
}

for (const f of readdirSync(VID)) {
  const id = basename(f, extname(f));
  const src = join(VID, f);
  manifest[id] = probe(src);
  const poster = join(POSTER, `${id}.jpg`), thumb = join(THUMB, `${id}.jpg`);
  if (!existsSync(poster)) { ffmpeg(['-ss', '0.5', '-i', src, '-frames:v', '1', '-vf', `${SQUARE},scale=1280:-2`, '-q:v', '4', poster]); made++; }
  if (!existsSync(thumb)) { ffmpeg(['-ss', '0.5', '-i', src, '-frames:v', '1', '-vf', `${SQUARE},scale=640:-2`, '-q:v', '4', thumb]); made++; }
}

const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
writeFileSync('src/media-manifest.json', JSON.stringify(sorted, null, 1) + '\n');
console.log(`${Object.keys(manifest).length} media files probed, ${made} derived files written`);
