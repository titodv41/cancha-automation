import test from 'node:test';import assert from 'node:assert/strict';import {scheduledAction} from '../scripts/github-schedule.mjs';
test('delayed scheduled jobs select their intended action instead of silently skipping outside the expected hour',()=>{
 assert.equal(scheduledAction({event:'schedule',cron:'7 14 * * *',now:new Date('2026-10-10T18:25:39Z')}),'prepare');
 assert.equal(scheduledAction({event:'schedule',cron:'7 22 * * *',now:new Date('2026-10-11T00:49:22Z')}),'publish');
 assert.equal(scheduledAction({event:'schedule',cron:'7 15 * * *',now:new Date('2026-10-10T18:25:39Z')}),'');
 assert.equal(scheduledAction({event:'schedule',cron:'7 15 * * *',now:new Date('2026-12-10T19:25:39Z')}),'prepare');
 assert.equal(scheduledAction({event:'schedule',cron:'7 23 * * *',now:new Date('2026-12-11T01:49:22Z')}),'publish');
 assert.equal(scheduledAction({event:'workflow_dispatch',requested:'review'}),'review');
});
test('evening catch-up selects publishing in summer and winter, never the next morning',()=>{
 for(const at of ['2026-10-12T23:37:00Z','2026-10-13T02:37:00Z','2026-12-13T04:37:00Z'])assert.equal(scheduledAction({event:'schedule',cron:'37 0-4,22-23 * * *',now:new Date(at)}),'publish');
 for(const at of ['2026-10-13T04:37:00Z','2026-12-12T22:37:00Z'])assert.equal(scheduledAction({event:'schedule',cron:'37 0-4,22-23 * * *',now:new Date(at)}),'');
});
test('two-post catch-up works after midday in either offset and stays off the next morning',()=>{
 for(const at of ['2026-10-22T16:37:00Z','2026-12-22T17:37:00Z','2026-10-23T03:37:00Z'])assert.equal(scheduledAction({event:'schedule',cron:'37 0-4,16-23 * * *',now:new Date(at)}),'publish');
 for(const at of ['2026-10-23T04:37:00Z','2026-12-22T16:37:00Z'])assert.equal(scheduledAction({event:'schedule',cron:'37 0-4,16-23 * * *',now:new Date(at)}),'');
});
test('social preparation runs independently before both daily slots and follows New York daylight saving time',()=>{
 assert.equal(scheduledAction({event:'schedule',cron:'20 13,17 * * *',now:new Date('2026-10-24T13:20:00Z')}),'replenish');
 assert.equal(scheduledAction({event:'schedule',cron:'20 14,18 * * *',now:new Date('2026-10-24T14:20:00Z')}),'');
 assert.equal(scheduledAction({event:'schedule',cron:'20 14,18 * * *',now:new Date('2026-12-24T18:20:00Z')}),'replenish');
});
