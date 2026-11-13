import test from 'node:test';
import assert from 'node:assert/strict';
import {activePostNow,canPublishFeed,dailyPostLimit} from '../server/instagram-frequency.mjs';
const two={maxPerDay:2,localTimes:['12:30','18:00']};
const published=at=>({status:'Published',published_at:at,scheduled_at:'2026-10-22T16:30:00Z'});
test('two daily posts require the explicit two-slot plan; actual receipts cap the New York day',()=>{
 const noon=published('2026-10-22T16:38:00Z');
 assert.equal(dailyPostLimit(null),1);assert.equal(dailyPostLimit({maxPerDay:2}),1);assert.equal(dailyPostLimit(two),2);
 assert.equal(canPublishFeed([noon],{},Date.parse('2026-10-22T22:07:00Z')),false);
 assert.equal(canPublishFeed([noon],two,Date.parse('2026-10-22T22:07:00Z')),true);
 assert.equal(canPublishFeed([noon,published('2026-10-22T22:07:00Z')],two,Date.parse('2026-10-23T03:37:00Z')),false);
 assert.equal(canPublishFeed([noon,published('2026-10-22T22:07:00Z')],two,Date.parse('2026-10-23T16:37:00Z')),true);
});
test('no four-hour gap (owner, Nov 13): only a 15-minute guard against overlapping runs',()=>{
 assert.equal(canPublishFeed([published('2026-10-22T22:07:00Z')],two,Date.parse('2026-10-22T22:15:00Z')),false);
 assert.equal(canPublishFeed([published('2026-10-22T22:07:00Z')],two,Date.parse('2026-10-22T22:30:00Z')),true);
});
test('post now: one extra post that day, only inside its window',()=>{
 const policy={postNow:{draftId:'short-x',requestedAt:'2026-11-13T17:50:00Z',until:'2026-11-13T23:50:00Z'}};
 assert.ok(activePostNow(policy,Date.parse('2026-11-13T18:00:00Z')));
 assert.equal(activePostNow(policy,Date.parse('2026-11-14T00:00:00Z')),null);
 assert.equal(activePostNow({postNow:{...policy.postNow,until:'2026-11-15T23:50:00Z'}},Date.parse('2026-11-13T18:00:00Z')),null);
 assert.equal(dailyPostLimit({localTimes:['12:30','18:00'],maxPerDay:2},1),3);
});
