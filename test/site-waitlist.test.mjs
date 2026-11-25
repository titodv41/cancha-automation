// The home page waitlist posts to the app's Supabase table with the public publishable key only (RLS: insert-only).
import test from 'node:test'; import assert from 'node:assert/strict'; import {readFileSync, readdirSync} from 'node:fs';
const dir = new URL('../framer/', import.meta.url);
const home = readFileSync(new URL('CanchaHome.tsx', dir), 'utf8');

test('no secret or service-role key ships in any website component', () => {
  for (const f of readdirSync(dir).filter(f => f.endsWith('.tsx'))) {
    const s = readFileSync(new URL(f, dir), 'utf8');
    assert.doesNotMatch(s, /sb_secret_|service_role|SUPABASE_SERVICE/i, f);
  }
});

test('the waitlist sends only the allowed fields, minimal return, with consent', () => {
  assert.match(home, /rest\/v1\/waitlist/);
  assert.match(home, /key:'sb_publishable_[A-Za-z0-9_-]+'/);
  assert.match(home, /Prefer:'return=minimal'/);
  // Owner, Nov 21: "Find me a team" demand test. Only the columns the app grants (0004 + 0008); role is always player.
  assert.match(home, /return\{email,area,role:'player',lang:lang==='es'\?'es':'en',source:.{1,60}\?source:'site',consent:true,intent:'team',position,level\}/);
  assert.match(home, /className="h15-btn main" href="#waitlist">Find me a team/);
  assert.match(home, /disabled=\{state==='sending'\|\|!form\.consent\|\|!form\.adult\}/, 'the 18+ box is required');
  assert.match(home, /id="waitlist"><AppWaitlist\/>/);
  assert.match(home, /href="\/clubs">See all/);
  assert.doesNotMatch(home.slice(home.indexOf('<home15>')), /expo\.app/, 'no Expo link on the site');
  assert.match(home, /href="\/organizations#submission"/, "club claims go to the existing private form");
});

test('the waitlist opens in English; Spanish only from the switch', () => {
  assert.match(home, /useState\('en'\)/);
  assert.doesNotMatch(home, /navigator\.language/);
  assert.doesNotMatch(home, /get\('lang'\)/);
});

test('the homepage "Open right now" list is sourced and hides itself after its date', async () => {
  const block = home.slice(home.indexOf('// <open-now>'), home.indexOf('// </open-now>'));
  const urls = [...block.matchAll(/url:'(https:[^']+)'/g)].map(m => m[1]);
  assert.ok(urls.length >= 1);
  for (const u of urls) assert.match(u, /^https:\/\/(www\.instagram\.com|www\.southfloridaclubsport\.com)\//);
  for (const d of block.matchAll(/until:'([^']+)'/g)) assert.match(d[1], /^\d{4}-\d{2}-\d{2}$/);
  let app = ''; try { app = readFileSync(new URL('../../cancha-app/src/openings.ts', import.meta.url), 'utf8'); } catch {} // only when the app repo sits next to this one
  if (app) for (const u of urls) assert.ok(app.includes(u), 'every website opening is also in the app list: ' + u);
});
