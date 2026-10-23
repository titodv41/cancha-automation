import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {approvedProductDemo,confirmProductSource,verifyProductAssets,refreshProductEditorial} from '../server/product-editorial.mjs';
import {openQueue,saveDraft,contentHash} from '../server/instagram-queue.mjs';
import {savePlan,prepareStandingPlan} from '../server/instagram-plan.mjs';
import {satisfiesDailyMediaMix} from '../server/instagram-media-mix.mjs';
import {localStoryDescriptor,localStoryHash} from '../server/local-story-source.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex'),jpg=Buffer.from([255,216,255,217]),png=Buffer.from([137,80,78,71,13,10,26,10]);
const policy={productDemoDraftIds:['product'],requireSubjectPhotos:true,requireDistinctCarouselPhotos:true,minimumDailyCarousels:1,allowMotionStories:false,maxWeeklyProductPosts:2,curatedDraftIds:['product','carousel']};
const product=()=>({id:'product',format:'feed',sourceType:'brand',creativeKind:'product-demo',creativeVersion:'cancha-local-v2',factsCheckedAt:'2026-10-23T14:00:00Z',caption:'Actual Cancha directory',altText:'Directory screenshot',rights:'Original Cancha design',assetUrl:'https://framerusercontent.com/images/product.jpg',assetChecksum:sha(jpg),screenshot:{sourceUrl:'https://pioneering-friday-005497.framer.app/clubs?near=33138',assetUrl:'https://framerusercontent.com/images/capture.png',assetChecksum:sha(png),width:1100,height:900,capturedAt:new Date().toISOString()},visualEvidence:{creator:'Cancha',kind:'product-demo',subjectKey:'product',sourceUrl:'https://pioneering-friday-005497.framer.app/clubs?near=33138',assetChecksum:sha(jpg),renderedAt:new Date().toISOString()}});
function queue(){const dir=mkdtempSync(join(tmpdir(),'cancha-product-'));return{db:openQueue(join(dir,'q.sqlite')),close(){this.db.close();rmSync(dir,{recursive:true,force:true})}}}
test('only curated actual product captures pass the subject-photo exception',()=>{
 const p=product();assert.notEqual(contentHash(p),contentHash({...p,screenshot:{...p.screenshot,sourceUrl:'https://pioneering-friday-005497.framer.app/clubs?near=32801'}}));assert(approvedProductDemo(p,policy));assert(!approvedProductDemo(p,{}));
 for(const change of [{...p,screenshot:undefined},{...p,id:'unreviewed'},{...p,screenshot:{...p.screenshot,sourceUrl:'https://example.com/clubs'}},{...p,screenshot:{...p.screenshot,capturedAt:'2020-01-01'}},{...p,screenshot:{...p.screenshot,assetUrl:'https://private.example/capture.png'}},{...p,screenshot:{...p.screenshot,width:300}}])assert.equal(approvedProductDemo(change,policy),false);
});
test('hosted poster and actual screenshot bytes are checked with no authorization header',async()=>{
 const p=product();let reads=0;await verifyProductAssets(p,policy,{fetchImpl:async(u,o)=>{reads++;assert.equal(o.headers,undefined);return new Response(u.endsWith('.png')?png:jpg,{headers:{'content-type':u.endsWith('.png')?'image/png':'image/jpeg'}})}});assert.equal(reads,2);
 await assert.rejects(verifyProductAssets(p,policy,{fetchImpl:async()=>new Response('changed',{headers:{'content-type':'image/jpeg'}})}),/changed/);
 assert.equal(await confirmProductSource(p,{fetchImpl:async()=>new Response('Cancha directory',{headers:{'content-type':'text/html'}})}),true);
 assert.equal(await confirmProductSource({...p,visualEvidence:{sourceUrl:'https://example.com/clubs'}},{fetchImpl:async()=>{throw Error('Must not fetch external URL')}}),false);
 assert.equal(await confirmProductSource(p,{fetchImpl:async()=>new Response('blocked',{status:403})}),false);
});
test('product refresh protects approvals and publication receipts; invalid batches write nothing',()=>{
 const q=queue();try{const p=product();refreshProductEditorial(q.db,[p],policy);q.db.prepare("UPDATE instagram_queue SET status='Published',published_id='receipt' WHERE id='product'").run();assert.deepEqual(refreshProductEditorial(q.db,[{...p,caption:'Changed'}],policy).protected,['product']);assert.equal(q.db.prepare('SELECT published_id FROM instagram_queue').get().published_id,'receipt');assert.throws(()=>refreshProductEditorial(q.db,[{...p,id:'unexpected'}],policy));assert.equal(q.db.prepare('SELECT count(*) n FROM instagram_queue').get().n,1);}finally{q.close()}
});
test('a product post cannot consume the only slot or displace the daily carousel',async()=>{
 const q=queue();try{
  const p=product();saveDraft(q.db,p);const at=Date.parse('2026-10-23T14:05:00Z');
  savePlan(q.db,{enabled:true,weekdays:[0,1,2,3,4,5,6],localTime:'18:00',localTimes:['12:30','18:00'],startDate:'2026-10-23',sourceTypes:['brand','news']},'Owner wants club carousels and occasional real platform posts');
  assert.equal((await prepareStandingPlan(q.db,{now:at,connected:true,editorialPolicy:policy,verifySource:async()=>true})).scheduled.length,0);
  const source=localStoryDescriptor('rowdies-shield-20261018'),photos=['a','b'].map(id=>({id,authorization:'owner-cleared-2026-10-22',publisher:'Tampa Bay Rowdies',subject:'Club photo '+id,sourcePage:source.documents[0].url,originalUrl:'https://www.rowdiessoccer.com/'+id+'.jpg',originalChecksum:id.repeat(64)})),slides=photos.map(p=>({photoId:p.id,assetUrl:'https://framerusercontent.com/images/'+p.id+'.jpg',assetChecksum:p.originalChecksum,width:1080,height:1350,altText:'Actual club photo'}));
  const c={...p,id:'carousel',creativeKind:'photo-carousel',sourceType:'news',caption:'Club ground guide',editorialSourceId:source.id,sourceHash:localStoryHash(source),officialSourceUrl:source.documents[0].url,factsCheckedAt:new Date(at).toISOString(),photos,slides,assetUrl:slides[0].assetUrl,assetChecksum:slides[0].assetChecksum,visualEvidence:{creator:'Cancha',kind:'photo-carousel',subjectKey:source.id,sourceUrl:source.documents[0].url,sourceHash:localStoryHash(source),renderedAt:new Date().toISOString(),assetChecksum:slides[0].assetChecksum}};delete c.screenshot;saveDraft(q.db,c);
  const result=await prepareStandingPlan(q.db,{now:at,connected:true,editorialPolicy:policy,verifySource:async()=>true});assert.deepEqual(result.scheduled.map(r=>r.id),['carousel','product']);
  assert.equal(satisfiesDailyMediaMix(p,[],policy,{now:at}),false);assert.equal(satisfiesDailyMediaMix(p,[{status:'Approved',content:JSON.stringify(c)}],policy,{now:at}),false);
  assert.equal(satisfiesDailyMediaMix(p,[{status:'Published',published_at:'2026-10-23T16:30:00Z',content:JSON.stringify(c)}],policy,{now:Date.parse('2026-10-23T22:00:00Z')}),true);
  q.db.prepare("UPDATE instagram_queue SET status='Published',published_at='2026-10-23T16:30:00Z' WHERE id='carousel'").run();
  q.db.prepare("UPDATE instagram_queue SET status='Draft',scheduled_at=NULL WHERE id='product'").run();
  for(const [id,date]of [['old-one','2026-10-20T22:00:00Z'],['old-two','2026-10-21T22:00:00Z']]){saveDraft(q.db,{...p,id});q.db.prepare("UPDATE instagram_queue SET status='Published',scheduled_at=?,published_at=? WHERE id=?").run(date,date,id)}
  const capped=await prepareStandingPlan(q.db,{now:Date.parse('2026-10-23T17:00:00Z'),connected:true,editorialPolicy:policy,verifySource:async()=>true});assert.equal(capped.scheduled.length,0);assert(capped.skipped.some(r=>r.reason==='Weekly product-post limit reached'));

 }finally{q.close()}
});
