// Downloads the licensed clips in config/footage-licenses.json and cuts them to 1080x1920 for promo compositions.
// Usage: node video/prepare-promo-clips.mjs [--cache dir]. Output: video/public/generated/promo/clips/<name>.mp4 (gitignored).
import {readFileSync, mkdirSync, existsSync, statSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(join(here, '../config/footage-licenses.json'), 'utf8'));
const ci = process.argv.indexOf('--cache'), cache = ci > 0 ? process.argv[ci + 1] : join(here, 'public/generated/promo/source');
const out = join(here, 'public/generated/promo/clips');
mkdirSync(cache, {recursive: true}); mkdirSync(out, {recursive: true});
for (const c of cfg.clips) {
  if (!cfg.licenses[c.license]) throw new Error(`${c.name}: unknown license ${c.license}`);
  const src = join(cache, `${c.provider}-${c.id}.mp4`);
  if (!existsSync(src) || statSync(src).size < 100000) {
    const res = await fetch(c.source);
    if (!res.ok) throw new Error(`${c.name}: download failed ${res.status}`);
    writeFileSync(src, Buffer.from(await res.arrayBuffer()));
  }
  const {start, duration, x} = c.cut;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(start), '-t', String(duration), '-i', src, '-an', '-vf',
    `crop=ih*9/16:ih:(iw-ih*9/16)*${x}:0,scale=1080:1920,fps=30,eq=contrast=1.08:saturation=0.85`,
    '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', join(out, `${c.name}.mp4`)]);
  console.log(`${c.name} ok`);
}
