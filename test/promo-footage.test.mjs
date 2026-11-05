// Promo footage must be licensed and listed; promo specs that use footage must say so and stay blocked until approved.
import test from 'node:test'; import assert from 'node:assert/strict'; import {readFileSync, readdirSync} from 'node:fs';
const cfg = JSON.parse(readFileSync(new URL('../config/footage-licenses.json', import.meta.url), 'utf8'));
const src = readFileSync(new URL('../video/src/PromoFaltaUnoV3.tsx', import.meta.url), 'utf8');

test('every footage clip has a known license, an https source and a sane cut', () => {
  const names = new Set();
  for (const c of cfg.clips) {
    assert.ok(cfg.licenses[c.license], c.name); assert.match(c.source, /^https:\/\//); assert.ok(!names.has(c.name)); names.add(c.name);
    assert.ok(c.cut.duration > 0 && c.cut.x >= 0 && c.cut.x <= 1, c.name); assert.ok(c.shows, c.name);
  }
});

test('promo compositions only use listed clips', () => {
  const used = [...src.matchAll(/Footage name="([a-z]+)"/g)].map(m => m[1]);
  const listed = new Set(cfg.clips.map(c => c.name));
  assert.ok(used.length > 0);
  for (const u of used) assert.ok(listed.has(u), `${u} is not in config/footage-licenses.json`);
});

test('footage promo specs point at the license list and stay blocked until approved', () => {
  const dir = new URL('../content/instagram/promos/', import.meta.url);
  for (const f of readdirSync(dir).filter(f => f.includes('-v3-'))) {
    const d = JSON.parse(readFileSync(new URL(f, dir), 'utf8'));
    assert.equal(d.footage, 'config/footage-licenses.json', f); assert.ok(d.publishBlockedUntil, f);
    assert.doesNotMatch(d.approval, /no third-party/i, f);
  }
});
