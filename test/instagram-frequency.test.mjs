import test from 'node:test';
import assert from 'node:assert/strict';
import {canPublishFeed,dailyPostLimit} from '../server/instagram-frequency.mjs';
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
test('delayed publication waits four actual hours even across midnight and DST',()=>{
 assert.equal(canPublishFeed([published('2026-10-22T22:07:00Z')],two,Date.parse('2026-10-23T01:37:00Z')),false);
 assert.equal(canPublishFeed([published('2026-10-22T22:07:00Z')],two,Date.parse('2026-10-23T02:07:00Z')),true);
 assert.equal(canPublishFeed([published('2026-11-01T05:40:00Z')],two,Date.parse('2026-11-01T08:40:00Z')),false);
 assert.equal(canPublishFeed([published('2026-11-01T05:40:00Z')],two,Date.parse('2026-11-01T09:40:00Z')),true);
});
