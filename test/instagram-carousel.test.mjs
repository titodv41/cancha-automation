import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {contentHash,openQueue,saveDraft,approve,dispatchDue,metaPublisher} from '../server/instagram-queue.mjs';
import {validCarousel,verifyCarouselAssets} from '../server/instagram-media.mjs';
import {approvedOriginalCreative,recentlyUsedPhoto} from '../server/social-creative.mjs';
import {localStoryDescriptor,localStoryHash} from '../server/local-story-source.mjs';
import {refreshPhotoEditorial} from '../server/photo-editorial-refresh.mjs';
import {validPostImage,savePlan,prepareStandingPlan} from '../server/instagram-plan.mjs';
const bytes=Buffer.from([255,216,255,217]),checksum=createHash('sha256').update(bytes).digest('hex');
const source=localStoryDescriptor('rowdies-shield-20261018');
const row=()=>{const slides=[1,2,3].map(n=>({assetUrl:`https://framerusercontent.com/images/slide-${n}.jpg`,assetChecksum:checksum,altText:`Real club photo, slide ${n}`,width:1080,height:1350,photoId:'result'}));return {id:'carousel',format:'feed',caption:'A real local result.',altText:'Club result',assetUrl:slides[0].assetUrl,assetChecksum:checksum,slides,sourceType:'news',factsCheckedAt:new Date().toISOString(),editorialSourceId:source.id,officialSourceUrl:source.documents[0].url,sourceHash:localStoryHash(source),creativeVersion:'cancha-local-v2',rights:'Owner-cleared photo and original layout',photos:[{id:'result',authorization:'owner-cleared-2026-10-22',publisher:'Tampa Bay Rowdies',subject:'Club match recap',sourcePage:source.documents[0].url,originalUrl:'https://www.rowdiessoccer.com/wp-content/uploads/result.jpg',originalChecksum:'a'.repeat(64)}],visualEvidence:{creator:'Cancha',kind:'photo-carousel',subjectKey:source.id,sourceUrl:source.documents[0].url,sourceHash:localStoryHash(source),renderedAt:new Date().toISOString(),assetChecksum:checksum}};};
const queue=()=>{const dir=mkdtempSync(join(tmpdir(),'cancha-carousel-'));return {db:openQueue(join(dir,'queue.sqlite')),close(){this.db.close();rmSync(dir,{recursive:true})}}};
test('carousel approval binds slide order and photos while preserving existing single-image hashes',t=>{
 const clock=t.mock.method(Date,'now',()=>Date.parse('2026-10-22T23:00:00Z'));
 const legacy=JSON.parse(readFileSync('content/instagram/local-stories-ready.json')).find(p=>p.id==='local-rowdies-shield-20261022');
 assert.equal(contentHash(legacy),'5f43afcac9808c8694c19e26d2fb735c3f90c8031ea7326812f5ba0c154e9be8');
 const storyboard=JSON.parse(readFileSync('test/fixtures/legacy-puerta-carousel.json'));assert(storyboard.video.beats.length);assert.equal(contentHash(storyboard),'021d58d86c5857635728642e3d2ba0905bbbc7583a3ce226d169dc2980a68aa3');assert(validPostImage(storyboard));assert(approvedOriginalCreative(storyboard));
 clock.mock.restore();
 const r=row();assert(approvedOriginalCreative(r));assert(validPostImage(r));
 assert.notEqual(contentHash(r),contentHash({...r,slides:[r.slides[0],r.slides[2],r.slides[1]]}));
 assert.notEqual(contentHash(r),contentHash({...r,photos:[{...r.photos[0],subject:'Other subject'}]}));
 for(const change of [{...r,format:'story'},{...r,slides:[r.slides[0]]},{...r,slides:[r.slides[0],r.slides[0]]},{...r,slides:[r.slides[0],{...r.slides[1],assetUrl:'http://example.org/bad.jpg'}]},{...r,slides:[r.slides[0],{...r.slides[1],width:600}]}])assert.equal(validCarousel(change),false);
 assert.equal(approvedOriginalCreative({...r,photos:[{...r.photos[0],subject:''}]}),false);
});
test('every hosted slide is checked before creating ordered Meta children and one parent',async()=>{
 const calls=[],r=row();const publisher=metaPublisher({token:'fixture-token',accountId:'123',version:'v26.0',fetchImpl:async(url,options)=>{
  calls.push({url:String(url),options});if(String(url).startsWith('https://framerusercontent.com')){assert.equal(options.headers,undefined);return new Response(bytes,{headers:{'content-type':'image/jpeg'}});}
  const params=Object.fromEntries(options.body);return Response.json({id:params.media_type==='CAROUSEL'?'parent':`child-${calls.filter(c=>c.url.includes('graph.facebook.com')).length}`});
 }});
 assert.equal(await publisher.create(r),'parent');assert.equal(calls.length,7);
 const graph=calls.filter(c=>c.url.includes('graph.facebook.com'));assert.deepEqual(graph.slice(0,3).map(c=>c.options.body.get('image_url')),r.slides.map(s=>s.assetUrl));
 for(const c of graph.slice(0,3)){assert.equal(c.options.body.get('is_carousel_item'),'true');assert.equal(c.options.body.has('caption'),false);}
 assert.equal(graph.at(-1).options.body.get('children'),'child-1,child-2,child-3');assert.equal(graph.at(-1).options.body.get('caption'),r.caption);
 assert.equal(calls.some(c=>c.url.includes('media_publish')),false);
});
test('changed or inaccessible slide bytes stop before all Meta mutations',async()=>{
 let graphCalls=0;const p=metaPublisher({token:'fixture',accountId:'123',version:'v26.0',fetchImpl:async(u)=>{if(String(u).includes('graph.facebook.com'))graphCalls++;return new Response('changed',{headers:{'content-type':'image/jpeg'}})}});
 await assert.rejects(p.create(row()),/bytes changed/);assert.equal(graphCalls,0);
 await assert.rejects(verifyCarouselAssets(row(),{fetchImpl:async()=>new Response('blocked',{status:403})}),/unavailable/);
});
test('partial carousel creation failure cannot publish or retry the queue automatically',async()=>{
 const q=queue();try{const r={...row(),sourceType:'brand'};delete r.editorialSourceId;saveDraft(q.db,r);const now=Date.now(),at=new Date(now+1000).toISOString();approve(q.db,r.id,{reviewer:'Owner',scheduledAt:at,now});let count=0;
 const p=metaPublisher({token:'fixture',accountId:'123',version:'v26.0',fetchImpl:async(u)=>{if(String(u).includes('framerusercontent.com'))return new Response(bytes,{headers:{'content-type':'image/jpeg'}});count++;return count===1?Response.json({id:'child'}):new Response('fail',{status:400})}});
 const result=await dispatchDue(q.db,p,{now:now+2000});assert.equal(result[0].status,'Failed');assert.equal(count,2);assert.deepEqual(await dispatchDue(q.db,p,{now:now+3000}),[]);assert.equal(count,2);
 }finally{q.close()}
});
test('owner-requested photo refresh preserves a future slot, is idempotent and protects dispatched receipts',()=>{
 const q=queue();try{const r=row(),now=Date.now(),scheduledAt=new Date(now+3600000).toISOString();saveDraft(q.db,{...r,caption:'Old artwork'});approve(q.db,r.id,{reviewer:'Cancha owner-authorized standing plan',scheduledAt,now,allowSourceRecheck:true});
 const result=refreshPhotoEditorial(q.db,[r],{now});assert.deepEqual(result.rescheduled,[{id:r.id,scheduledAt}]);const saved=q.db.prepare('SELECT * FROM instagram_queue').get();assert.equal(saved.status,'Approved');assert.equal(saved.approved_hash,contentHash(r));
 assert.deepEqual(refreshPhotoEditorial(q.db,[r],{now}).unchanged,[r.id]);
 for(const status of ['Preparing','Publishing','Published','Needs reconciliation']){q.db.prepare('UPDATE instagram_queue SET status=?,published_id=?').run(status,'receipt');assert.deepEqual(refreshPhotoEditorial(q.db,[{...r,caption:'Different'}],{now}).protected,[r.id]);assert.equal(q.db.prepare('SELECT published_id FROM instagram_queue').get().published_id,'receipt');}
 }finally{q.close()}
});
test('reuse detection recognizes an original photo inside another carousel',()=>{const r=row();assert.equal(recentlyUsedPhoto({...r,visualEvidence:{subjectKey:'other'}},[{status:'Published',published_at:'2026-10-21T22:00:00Z',content:JSON.stringify({...r,assetUrl:'https://framerusercontent.com/images/old.jpg'})}],'2026-10-23T16:30:00Z'),true);});
test('photo-first policy schedules a checked carousel and excludes otherwise valid badge-only creative',async()=>{
 const q=queue();try{const r={...row(),factsCheckedAt:'2026-10-22T16:00:00Z'},plain={...r,id:'a-badge',slides:undefined,photos:undefined,visualEvidence:{...r.visualEvidence,kind:'local-story'}};
 assert(approvedOriginalCreative(plain));saveDraft(q.db,plain);saveDraft(q.db,r);
 savePlan(q.db,{enabled:true,weekdays:[0,1,2,3,4,5,6],localTime:'18:00',startDate:'2026-10-22',sourceTypes:['brand','news']},'Owner asks for real subject photography');
 const result=await prepareStandingPlan(q.db,{now:Date.parse('2026-10-22T17:00:00Z'),connected:true,editorialPolicy:{requireSubjectPhotos:true},verifySource:async()=>true});
 assert.deepEqual(result.scheduled.map(s=>s.id),[r.id]);assert.equal(q.db.prepare("SELECT status FROM instagram_queue WHERE id='a-badge'").get().status,'Draft');
 }finally{q.close()}
});
test('collab invites go on the parent only when enabled, and a refused invite retries without it',async()=>{
 const run=async({collabInvites,refuse,collaborators=['tampabayrowdies']})=>{const graph=[];const p=metaPublisher({token:'t',accountId:'123',version:'v26.0',collabInvites,fetchImpl:async(url,options)=>{
  if(String(url).startsWith('https://framerusercontent.com'))return new Response(bytes,{headers:{'content-type':'image/jpeg'}});
  const params=Object.fromEntries(options.body);graph.push(params);if(refuse&&params.collaborators)return Response.json({error:{code:100,message:'Invalid collaborator'}},{status:400});
  return Response.json({id:params.media_type==='CAROUSEL'?'parent':'child-'+graph.length});}});
  assert.equal(await p.create({...row(),collaborators}),'parent');return graph;};
 let g=await run({collabInvites:true});assert.equal(g.at(-1).collaborators,'["tampabayrowdies"]');assert(g.slice(0,-1).every(c=>!c.collaborators));
 g=await run({collabInvites:false});assert(g.every(c=>!c.collaborators));
 g=await run({collabInvites:true,refuse:true});assert.equal(g.at(-2).collaborators,'["tampabayrowdies"]');assert.equal(g.at(-1).collaborators,undefined);assert.equal(g.at(-1).media_type,'CAROUSEL');
 g=await run({collabInvites:true,collaborators:['Bad Handle!','a','b','c']});assert(g.every(c=>!c.collaborators));
});
