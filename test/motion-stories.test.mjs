import test from 'node:test';import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';import{createHash}from'node:crypto';
import{localStoryDescriptor,localStoryHash,confirmLocalStorySource}from'../server/local-story-source.mjs';
import{validReel,verifyReelAssets}from'../server/instagram-media.mjs';
import{metaPublisher,contentHash}from'../server/instagram-queue.mjs';
import{satisfiesDailyMediaMix}from'../server/instagram-media-mix.mjs';
import{approvedOriginalCreative}from'../server/social-creative.mjs';
const source=localStoryDescriptor('weston-u15-club-clip-20261022'),doc=source.documents[0];
const row={editorialSourceId:source.id,sourceHash:localStoryHash(source),officialSourceUrl:doc.url};
const jpeg=Buffer.from([255,216,255,217]),mp4=Buffer.from('0000ftypisomfixture'),sha=b=>createHash('sha256').update(b).digest('hex');
const reel={...row,id:'test-reel',format:'feed',sourceType:'brand',assetUrl:'https://framerusercontent.com/images/cover.jpg',assetChecksum:sha(jpeg),caption:'A club-reported result',altText:'Actual club footage',reel:{assetUrl:'https://framerusercontent.com/assets/clip.mp4',assetChecksum:sha(mp4),width:1080,height:1920,durationSeconds:22,codec:'h264',audioCodec:'aac'}};
const post={link:doc.permalink,timestamp:doc.publishedAt,description:doc.facts.join(' '),children:[{type:'video',src:'https://cdn.example.test/clip.mp4'}]};
const html=p=>new Response(`<html><body><script type="application/json" id="wix-warmup-data">${JSON.stringify({feed:[p]})}</script></body></html>`,{headers:{'content-type':'text/html'}});
test('embedded club reporting is bound to the exact official feed, post, timestamp and facts',async()=>{
 const now=Date.parse('2026-10-22T18:00:00Z');assert.equal(await confirmLocalStorySource(row,{now,fetchImpl:async()=>html(post)}),true);
 for(const p of[{...post,link:'https://www.instagram.com/p/other/'},{...post,timestamp:'2026-01-01T00:00:00Z'},{...post,description:'Different result'},{...post,children:[{type:'image'}]}])assert.equal(await confirmLocalStorySource(row,{now,fetchImpl:async()=>html(p)}),false);
 assert.equal(await confirmLocalStorySource(row,{now,fetchImpl:async()=>new Response('<html><body>'+doc.facts.join(' ')+'</body></html>',{headers:{'content-type':'text/html'}})}),false);
});
test('Reels bind video, audio and footage evidence into approval and reject invalid formats',()=>{
 assert(validReel(reel));for(const changed of[{...reel,format:'story'},{...reel,slides:[]},{...reel,reel:{...reel.reel,assetUrl:'https://other.test/clip.mp4'}},{...reel,reel:{...reel.reel,audioCodec:'mp3'}},{...reel,reel:{...reel.reel,durationSeconds:200}}])assert.equal(validReel(changed),false);
 assert.notEqual(contentHash(reel),contentHash({...reel,reel:{...reel.reel,assetChecksum:'a'.repeat(64)}}));assert.notEqual(contentHash(reel),contentHash({...reel,audioEvidence:{syntheticNarration:true}}));
 const creative={...reel,creativeVersion:'cancha-local-v2',rights:'Owner cleared club footage; original design/music and Apache narrator',footage:[{authorization:'owner-cleared-2026-10-22',publisher:'Weston FC',subject:'U15',sourcePage:doc.url,permalink:doc.permalink,originalChecksum:'a'.repeat(64)}],audioEvidence:{originalMusic:true,originalSoundEffects:true},visualEvidence:{creator:'Cancha',kind:'motion-story',subjectKey:source.id,sourceUrl:doc.url,sourceHash:row.sourceHash,assetChecksum:reel.assetChecksum,videoChecksum:reel.reel.assetChecksum,renderedAt:new Date().toISOString()}};assert(approvedOriginalCreative(creative));assert.equal(approvedOriginalCreative({...creative,footage:[]}),false);
});
test('Reel creates one processing container after immutable public bytes checks and never a carousel child',async()=>{
 const calls=[],p=metaPublisher({token:'fixture',accountId:'123',version:'v26.0',fetchImpl:async(u,o)=>{calls.push([String(u),o]);if(String(u).includes('framerusercontent.com')){assert.equal(o.headers,undefined);return new Response(String(u).endsWith('.jpg')?jpeg:mp4,{headers:{'content-type':String(u).endsWith('.jpg')?'image/jpeg':'video/mp4'}})}return Response.json({id:'reel-container'})}});
 assert.equal(await p.create(reel),'reel-container');assert.equal(calls.length,3);const params=calls.at(-1)[1].body;assert.equal(params.get('media_type'),'REELS');assert.equal(params.get('video_url'),reel.reel.assetUrl);assert.equal(params.get('share_to_feed'),'true');assert.equal(params.has('is_carousel_item'),false);assert.equal(params.has('alt_text'),false);assert.equal(calls.some(c=>c[0].includes('media_publish')),false);
 let meta=0;const bad=metaPublisher({token:'fixture',accountId:'123',version:'v26.0',fetchImpl:async(u)=>{if(String(u).includes('graph.facebook.com'))meta++;return new Response('changed',{headers:{'content-type':'image/jpeg'}})}});await assert.rejects(bad.create(reel),/bytes changed/);assert.equal(meta,0);
});
test('daily Reel publication waits for a real same-day carousel receipt, not its approval or yesterday',()=>{
 const policy={minimumDailyCarousels:1},now=Date.parse('2026-10-23T22:00:00Z'),c={status:'Published',published_at:'2026-10-23T16:37:00Z',content:JSON.stringify({slides:[{},{}]})};
 assert.equal(satisfiesDailyMediaMix(reel,[],policy,{now}),false);assert.equal(satisfiesDailyMediaMix(reel,[{...c,status:'Approved'}],policy,{now}),false);assert.equal(satisfiesDailyMediaMix(reel,[{...c,published_at:'2026-10-22T22:00:00Z'}],policy,{now}),false);assert.equal(satisfiesDailyMediaMix(reel,[c],policy,{now}),true);assert.equal(satisfiesDailyMediaMix({slides:[{},{}]},[],policy,{now}),true);
});
