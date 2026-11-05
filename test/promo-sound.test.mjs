// Promo sound: every cue names a listed effect, music is listed, and cues fall inside the video.
import test from 'node:test'; import assert from 'node:assert/strict'; import {readFileSync} from 'node:fs';
const lib = JSON.parse(readFileSync(new URL('../config/sound-library.json', import.meta.url), 'utf8'));
const spec = JSON.parse(readFileSync(new URL('../content/instagram/promos/falta-uno-es-v2-2.json', import.meta.url), 'utf8'));
test('sound library entries are https downloads', () => {
  for (const t of [...Object.values(lib.music), ...Object.values(lib.sfx)]) assert.match(t.url, /^https:\/\/assets\.mixkit\.co\//);
});
test('v2.2 cues use listed sounds inside its 20 seconds', () => {
  assert.ok(lib.music[spec.sound.music.id]);
  for (const [name, at] of spec.sound.cues) { assert.ok(lib.sfx[name], name); assert.ok(at >= 0 && at < 20, `${name} ${at}`); }
  assert.ok(spec.publishBlockedUntil);
});
