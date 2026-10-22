import test from 'node:test';
import assert from 'node:assert/strict';
import {localStoryDescriptor,localStoryHash,confirmLocalStorySource} from '../server/local-story-source.mjs';
import {requiresSource,confirmPostSource} from '../server/post-source.mjs';
import {approvedOriginalCreative} from '../server/social-creative.mjs';
import {contentHash} from '../server/instagram-queue.mjs';
const source=localStoryDescriptor('rowdies-playoff-20261030');
const row={editorialSourceId:source.id,sourceHash:localStoryHash(source),officialSourceUrl:source.documents[0].url,sourceType:'brand'};
const now=Date.parse('2026-10-22T15:00:00Z');
const page=(url,change='')=>new Response('<html><body>'+source.documents.find(d=>d.url===url).facts.join(' ') +change+'</body></html>',{headers:{'content-type':'text/html'}});
test('dated local editorial rechecks every reviewed document and expires at event kickoff',async()=>{
 const urls=[];assert.equal(requiresSource(row),true);
 assert.equal(await confirmPostSource(row,{now,fetchImpl:async url=>{urls.push(url);return page(url)}}),true);
 assert.deepEqual(urls,source.documents.map(d=>d.url));
 assert.equal(await confirmLocalStorySource(row,{now:Date.parse(source.validUntil),fetchImpl:()=>{throw Error('Must not fetch expired event')}}),false);
 assert.equal(await confirmLocalStorySource({...row,editorialSourceId:'invented'},{now}),false);
 assert.equal(await confirmLocalStorySource({...row,sourceHash:'0'.repeat(64)},{now}),false);
 assert.equal(await confirmLocalStorySource({...row,officialSourceUrl:'https://unreviewed.example/'},{now}),false);
});
test('navigation, missing facts, blocked responses and changed event time cannot confirm a story',async()=>{
 assert.equal(await confirmLocalStorySource(row,{now,fetchImpl:async()=>new Response('<html><body>October 30 Al Lang Stadium <nav>7:30 p.m. ET</nav></body></html>',{headers:{'content-type':'text/html'}})}),false);
 assert.equal(await confirmLocalStorySource(row,{now,fetchImpl:async url=>new Response('<html><body>'+source.documents.find(d=>d.url===url).facts.join(' ').replace('7:30','8:30')+'</body></html>',{headers:{'content-type':'text/html'}})}),false);
 await assert.rejects(confirmLocalStorySource(row,{now,fetchImpl:async()=>new Response('blocked',{status:403})}),/unavailable/);
});
test('local creative binds the source, review hash and image bytes into approval',()=>{
 const checksum='a'.repeat(64),creative={...row,creativeVersion:'cancha-local-v2',assetChecksum:checksum,rights:'Original Cancha editorial layout; identifying badge',caption:'Dated club report',altText:'Dated event card',visualEvidence:{kind:'local-story',creator:'Cancha',subjectKey:'test-event',sourceUrl:row.officialSourceUrl,sourceHash:row.sourceHash,assetChecksum:checksum,renderedAt:new Date().toISOString()}};
 assert.equal(approvedOriginalCreative(creative),true);
 for(const changed of [{...creative,sourceHash:'b'.repeat(64)},{...creative,editorialSourceId:'unknown'},{...creative,assetChecksum:'c'.repeat(64)}])assert.equal(approvedOriginalCreative(changed),false);
 assert.notEqual(contentHash(creative),contentHash({...creative,editorialSourceId:'changed'}));
});
