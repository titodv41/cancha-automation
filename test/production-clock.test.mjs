import test from 'node:test';import assert from 'node:assert/strict';import {upcoming,plan} from '../scripts/production-clock.mjs';
test('orders the day in New York time across daylight and standard time',()=>{
 const day=upcoming(new Date('2026-10-26T12:00:00Z')).slice(0,11).map(e=>e.action+'@'+e.at.slice(11,16));
 assert.deepEqual(day,['replenish@13:23','prepare@14:09','publish@16:10','prepare@16:19','publish@16:32','publish@16:50','replenish@17:23','publish@21:40','publish@22:02','publish@22:20','publish@22:50']);
 assert.equal(upcoming(new Date('2026-12-10T12:00:00Z'))[0].at,'2026-12-10T14:23:00.000Z');
});
test('a late start still fires an event that just fell due, but not older ones',()=>{
 assert.equal(upcoming(new Date('2026-10-26T22:05:00Z'))[0].at,'2026-10-26T22:02:00.000Z');
 assert.equal(upcoming(new Date('2026-10-26T22:30:00Z'))[0].at,'2026-10-26T22:50:00.000Z');
 assert.equal(upcoming(new Date('2026-10-26T23:00:00Z'))[0].action,'replenish');
});
test('each link handles only events inside its time budget',()=>{
 assert.deepEqual(plan(new Date('2026-10-26T17:30:00Z')).map(e=>e.at.slice(11,16)),['21:40','22:02','22:20','22:50']);
 assert.deepEqual(plan(new Date('2026-10-26T23:00:00Z')),[]);
});
test('the next link never re-fires the event its predecessor just handled',()=>{
 assert.equal(upcoming(new Date('2026-10-26T22:02:30Z'),{after:'2026-10-26T22:02:00.000Z'})[0].at,'2026-10-26T22:20:00.000Z');
 assert.deepEqual(plan(new Date('2026-10-26T16:15:00Z'),320,'2026-10-26T16:10:00.000Z').map(e=>e.at.slice(11,16)),['16:19','16:32','16:50','17:23']);
});
