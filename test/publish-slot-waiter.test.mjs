import test from 'node:test';import assert from 'node:assert/strict';import {nextSlot,dispatchPlan} from '../scripts/publish-slot-waiter.mjs';
test('finds the upcoming New York slot in daylight and standard time',()=>{
 assert.equal(nextSlot(new Date('2026-10-26T20:00:00Z')).slot,'2026-10-26T22:00:00.000Z');
 assert.equal(nextSlot(new Date('2026-10-26T15:00:00Z')).slot,'2026-10-26T16:30:00.000Z');
 assert.equal(nextSlot(new Date('2026-12-10T21:00:00Z')).slot,'2026-12-10T23:00:00.000Z');
 assert.equal(nextSlot(new Date('2026-12-10T16:00:00Z')).slot,'2026-12-10T17:30:00.000Z');
});
test('a late runner still recovers a slot inside the publisher grace window, never the next morning',()=>{
 assert.equal(nextSlot(new Date('2026-10-26T23:00:00Z')).slot,'2026-10-26T22:00:00.000Z');
 assert.equal(nextSlot(new Date('2026-10-26T23:30:00Z')),null);
 assert.equal(nextSlot(new Date('2026-10-26T05:00:00Z')),null);
});
test('dispatches before and just after the slot, skipping a pre-slot dispatch that already passed',()=>{
 assert.deepEqual(dispatchPlan('2026-10-26T22:00:00.000Z',new Date('2026-10-26T20:00:00Z')),['2026-10-26T21:40:00.000Z','2026-10-26T22:02:00.000Z']);
 assert.deepEqual(dispatchPlan('2026-10-26T22:00:00.000Z',new Date('2026-10-26T21:55:00Z')),['2026-10-26T22:02:00.000Z']);
 assert.deepEqual(dispatchPlan('2026-10-26T22:00:00.000Z',new Date('2026-10-26T22:30:00Z')),['2026-10-26T22:30:00.000Z']);
});
