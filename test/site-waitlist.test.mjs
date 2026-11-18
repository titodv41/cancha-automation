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
  assert.match(home, /return\{email,area,role,lang:lang==='es'\?'es':'en',source:.{1,60}\?source:'site',consent:true\}/);
  // Owner, Nov 18: minimal homepage; the app ships on the App Store, so the first action is the waitlist.
  assert.match(home, /className="h15-btn main" href="#waitlist">Join the waitlist/);
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
