// Approved posts stay postable: briefs re-render only inside their fact window, cuts rotate one per day (Nov 7).
import test from 'node:test'; import assert from 'node:assert/strict'; import {readFileSync} from 'node:fs';
import {freshBriefIds, briefsNeedingRecheck, rotatingCut} from '../scripts/keep-fresh.mjs';
const now = Date.parse('2026-11-07T05:20:00Z');
const briefs = [{id: 'a', checkedOn: '2026-11-05'}, {id: 'b', checkedOn: '2026-10-31'}, {id: 'c', checkedOn: '2026-11-06', expiresOn: '2026-11-05'}, {id: 'd', checkedOn: '2026-11-06'}, {id: 'e', checkedOn: '2026-11-02'}];
test('only approved, unexpired briefs with at least a day left in their fact window re-render', () => {
  assert.deepEqual(freshBriefIds(briefs, ['a', 'b', 'c', 'e'], now), ['a', 'e']);
  assert.deepEqual(briefsNeedingRecheck(briefs, ['a', 'b', 'c', 'e'], now), ['b']);
  assert.deepEqual(freshBriefIds(briefs, [], now), []);
});
test('one approved creator cut per day, in rotation, covering every cut within 7 days', () => {
  const files = ['x.json', 'y.json', 'z.json', 'notes.md'], approved = ['creator-cut-x', 'creator-cut-y', 'creator-cut-z'];
  const week = Array.from({length: 7}, (_, i) => rotatingCut(files, approved, now + i * 86400000));
  assert.deepEqual(new Set(week), new Set(['x', 'y', 'z']));
  assert.equal(rotatingCut(files, [], now), '');
  const real = readFileSync(new URL('../config/instagram-editorial-policy.json', import.meta.url), 'utf8');
  assert.ok(JSON.parse(real).approvedShortReelIds.filter(id => id.startsWith('creator-cut-')).length <= 7, 'rotation covers every cut inside the 7-day window');
});
test('scheduled refreshes run in quiet hours, outside the posting runs that share the concurrency group', () => {
  for (const [f, cron] of [['brief-carousels', '20 5 * * *'], ['creator-cuts', '20 6 * * *']]) {
    const y = readFileSync(new URL(`../.github/workflows/${f}.yml`, import.meta.url), 'utf8');
    assert.ok(y.includes(`cron: '${cron}'`), f);
  }
  const ig = readFileSync(new URL('../.github/workflows/github-instagram.yml', import.meta.url), 'utf8');
  assert.doesNotMatch(ig, /cron: '[^']*\b(5|6)\b[^']*\* \* \*'/, 'no Instagram run is scheduled at 05:xx or 06:xx UTC');
});
