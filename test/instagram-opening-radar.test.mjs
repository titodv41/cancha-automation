import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { candidates, signals, validHandle, discoveryFields, mentions, youth } from '../server/instagram-opening-radar.mjs';
const now = new Date('2026-11-18T12:00:00Z'), club = { club: 'River Miami FC', handle: 'rivermiamifc' };
test('tryout and player-call posts are recognised in English and Spanish', () => {
  assert.ok(signals('OPEN TRYOUTS this Saturday 8am').length);
  assert.ok(signals('Pruebas abiertas para la temporada 2027').length);
  assert.ok(signals('We are looking for a goalkeeper').length);
  assert.ok(signals('Buscamos jugadores para primera').length);
  assert.equal(signals('Great win 3-1 tonight, thanks fans').length, 0);
});
test('only recent matching posts become candidates', () => {
  const media = [
    { caption: 'Open tryouts Dec 5', timestamp: '2026-11-10T00:00:00+0000', permalink: 'https://www.instagram.com/p/a/' },
    { caption: 'Tryouts', timestamp: '2026-06-01T00:00:00+0000', permalink: 'https://www.instagram.com/p/old/' },
    { caption: 'Match day', timestamp: '2026-11-15T00:00:00+0000', permalink: 'https://www.instagram.com/p/b/' },
  ];
  const out = candidates(club, media, now);
  assert.deepEqual(out.map(c => c.permalink), ['https://www.instagram.com/p/a/']);
  assert.equal(out[0].club, 'River Miami FC');
});
test('handles are validated and no account metrics are requested', () => {
  assert.ok(validHandle('bocajrs_miami_f.c_'));
  assert.ok(!validHandle('bad handle}{'));
  assert.doesNotMatch(discoveryFields('x'), /followers|media_count|like_count|comments/);
  for (const c of JSON.parse(readFileSync('config/club-instagram-handles.json', 'utf8')).clubs) assert.ok(validHandle(c.handle), c.handle);
});
test('league posts surface club handles and youth tryouts are flagged', () => {
  assert.deepEqual(mentions('Congrats @RiverMiamiFC and @bocajrs_miami_f.c_. on the win! email a@b.com'), ['rivermiamifc', 'bocajrs_miami_f.c_']);
  assert.ok(youth('Academy tryouts for U12-U17, born 2010-2014'));
  assert.ok(!youth('Open tryouts for our first team, 18 and older'));
});
