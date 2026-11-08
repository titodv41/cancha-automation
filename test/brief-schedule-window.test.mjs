// Nov 7: two 6 PM slots went empty because researched briefs (sourceType 'news') fell under the 36-hour rule meant for
// syndicated news. A brief keeps its 7-day fact window, and its sources are confirmed live before approval.
import test from 'node:test'; import assert from 'node:assert/strict'; import {readFile} from 'node:fs/promises';
test('a real brief checked three days earlier is scheduled; its live source check still runs', async t => {
  const at = Date.parse('2026-11-07T21:40:00Z'); t.mock.timers.enable({apis: ['Date'], now: at});
  const {mkdtemp, rm} = await import('node:fs/promises'), {join} = await import('node:path'), {tmpdir} = await import('node:os');
  const {openQueue, saveDraft} = await import('../server/instagram-queue.mjs'), {savePlan, prepareStandingPlan} = await import('../server/instagram-plan.mjs');
  const {buildBriefDraft} = await import('../scripts/prepare-brief-carousels.mjs'), {briefSlides} = await import('../scripts/render-brief-carousels.mjs');
  const policy = JSON.parse(await readFile(new URL('../config/instagram-editorial-policy.json', import.meta.url), 'utf8'));
  const {briefs} = JSON.parse(await readFile(new URL('../content/instagram/brief-carousels.json', import.meta.url), 'utf8'));
  const r = {...briefs.find(b => b.id === 'ftl-utd-broward-college-fields'), checkedOn: '2026-11-04'};
  const brief = buildBriefDraft(r, briefSlides(r).map((s, i) => ({assetUrl: `https://framerusercontent.com/images/brief${i}.jpg`, assetChecksum: 'a'.repeat(64), altText: s.alt, width: 1080, height: 1350})), {renderedAt: '2026-11-07T05:30:00.000Z'});
  assert.equal(brief.sourceType, 'news', 'briefs are built as news');
  for (const live of [true, false]) {
    const dir = await mkdtemp(join(tmpdir(), 'cancha-brief-window-')), db = openQueue(join(dir, 'queue.sqlite'));
    try {
      saveDraft(db, brief);
      savePlan(db, {enabled: true, weekdays: [6], localTime: '18:00', localTimes: ['18:00'], startDate: '2026-11-01', sourceTypes: ['brand', 'news'], formats: ['feed']}, 'test');
      const checked = [];
      const result = await prepareStandingPlan(db, {now: at, connected: true, editorialPolicy: {...policy, approvedBriefCarouselIds: [r.id]}, verifySource: async c => { checked.push(c.id); return live; }});
      assert.deepEqual(checked, [brief.id], 'sources are confirmed live before approval');
      assert.deepEqual(result.scheduled.map(x => x.id), live ? [brief.id] : []);
    } finally { db.close(); await rm(dir, {recursive: true, force: true}); }
  }
});
