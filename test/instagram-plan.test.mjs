import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';import {join} from 'node:path';import {tmpdir} from 'node:os';
import {openQueue,saveDraft,dispatchDue,approve} from '../server/instagram-queue.mjs';
import {savePlan,readPlan,prepareStandingPlan} from '../server/instagram-plan.mjs';
async function fixture(run){const dir=await mkdtemp(join(tmpdir(),'cancha-standing-plan-')),db=openQueue(join(dir,'queue.sqlite'));try{await run(db);}finally{db.close();await rm(dir,{recursive:true,force:true});}}
const now=Date.parse('2026-10-12T16:00:00Z');
const draft=(id,sourceType='brand',format='feed')=>({id,format,sourceType,caption:'Fixture caption '+id,altText:'Fixture description',assetUrl:'https://framerusercontent.com/images/fixture.jpg',assetChecksum:'a'.repeat(64),...(sourceType==='opportunity'?{factsCheckedAt:new Date(now-1000).toISOString(),sourceHash:'a'.repeat(64),officialSourceUrl:'https://www.teamworkonline.com/fixture'}:{})});
const plan={enabled:true,weekdays:[1,3,5],localTime:'18:00',startDate:'2026-10-12',sourceTypes:['brand','opportunity']};
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
