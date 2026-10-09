import test from 'node:test';import assert from 'node:assert/strict';import {mkdtemp,rm} from 'node:fs/promises';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {openQueue,saveDraft,approve,dispatchDue} from '../server/instagram-queue.mjs';
import {sealState,unsealState,snapshotState,restoreState,backendFrozen} from '../server/github-state.mjs';import {exportForGitHub} from '../server/github-migration.mjs';import {savePlan,prepareStandingPlan} from '../server/instagram-plan.mjs';import {githubStateClient} from '../scripts/github-state-client.mjs';
const key='fixture-state-secret-'.repeat(3),now=Date.parse('2026-10-12T16:00:00Z');
const draft={id:'fixture',format:'feed',sourceType:'brand',caption:'Original fixture copy',altText:'Fixture graphic',assetUrl:'https://framerusercontent.com/images/fixture.jpg',assetChecksum:'a'.repeat(64)};
async function fixture(fn){const dir=await mkdtemp(join(tmpdir(),'cancha-migration-')),db=openQueue(join(dir,'queue.sqlite'));try{await fn(db,dir);}finally{db.close();await rm(dir,{recursive:true,force:true});}}
test('encrypted migration preserves secrets and queue, rejects tampering and freezes Render across restarts',()=>fixture(async(db,dir)=>{
 saveDraft(db,draft);savePlan(db,{enabled:true,weekdays:[1],localTime:'18:00',startDate:'2026-10-12',sourceTypes:['brand']},'Fixture standing authorization');
 const connection={pageToken:'fixture-private-token',username:'wearecancha'},vault={read:()=>connection,exportBackups:()=>[{private:'fixture-email@example.test'}]};
 const encrypted=exportForGitHub({db,vault,key});assert.equal(backendFrozen(db),true);assert.doesNotMatch(JSON.stringify(encrypted),/fixture-private-token|fixture-email/);assert.equal(unsealState(encrypted,key).connection.pageToken,connection.pageToken);
 assert.throws(()=>unsealState(encrypted,'different-state-secret-'.repeat(3)));const changed={...encrypted,tag:Buffer.alloc(16).toString('base64')};assert.throws(()=>unsealState(changed,key));
 assert.deepEqual(exportForGitHub({db,vault,key}),encrypted);assert.equal((await prepareStandingPlan(db,{now,connected:true})).paused,true);
 let creates=0;assert.deepEqual(await dispatchDue(db,{create:async()=>{creates++;}},{now}),[]);assert.equal(creates,0);
 const restored=openQueue(join(dir,'github.sqlite'));try{restoreState(restored,unsealState(encrypted,key));assert.equal(backendFrozen(restored),false);assert.equal(restored.prepare('SELECT content FROM instagram_queue').get().content,JSON.stringify(draft));assert.equal((await prepareStandingPlan(restored,{now,connected:true})).scheduled.length,1);}finally{restored.close();}
}));
test('migration refuses an in-flight publication and cannot lock Render with an invalid key',()=>fixture(async db=>{
 saveDraft(db,draft);const vault={read:()=>({pageToken:'fixture'}),exportBackups:()=>[]};assert.throws(()=>exportForGitHub({db,vault,key:'short'}));assert.equal(backendFrozen(db),false);
 db.prepare("UPDATE instagram_queue SET status='Publishing'").run();assert.throws(()=>exportForGitHub({db,vault,key}),/progress/);assert.equal(backendFrozen(db),false);
}));
test('a durable checkpoint must succeed before Meta publication and interrupted claims never retry',()=>fixture(async db=>{
 saveDraft(db,draft);approve(db,draft.id,{reviewer:'Fixture owner',scheduledAt:'2026-10-12T17:00:00Z',now});let published=0;
 const publisher={create:async()=> 'fixture-container',status:async()=> 'FINISHED',publish:async()=>{published++;return 'fixture-published';}};
 await assert.rejects(dispatchDue(db,publisher,{now:Date.parse('2026-10-12T18:00:00Z'),checkpoint:async()=>{throw Error('Fixture state storage unavailable');}}));assert.equal(published,0);assert.equal(db.prepare('SELECT status FROM instagram_queue').get().status,'Publishing');
 assert.deepEqual(await dispatchDue(db,publisher,{now:Date.parse('2026-10-12T18:01:00Z')}),[]);assert.equal(published,0);
}));
test('GitHub state uses compare-and-swap and never overwrites another run after a conflict',async()=>{
 const initial={schema:1,queue:[],connection:{pageToken:'fixture-private-token'}},envelope=sealState(initial,key);let puts=0;
 const fetchImpl=async(url,options)=>{assert.equal(options.headers.Authorization,'Bearer fixture-token');if(options.method==='GET')return Response.json({sha:'fixture-old-sha',encoding:'base64',content:Buffer.from(JSON.stringify(envelope)).toString('base64')});puts++;const body=JSON.parse(options.body);assert.equal(body.sha,'fixture-old-sha');assert.doesNotMatch(Buffer.from(body.content,'base64').toString(),/fixture-private-token/);return new Response('',{status:409});};
 const client=githubStateClient({token:'fixture-token',key,fetchImpl});try{assert.equal((await client.load()).connection.pageToken,initial.connection.pageToken);await assert.rejects(client.save(initial),/409/);assert.equal(puts,1);}finally{await client.close();}
});
test('restore preserves a never-activated paused plan and private receipt history',()=>fixture(async(db,dir)=>{
 saveDraft(db,draft);savePlan(db,{enabled:false},'Fixture owner pauses before activation');
 db.exec('CREATE TABLE chat_control_receipts(id TEXT PRIMARY KEY,payload_hash TEXT,result TEXT,created_at TEXT,owner_instruction TEXT)');db.prepare('INSERT INTO chat_control_receipts VALUES(?,?,?,?,?)').run('fixture-request-id','fixture-hash','{}',new Date().toISOString(),'Fixture private instruction');
 const state=snapshotState(db,{pageToken:'fixture'}),restored=openQueue(join(dir,'restore-paused.sqlite'));try{restoreState(restored,state);assert.equal((await prepareStandingPlan(restored,{now,connected:true})).paused,true);assert.equal(restored.prepare('SELECT owner_instruction FROM chat_control_receipts').get().owner_instruction,'Fixture private instruction');}finally{restored.close();}
}));

test('replacement Meta credentials must verify exact identity before modifying the connection',async()=>{
 const {renewMetaConnection}=await import('../server/meta-renewal.mjs');const connection={accountId:'123',version:'v26.0',pageToken:'fixture-old',accountType:'UNCONFIRMED'},expected={instagramAccountId:'123',username:'wearecancha'};
 await assert.rejects(renewMetaConnection(connection,'fixture-new',expected,{fetchImpl:async()=>Response.json({id:'999',username:'wearecancha'})}),/does not match/);assert.equal(connection.pageToken,'fixture-old');
 await assert.rejects(renewMetaConnection(connection,'fixture-new',expected,{fetchImpl:async()=>new Response('private upstream details',{status:403})}),error=>!error.message.includes('private upstream details'));
 const updated=await renewMetaConnection(connection,'fixture-new',expected,{fetchImpl:async(url,options)=>{assert.equal(new URL(url).hostname,'graph.facebook.com');assert.equal(new URL(url).searchParams.has('access_token'),false);assert.equal(options.headers.Authorization,'Bearer fixture-new');return Response.json({id:'123',username:'wearecancha'});}});assert.equal(updated.pageToken,'fixture-new');assert.equal(updated.accountType,'UNCONFIRMED');assert.equal(connection.pageToken,'fixture-old');
});
