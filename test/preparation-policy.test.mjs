import test from 'node:test';import assert from 'node:assert/strict';
import {preparationNeeded} from '../server/preparation-policy.mjs';
import {scheduledAction} from '../scripts/github-schedule.mjs';
test('noon fallback covers DST offsets even when GitHub starts it late',()=>{
 assert.equal(scheduledAction({event:'schedule',cron:'17 16 * * *',now:new Date('2026-10-24T20:00:00Z')}),'prepare');
 assert.equal(scheduledAction({event:'schedule',cron:'17 17 * * *',now:new Date('2026-12-24T22:00:00Z')}),'prepare');
 assert.equal(scheduledAction({event:'schedule',cron:'17 17 * * *',now:new Date('2026-10-24T20:00:00Z')}),'');
});
test('only complete same-day preparation skips automatic work; manual runs and recovery still work',()=>{
 const base={event:'schedule',today:'2026-10-23'};
 assert.equal(preparationNeeded(base),true);
 assert.equal(preparationNeeded({...base,lastPreparation:{completedOn:'2026-10-22'}}),true);
 assert.equal(preparationNeeded({...base,lastPreparation:{completedOn:'2026-10-23'}}),false);
 assert.equal(preparationNeeded({...base,event:'workflow_dispatch',lastPreparation:{completedOn:'2026-10-23'}}),true);
});
