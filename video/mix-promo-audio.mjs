// Mixes music and sound effects onto a silent promo render, from the spec's `sound` section and config/sound-library.json.
// Usage: node video/mix-promo-audio.mjs <spec.json> [--in silent.mp4] [--out final.mp4]
// Music: time-stretched to the spec tempo (pitch kept), muffled and silenced on the spec's ranges, faded out at the end.
// Effects: each cue = [name, seconds, gain?, "reverse"?]. Output is AAC 48 kHz, loudness-normalised to about -14 LUFS.
import {readFileSync, existsSync, mkdirSync, writeFileSync, statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), root = resolve(here, '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const spec = JSON.parse(readFileSync(resolve(process.argv[2]), 'utf8')), lib = JSON.parse(readFileSync(join(root, 'config/sound-library.json'), 'utf8'));
const snd = spec.sound; if (!snd) throw new Error('spec has no sound section');
const cache = join(here, 'public/generated/promo/sound'); mkdirSync(cache, {recursive: true});
async function fetchOnce(url, file) {
  if (existsSync(file) && statSync(file).size > 1000) return file;
  const r = await fetch(url); if (!r.ok) throw new Error(`download failed ${r.status}: ${url}`);
  writeFileSync(file, Buffer.from(await r.arrayBuffer())); return file;
}
const silent = resolve(arg('--in', join(root, 'previews/promo', spec.id + '-silent.mp4')));
const out = resolve(arg('--out', join(root, 'previews/promo', spec.id + '.mp4')));
const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', silent]).toString());
const m = snd.music, track = lib.music[m.id]; if (!track) throw new Error('unknown music ' + m.id);
const inputs = ['-i', silent, '-i', await fetchOnce(track.url, join(cache, m.id + '.mp3'))];
const between = r => `between(t,${r[0]},${r[1]})`;
const chains = [];
// Music: stretch, trim, split into dry and muffled paths gated by time, then fade.
const tempo = (m.tempo / track.bpm).toFixed(5);
chains.push(`[1:a]atempo=${tempo},atrim=start=${m.start},asetpts=PTS-STARTPTS,atrim=end=${dur},aformat=sample_rates=48000:channel_layouts=stereo,asplit[md][mm]`);
const off = m.silent ? `+${between(m.silent)}` : '', muf = m.muffled ? between(m.muffled) : '0';
chains.push(`[md]volume='${m.gain}*(1-(${muf})${off ? `-(${between(m.silent)})` : ''})':eval=frame[mdry]`);
chains.push(`[mm]lowpass=f=650,volume='${m.gain}*0.8*(${muf})':eval=frame[mwet]`);
chains.push(`[mdry][mwet]amix=inputs=2:normalize=0,afade=t=out:st=${(dur - (m.fadeOut || 0.8)).toFixed(2)}:d=${m.fadeOut || 0.8}[music]`);
// Effects.
const labels = ['[music]'];
let n = 2;
for (const [name, at, gain = 1, mode] of snd.cues) {
  const fx = lib.sfx[name]; if (!fx) throw new Error('unknown sfx ' + name);
  inputs.push('-i', await fetchOnce(fx.url, join(cache, `sfx-${fx.id}.mp3`)));
  const ms = Math.max(0, Math.round(at * 1000));
  chains.push(`[${n}:a]aformat=sample_rates=48000:channel_layouts=stereo,${mode === 'reverse' ? 'atrim=end=1,areverse,' : ''}volume=${gain},adelay=${ms}|${ms}[s${n}]`);
  labels.push(`[s${n}]`); n++;
}
chains.push(`${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=first,atrim=end=${dur},loudnorm=I=-14:TP=-1.5:LRA=11[aout]`);
execFileSync('ffmpeg', ['-v', 'error', '-y', ...inputs, '-filter_complex', chains.join(';'), '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', out]);
console.log(JSON.stringify({out, cues: snd.cues.length, seconds: dur}));
