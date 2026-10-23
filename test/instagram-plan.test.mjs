import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';import {join} from 'node:path';import {tmpdir} from 'node:os';
import {openQueue,saveDraft,dispatchDue,approve} from '../server/instagram-queue.mjs';
import {savePlan,readPlan,prepareStandingPlan} from '../server/instagram-plan.mjs';
async function fixture(run){const dir=await mkdtemp(join(tmpdir(),'cancha-standing-plan-')),db=openQueue(join(dir,'queue.sqlite'));try{await run(db);}finally{db.close();await rm(dir,{recursive:true,force:true});}}
const now=Date.parse('2026-10-12T16:00:00Z');
const draft=(id,sourceType='brand',format='feed')=>({id,format,sourceType,caption:'Fixture caption '+id,altText:'Fixture description',assetUrl:'https://framerusercontent.com/images/fixture.jpg',assetChecksum:'a'.repeat(64),...(sourceType==='opportunity'?{factsCheckedAt:new Date(now-1000).toISOString(),sourceHash:'a'.repeat(64),officialSourceUrl:'https://www.teamworkonline.com/fixture'}:{})});
const plan={enabled:true,weekdays:[1,3,5],localTime:'18:00',startDate:'2026-10-12',sourceTypes:['brand','opportunity']};
test('two daily slots schedule different clubs, remain idempotent and both pause cleanly',()=>fixture(async db=>{
 const at=Date.parse('2026-10-12T14:05:00Z');
 for(const [id,badge,checksum]of[['a-club','weston','1'],['b-same-club','weston','2'],['c-other-club','jax','3']])saveDraft(db,{...draft(id),editorialOrganization:badge,assetChecksum:checksum.repeat(64),assetUrl:'https://framerusercontent.com/images/'+id+'.jpg'});
 savePlan(db,{...plan,weekdays:[0,1,2,3,4,5,6],localTimes:['12:30','18:00']},'Owner asks for two good local posts per day');
 assert.equal(readPlan(db).maxPerWeek,14);
 const result=await prepareStandingPlan(db,{now:at,connected:true});assert.deepEqual(result.scheduled.map(x=>x.id),['a-club','c-other-club']);assert.deepEqual(result.scheduled.map(x=>x.scheduledAt),['2026-10-12T16:30:00.000Z','2026-10-12T22:00:00.000Z']);
 assert.equal((await prepareStandingPlan(db,{now:at,connected:true})).scheduled.length,0);
 savePlan(db,{enabled:false},'Owner pauses both daily slots');assert.equal(db.prepare("SELECT count(*) n FROM instagram_queue WHERE status='Approved'").get().n,0);
 assert.throws(()=>savePlan(db,{...plan,localTimes:['12:30','14:00']},'Too close fixture'),/four hours/);
 assert.throws(()=>savePlan(db,{...plan,localTimes:['12:30','18:00','21:00']},'Too many fixture'),/one or two/);
}));
test('curated local stories take priority but still need live source confirmation and a vacant slot',()=>fixture(async db=>{
 saveDraft(db,{...draft('a-generic'),topic:'community'});
 saveDraft(db,{...draft('b-checked'),editorialSourceId:'reviewed-local-story',factsCheckedAt:new Date(now-5*86400000).toISOString()});
 saveDraft(db,{...draft('c-changed'),editorialSourceId:'changed-story',factsCheckedAt:new Date(now-1000).toISOString()});
 savePlan(db,plan,'Owner requests local club and people features under daily plan');
 const result=await prepareStandingPlan(db,{now,connected:true,editorialPolicy:{communityFirst:true,curatedDraftIds:['c-changed','b-checked']},verifySource:async r=>r.id==='b-checked'});
 assert.deepEqual(result.scheduled.map(x=>x.id),['b-checked']);assert(result.skipped.some(x=>x.id==='c-changed'));
 const again=await prepareStandingPlan(db,{now,connected:true,editorialPolicy:{curatedDraftIds:['a-generic']}});assert.equal(again.scheduled.length,0);
 assert.equal(db.prepare("SELECT status FROM instagram_queue WHERE id='a-generic'").get().status,'Draft');
}));
test('community preference selects conversation content and leaves retired promotional drafts alone',()=>fixture(async db=>{saveDraft(db,{...draft('a-promotion'),topic:'update'});saveDraft(db,{...draft('b-retired'),topic:'community'});saveDraft(db,{...draft('c-conversation'),topic:'community'});savePlan(db,plan,'Owner requests community content before promotion');const result=await prepareStandingPlan(db,{now,connected:true,editorialPolicy:{communityFirst:true,communityWeeklyTarget:4,retiredDraftIds:['b-retired']}});assert.deepEqual(result.scheduled.map(x=>x.id),['c-conversation']);assert.equal(db.prepare('SELECT status FROM instagram_queue WHERE id=?').get('b-retired').status,'Draft');assert.equal(db.prepare("SELECT COUNT(*) AS n FROM instagram_queue WHERE status='Approved'").get().n,1)}));
test('standing plan chooses only agreed feed slots, skips unsafe sources and stops its pending posts on pause',()=>fixture(async db=>{
 for(const row of [draft('a-closed','opportunity'),draft('b-valid','opportunity'),draft('c-brand'),draft('d-brand'),draft('providers-coming-soon'),draft('a-story','brand','story')])saveDraft(db,row);
 assert.equal((await prepareStandingPlan(db,{now,connected:true})).paused,true);
 savePlan(db,plan,'Fixture owner agreed to three weekly feed posts');
 let sourceReads=0;let result=await prepareStandingPlan(db,{now,connected:true,verifySource:async row=>{sourceReads++;return row.id==='b-valid';}});
 assert.equal(result.scheduled.length,1);assert.deepEqual(result.scheduled.map(row=>row.scheduledAt),['2026-10-12T22:00:00.000Z']);assert.equal(result.skipped[0].id,'a-closed');
 assert.equal(db.prepare('SELECT status FROM instagram_queue WHERE id=?').get('a-story').status,'Draft');assert.equal(db.prepare('SELECT status FROM instagram_queue WHERE id=?').get('providers-coming-soon').status,'Draft');
 result=await prepareStandingPlan(db,{now,connected:true,verifySource:async()=>{sourceReads++;return false;}});assert.equal(result.alreadyChecked,true);assert.equal(sourceReads,2);
 savePlan(db,{enabled:false},'Fixture owner pauses all automatic schedules');assert.equal(readPlan(db).enabled,false);assert.equal(db.prepare("SELECT COUNT(*) AS n FROM instagram_queue WHERE status='Approved'").get().n,0);
}));
test('pausing during a source check cannot schedule or resurrect an automatic post',()=>fixture(async db=>{
 saveDraft(db,draft('fixture-opportunity','opportunity'));savePlan(db,plan,'Fixture owner authorizes the standing plan');
 let result=await prepareStandingPlan(db,{now,connected:true,verifySource:async()=>{savePlan(db,{enabled:false},'Fixture owner pauses during a check');return true;}});assert.equal(result.paused,true);assert.equal(db.prepare('SELECT status FROM instagram_queue').get().status,'Draft');
 savePlan(db,plan,'Fixture owner reauthorizes the standing plan');await prepareStandingPlan(db,{now,connected:true,verifySource:async()=>true});
 let creates=0;await dispatchDue(db,{create:async()=>{creates++;return 'fixture-container';},status:async()=> 'FINISHED',publish:async()=> 'fixture-published'}, {now:Date.parse('2026-10-12T22:01:00Z'),verifySource:async()=>{savePlan(db,{enabled:false},'Fixture owner pauses during dispatch');return true;}});
 assert.equal(creates,0);assert.equal(db.prepare('SELECT status FROM instagram_queue').get().status,'Draft');
}));

test('daily plan waits for its freshness window and respects another post on the same New York day',()=>fixture(async db=>{
 saveDraft(db,draft('automatic'));saveDraft(db,draft('manual'));
 savePlan(db,{...plan,weekdays:[0,1,2,3,4,5,6]},'Fixture owner authorizes one post daily');
 let result=await prepareStandingPlan(db,{now:Date.parse('2026-10-12T12:00:00Z'),connected:true});assert.equal(result.scheduled.length,0);
 approve(db,'manual',{reviewer:'Fixture owner',scheduledAt:'2026-10-12T20:00:00Z',now});
 result=await prepareStandingPlan(db,{now,connected:true});assert.equal(result.scheduled.length,0);assert.equal(db.prepare("SELECT status FROM instagram_queue WHERE id='automatic'").get().status,'Draft');
}));

test('photo-required preparation leaves old plain brand drafts unscheduled',()=>fixture(async db=>{
 saveDraft(db,draft('a-plain'));saveDraft(db,{...draft('b-photo'),photo:{url:'https://framerusercontent.com/images/fixture.jpg',sourcePage:'https://commons.wikimedia.org/wiki/File:Fixture.jpg',creator:'Fixture author',license:'CC0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/deed.en',layout:'photo-split',originalChecksum:'b'.repeat(64)}});
 savePlan(db,plan,'Fixture owner authorizes daily photo content');
 const result=await prepareStandingPlan(db,{now,connected:true,requireBrandPhotos:true});assert.deepEqual(result.scheduled.map(x=>x.id),['b-photo']);assert.equal(db.prepare("SELECT status FROM instagram_queue WHERE id='a-plain'").get().status,'Draft');
}));

test('standing plan skips a reused source photo even when the next post has a different crop',()=>fixture(async db=>{
 const original={originalChecksum:'c'.repeat(64),sourcePage:'https://commons.wikimedia.org/wiki/File:Pitch.jpg',url:'https://framerusercontent.com/images/pitch.jpg'};
 saveDraft(db,{...draft('previous'),assetChecksum:'1'.repeat(64),assetUrl:'https://framerusercontent.com/images/previous.jpg',photo:original});db.prepare("UPDATE instagram_queue SET status='Published',published_at='2026-10-11T22:00:00Z',scheduled_at='2026-10-11T22:00:00Z' WHERE id='previous'").run();
 saveDraft(db,{...draft('a-reused'),assetChecksum:'2'.repeat(64),assetUrl:'https://framerusercontent.com/images/new-crop.jpg',photo:{...original,url:'https://framerusercontent.com/images/recropped.jpg'}});
 saveDraft(db,{...draft('b-fresh'),assetChecksum:'3'.repeat(64),assetUrl:'https://framerusercontent.com/images/fresh.jpg',photo:{originalChecksum:'d'.repeat(64),sourcePage:'https://commons.wikimedia.org/wiki/File:Other.jpg',url:'https://framerusercontent.com/images/other.jpg'}});
 savePlan(db,plan,'Fixture owner authorizes the standing plan');const result=await prepareStandingPlan(db,{now,connected:true});assert.deepEqual(result.scheduled.map(x=>x.id),['b-fresh']);assert(result.skipped.some(x=>x.id==='a-reused'));assert.equal(db.prepare("SELECT status FROM instagram_queue WHERE id='a-reused'").get().status,'Draft');
}));
test('the new creative gate excludes legacy posts and allows evidenced original directory artwork',()=>fixture(async db=>{
 saveDraft(db,draft('a-legacy'));
 const image='b'.repeat(64);saveDraft(db,{...draft('b-local'),factsCheckedAt:new Date(now).toISOString(),creativeVersion:'cancha-local-v2',assetChecksum:image,rights:'Original Cancha screenshot and design',visualEvidence:{creator:'Cancha',kind:'product-demo',subjectKey:'directory-demo',sourceUrl:'https://pioneering-friday-005497.framer.app/clubs',assetChecksum:image,renderedAt:new Date().toISOString()}});
 saveDraft(db,{...draft('a-local-tip'),topic:'tip',creativeVersion:'cancha-local-v2',assetChecksum:'c'.repeat(64),rights:'Original Cancha guide',visualEvidence:{creator:'Cancha',kind:'parent-guide',subjectKey:'parent-guide',assetChecksum:'c'.repeat(64),renderedAt:new Date().toISOString()}});savePlan(db,plan,'Owner requested better local discovery content under the existing daily authorization');const result=await prepareStandingPlan(db,{now,connected:true,requireBrandPhotos:true,requireCreativeVersion:'cancha-local-v2',preferredDraftId:'b-local',verifySource:async()=>true});assert.deepEqual(result.scheduled.map(x=>x.id),['b-local']);assert.equal(db.prepare("SELECT status FROM instagram_queue WHERE id='a-legacy'").get().status,'Draft');
}));
test('a delayed runner can recover a missed slot within 90 minutes without creating an extra daily approval',()=>fixture(async db=>{
 saveDraft(db,draft('catchup'));saveDraft(db,draft('another'));savePlan(db,plan,'Owner permits slightly delayed daily publication');
 const at=Date.parse('2026-10-12T22:20:00Z'),policy={lateSlotGraceMinutes:90};const first=await prepareStandingPlan(db,{now:at,connected:true,editorialPolicy:policy});assert.equal(first.scheduled.length,1);assert.equal(first.scheduled[0].scheduledAt,'2026-10-12T22:20:01.000Z');
 const second=await prepareStandingPlan(db,{now:at+60000,connected:true,editorialPolicy:policy});assert.equal(second.scheduled.length,0);assert.equal(db.prepare("SELECT count(*) n FROM instagram_queue WHERE status='Approved'").get().n,1);
}));
test('missed slots outside the grace window are skipped rather than backfilled late at night',()=>fixture(async db=>{
 saveDraft(db,draft('late'));savePlan(db,plan,'Owner authorizes only the agreed daily slots');const result=await prepareStandingPlan(db,{now:Date.parse('2026-10-12T23:31:00Z'),connected:true,editorialPolicy:{lateSlotGraceMinutes:90}});assert.equal(result.scheduled.length,0);
}));
test('a source rejected before publication frees its slot for a different checked post without reusing the old media container',()=>fixture(async db=>{
 const at=Date.parse('2026-10-12T22:20:00Z');saveDraft(db,draft('a-unavailable','opportunity'));saveDraft(db,{...draft('b-fresh'),assetChecksum:'b'.repeat(64),assetUrl:'https://framerusercontent.com/images/fresh.jpg'});savePlan(db,plan,'Owner allows verified replacement content within the late window');
 approve(db,'a-unavailable',{reviewer:'Cancha owner-authorized standing plan',scheduledAt:'2026-10-12T22:00:00Z',now});db.prepare("UPDATE instagram_queue SET status='Preparing',container_id='unpublished-old-container' WHERE id='a-unavailable'").run();
 let mutations=0;await dispatchDue(db,{create:async()=>{mutations++;return'id'},status:async()=>{mutations++;return'FINISHED'},publish:async()=>{mutations++;return'published'}},{now:at,verifySource:async()=>false});assert.equal(mutations,0);const old=db.prepare("SELECT * FROM instagram_queue WHERE id='a-unavailable'").get();assert.equal(old.status,'Draft');assert.equal(old.scheduled_at,null);assert.equal(old.container_id,null);assert.equal(old.approved_hash,null);
 const result=await prepareStandingPlan(db,{now:at,connected:true,editorialPolicy:{lateSlotGraceMinutes:90},verifySource:async()=>false});assert.deepEqual(result.scheduled.map(r=>r.id),['b-fresh']);assert.equal(db.prepare("SELECT status FROM instagram_queue WHERE id='a-unavailable'").get().status,'Draft');
}));
test('a legacy Draft with a leftover scheduled date cannot consume a current publishing slot',()=>fixture(async db=>{
 saveDraft(db,draft('legacy-draft'));db.prepare("UPDATE instagram_queue SET scheduled_at='2026-10-12T22:00:00Z' WHERE id='legacy-draft'").run();saveDraft(db,{...draft('replacement'),assetUrl:'https://framerusercontent.com/images/another.jpg',assetChecksum:'f'.repeat(64)});savePlan(db,plan,'Owner requests the active daily plan');
 const result=await prepareStandingPlan(db,{now,connected:true,preferredDraftId:'replacement'});assert.deepEqual(result.scheduled.map(r=>r.id),['replacement']);
}));
test('an unavailable source backs off for a day and does not block a newly prepared replacement',()=>fixture(async db=>{
 saveDraft(db,draft('a-blocked','opportunity'));savePlan(db,plan,'Owner wants verified daily content');let reads=0;await prepareStandingPlan(db,{now,connected:true,verifySource:async()=>{reads++;return false}});assert.match(db.prepare("SELECT note FROM instagram_queue WHERE id='a-blocked'").get().note,/Source unavailable/);
 saveDraft(db,{...draft('z-replacement'),assetUrl:'https://framerusercontent.com/images/replacement.jpg',assetChecksum:'e'.repeat(64)});const r=await prepareStandingPlan(db,{now:now+30000,connected:true,verifySource:async()=>{reads++;return false}});assert.equal(reads,1);assert.deepEqual(r.scheduled.map(p=>p.id),['z-replacement']);
}));
