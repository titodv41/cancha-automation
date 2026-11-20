import test from 'node:test';
import assert from 'node:assert/strict';
import {compactPlan} from '../server/compact-state.mjs';
const now = Date.parse('2026-11-20T12:00:00Z'), d = n => new Date(now - n * 864e5).toISOString();
test('compaction keeps everything the publisher still checks', () => {
  const q = [
    {id: 'a', status: 'Published', published_at: d(10)}, {id: 'b', status: 'Published', published_at: d(60)},
    {id: 'c', status: 'Draft', scheduled_at: null}, {id: 'short-x', status: 'Draft', scheduled_at: null},
    {id: 'e', status: 'Approved', scheduled_at: d(1)}, {id: 'f', status: 'Needs reconciliation', scheduled_at: d(90)},
    {id: 'g', status: 'Failed', scheduled_at: d(3)}, {id: 'h', status: 'Failed', scheduled_at: d(30)},
  ];
  const {keep, archive} = compactPlan(q, {approvedShortReelIds: ['x']}, now);
  assert.deepEqual(archive.map(r => r.id).sort(), ['b', 'c', 'h']);
  assert.deepEqual(keep.map(r => r.id).sort(), ['a', 'e', 'f', 'g', 'short-x']);
});
