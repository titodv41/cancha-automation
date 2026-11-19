import test from 'node:test';
import assert from 'node:assert/strict';
import {reconcile, apply} from '../server/reconcile-uncertain.mjs';
const row = (id, status, caption, at) => ({id, status, content: JSON.stringify({caption}), scheduled_at: at, published_id: null});
const now = Date.parse('2026-11-19T00:30:00Z');
test('an uncertain post found on Instagram becomes Published with its receipt', () => {
  const q = [row('a', 'Publishing', 'Need a team? Find clubs', '2026-11-18T23:20:00Z'), {id: 'b', status: 'Published', published_id: 'm0', content: '{}'}];
  const r = reconcile(q, [{id: 'm0', caption: 'old'}, {id: 'm1', caption: 'Need a team?  Find clubs', timestamp: '2026-11-18T23:21:00Z', permalink: 'https://www.instagram.com/reel/x/'}], now);
  assert.deepEqual(r.map(x => [x.id, x.outcome, x.mediaId]), [['a', 'found', 'm1']]);
  apply(q, r); assert.equal(q[0].status, 'Published'); assert.equal(q[0].published_id, 'm1');
});
test('not found becomes Failed and is never retried; a fresh attempt waits', () => {
  const q = [row('a', 'Needs reconciliation', 'Falta uno', '2026-11-18T23:20:00Z'), row('b', 'Publishing', 'Other', '2026-11-19T00:20:00Z')];
  const r = reconcile(q, [{id: 'm9', caption: 'Something else', timestamp: '2026-11-18T23:30:00Z'}], now);
  assert.deepEqual(r.map(x => x.outcome), ['not-found', 'wait']);
  apply(q, r); assert.equal(q[0].status, 'Failed'); assert.equal(q[1].status, 'Publishing');
});
test('an already-receipted media id is never claimed twice', () => {
  const q = [row('a', 'Publishing', 'Same caption', '2026-11-18T23:20:00Z'), {id: 'b', status: 'Published', published_id: 'm1', content: '{}'}];
  assert.equal(reconcile(q, [{id: 'm1', caption: 'Same caption', timestamp: '2026-11-18T23:21:00Z'}], now)[0].outcome, 'not-found');
});
