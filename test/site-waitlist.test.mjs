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
  assert.match(home, /`\}\/>\s*<AppWaitlist\/>/, "the app waitlist leads the homepage (owner, Nov 4)");
  assert.match(home, /<AppWaitlist\/><ClubBadgeRail profiles=\{profiles\}\/><ForClubs count=\{profiles\.length\}\/><section className="ch3-hero ch7-hero">/, "club crests sit right under the waitlist, then Cancha for Clubs (owner, Nov 4 and Nov 13)");
  assert.match(home, /href="\/organizations#submission"/, "club claims go to the existing private form");
  assert.equal(home.split('<ClubBadgeRail ').length, 2, "the crest rail appears once");
});

test('the waitlist opens in English; Spanish only from the switch', () => {
  assert.match(home, /useState\('en'\)/);
  assert.doesNotMatch(home, /navigator\.language/);
  assert.doesNotMatch(home, /get\('lang'\)/);
});
