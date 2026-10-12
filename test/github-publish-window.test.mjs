import test from 'node:test';import assert from 'node:assert/strict';import {expiredPublishingDay} from '../server/github-publish-window.mjs';
test('a delayed approved post is eligible until midnight New York, then expires',()=>{
 const at='2026-10-11T22:00:00Z';assert.equal(expiredPublishingDay(at,new Date('2026-10-12T01:10:32Z')),false);assert.equal(expiredPublishingDay(at,new Date('2026-10-12T03:59:59Z')),false);assert.equal(expiredPublishingDay(at,new Date('2026-10-12T04:00:00Z')),true);assert.equal(expiredPublishingDay('2026-10-12T22:00:00Z',new Date('2026-10-12T21:00:00Z')),false);
 assert.equal(expiredPublishingDay('2026-12-11T23:00:00Z',new Date('2026-12-12T04:59:59Z')),false);assert.equal(expiredPublishingDay('2026-12-11T23:00:00Z',new Date('2026-12-12T05:00:00Z')),true);
});
