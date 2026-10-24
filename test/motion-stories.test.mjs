import test from 'node:test';import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';import{createHash}from'node:crypto';
import{localStoryDescriptor,localStoryHash,confirmLocalStorySource}from'../server/local-story-source.mjs';
import{validReel,verifyReelAssets}from'../server/instagram-media.mjs';
import{metaPublisher,contentHash,openQueue,saveDraft,approve}from'../server/instagram-queue.mjs';
import{refreshMotionEditorial}from'../server/motion-editorial-refresh.mjs';
import{mkdtempSync,rmSync,readFileSync}from'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';
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
test('an owner video hold overrides a published carousel and also applies without a daily minimum',()=>{
 const receipt={status:'Published',published_at:new Date().toISOString(),content:JSON.stringify({slides:[{},{}]})};
 assert.equal(satisfiesDailyMediaMix(reel,[receipt],{allowMotionStories:false,minimumDailyCarousels:1}),false);
 assert.equal(satisfiesDailyMediaMix(reel,[receipt],{allowMotionStories:false}),false);
 assert.equal(satisfiesDailyMediaMix(reel,[receipt],{retiredDraftIds:[reel.id]}),false);
 assert.equal(satisfiesDailyMediaMix({slides:[{},{}]},[receipt],{allowMotionStories:false}),true);
});
test('a stadium explainer requires its exact source, subject media, matching video and planned context',()=>{
 const source=localStoryDescriptor('miami-homestead-background-20261022'),url=source.documents[0].url,sourceHash=localStoryHash(source);
 const item={...reel,caption:'Miami FC’s planned Homestead stadium. Announced in September 2025.',altText:'Official architectural rendering of the planned venue.',editorialSourceId:source.id,officialSourceUrl:url,sourceHash,creativeVersion:'cancha-local-v2',rights:'Owner cleared subject media; original diagrams/audio.',photos:[{authorization:'owner-cleared-2026-10-22',publisher:'Miami FC',subject:'Proposed stadium rendering',sourcePage:url,originalUrl:'https://www.miamifc.com/wp-content/uploads/stadium.png',originalChecksum:'a'.repeat(64)}],audioEvidence:{originalMusic:true,originalSoundEffects:true,narrationLicense:'Apache-2.0',syntheticNarration:true},visualEvidence:{creator:'Cancha',kind:'animated-explainer',subjectKey:source.id,sourceUrl:url,sourceHash,assetChecksum:reel.assetChecksum,videoChecksum:reel.reel.assetChecksum,renderedAt:new Date().toISOString(),context:'planned-development'}};
 assert(approvedOriginalCreative(item));
 for(const changed of[{...item,photos:[]},{...item,photos:[{...item.photos[0],sourcePage:'https://other.test/'}]},{...item,visualEvidence:{...item.visualEvidence,context:'open-now'}},{...item,visualEvidence:{...item.visualEvidence,videoChecksum:'b'.repeat(64)}}])assert.equal(approvedOriginalCreative(changed),false);
});
test('motion revisions keep untouched standing-plan slots and preserve manual or dispatched work',()=>{
 const dir=mkdtempSync(join(tmpdir(),'motion-refresh-')),db=openQueue(join(dir,'queue.sqlite')),now=Date.now(),scheduledAt=new Date(now+86400000).toISOString();
 const item={...reel,factsCheckedAt:new Date(now).toISOString(),creativeVersion:'cancha-local-v2',rights:'Owner cleared footage; original sound and design.',footage:[{authorization:'owner-cleared-2026-10-22',publisher:'Weston FC',subject:'U15',sourcePage:doc.url,permalink:doc.permalink,originalChecksum:'a'.repeat(64)}],audioEvidence:{originalMusic:true,originalSoundEffects:true},visualEvidence:{creator:'Cancha',kind:'motion-story',subjectKey:source.id,sourceUrl:doc.url,sourceHash:row.sourceHash,assetChecksum:reel.assetChecksum,videoChecksum:reel.reel.assetChecksum,renderedAt:new Date(now).toISOString()}};
 try{saveDraft(db,item);approve(db,item.id,{reviewer:'Cancha owner-authorized standing plan',scheduledAt,now,allowSourceRecheck:true});const revised={...item,caption:'A revised source-checked caption'};const result=refreshMotionEditorial(db,[revised],{now});assert.equal(result.rescheduled.length,1);let stored=db.prepare('SELECT * FROM instagram_queue').get();assert.equal(stored.scheduled_at,scheduledAt);assert.equal(stored.approved_hash,contentHash(revised));
 for(const status of['Preparing','Publishing','Published','Needs reconciliation']){db.prepare('UPDATE instagram_queue SET status=?').run(status);assert.deepEqual(refreshMotionEditorial(db,[{...revised,caption:'Later revision'}],{now}).protected,[item.id]);assert.equal(db.prepare('SELECT content FROM instagram_queue').get().content,JSON.stringify(revised))}
 db.prepare("UPDATE instagram_queue SET status='Approved',approved_by='Manual owner review'").run();assert.deepEqual(refreshMotionEditorial(db,[item],{now}).protected,[item.id]);
 }finally{db.close();rmSync(dir,{recursive:true,force:true})}
});

test('a shortened accepted narrative keeps its future standing-plan slot but never replaces a dispatched container',()=>{
 const dir=mkdtempSync(join(tmpdir(),'narrative-refresh-')),db=openQueue(join(dir,'queue.sqlite')),now=Date.now(),scheduledAt=new Date(now+86400000).toISOString();
 const fixture=JSON.parse(readFileSync(new URL('../content/instagram/narrative-editorial-ready.json',import.meta.url)))[0],item={...fixture,factsCheckedAt:new Date(now).toISOString(),visualEvidence:{...fixture.visualEvidence,renderedAt:new Date(now).toISOString()}},revised={...item,caption:'A factual ending without the generic closing question.'};
 try{assert(approvedOriginalCreative(item));saveDraft(db,item);approve(db,item.id,{reviewer:'Cancha owner-authorized standing plan',scheduledAt,now,allowSourceRecheck:true});assert.equal(refreshMotionEditorial(db,[revised],{now}).rescheduled.length,1);const stored=db.prepare('SELECT * FROM instagram_queue WHERE id=?').get(item.id);assert.equal(stored.scheduled_at,scheduledAt);assert.equal(stored.approved_hash,contentHash(revised));db.prepare('UPDATE instagram_queue SET container_id=? WHERE id=?').run('already-dispatched-container',item.id);assert.deepEqual(refreshMotionEditorial(db,[item],{now}).protected,[item.id]);}finally{db.close();rmSync(dir,{recursive:true,force:true})}
});
