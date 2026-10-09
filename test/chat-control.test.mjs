import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createAutomationConsole} from '../server/automation-console.mjs';
import {saveDraft} from '../server/instagram-queue.mjs';
const token='fixture-control-token-'.repeat(3),statusToken='fixture-status-token-'.repeat(3);
const content={id:'fixture-brand',format:'feed',sourceType:'brand',caption:'Fixture caption',altText:'Fixture description',assetUrl:'https://framerusercontent.com/images/fixture.jpg',assetChecksum:'a'.repeat(64)};
async function fixture(run,{controlToken=token}={}){
 const dir=await mkdtemp(join(tmpdir(),'cancha-chat-control-'));
 const admin=createAutomationConsole({baseUrl:'https://fixture.example',password:'fixture-admin-password-'.repeat(3),encryptionKey:'fixture-encryption-key-'.repeat(3),vaultPath:join(dir,'meta.sqlite'),queuePath:join(dir,'queue.sqlite'),controlToken,statusToken});
 const server=http.createServer((req,res)=>admin.handle(req,res));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const request=(path,command,credential=token)=>fetch('http://127.0.0.1:'+server.address().port+path,{method:command?'POST':'GET',headers:{Authorization:'Bearer '+credential,...(command?{'Content-Type':'application/json'}:{})},body:command?JSON.stringify(command):undefined});
 try{await run({admin,request});}finally{await new Promise(resolve=>server.close(resolve));admin.close();await rm(dir,{recursive:true,force:true});}
}
test('chat API separates credentials, binds owner commands to current content and makes schedule retries idempotent',()=>fixture(async({admin,request})=>{
 saveDraft(admin.db,content);admin.vault.save({username:'wearecancha',accountType:'BUSINESS',pageToken:'fixture-private-meta-token'});
 assert.equal((await request('/automation/review',null,statusToken)).status,401);
 let response=await request('/automation/review');let view=await response.json();assert.equal(view.meta.connected,true);assert.equal(view.plan,null);assert.doesNotMatch(JSON.stringify(view),/fixture-private-meta-token/);
 let post=view.posts[0];const command={requestId:'fixture-schedule-0001',action:'schedule',id:post.id,version:post.version,scheduledAt:'2099-10-12T22:00:00Z',ownerInstruction:'Owner explicitly asks to schedule this fixture post',authorized:false};
 assert.equal((await request('/automation/control',command)).status,422);assert.equal(admin.db.prepare('SELECT status FROM instagram_queue').get().status,'Draft');
 const edit={requestId:'fixture-edit-0000001',action:'edit',id:post.id,version:post.version,caption:'Updated fixture caption',altText:'Updated fixture description',ownerInstruction:'Owner asks to edit this caption'};
 assert.equal((await request('/automation/control',edit)).status,200);
 command.authorized=true;assert.equal((await request('/automation/control',command)).status,409);
 post=(await(await request('/automation/review')).json()).posts[0];command.version=post.version;
 response=await request('/automation/control',command);assert.equal(response.status,200);assert.equal((await response.json()).post.status,'Approved');
 response=await request('/automation/control',command);assert.equal(response.status,200);assert.equal((await response.json()).replayed,true);assert.equal(admin.db.prepare('SELECT COUNT(*) AS n FROM chat_control_receipts').get().n,2);
 assert.equal((await request('/automation/control',{...command,scheduledAt:'2099-10-13T22:00:00Z'})).status,409);
 post=(await(await request('/automation/review')).json()).posts[0];const cancel={requestId:'fixture-cancel-000001',action:'cancel',id:post.id,version:post.version,ownerInstruction:'Owner cancels this fixture schedule'};assert.equal((await request('/automation/control',cancel)).status,200);assert.equal(admin.db.prepare('SELECT status FROM instagram_queue').get().status,'Draft');
}));
test('chat control remains disabled without its own secret, and ingestion cannot authorize it',()=>fixture(async({request})=>{assert.equal((await request('/automation/review')).status,503);},{controlToken:null}));
test('draft import strips scheduling claims and standing plan activation requires explicit owner authorization',()=>fixture(async({admin,request})=>{
 const create={requestId:'fixture-create-000001',action:'draft',id:content.id,content:{...content,status:'Approved',scheduledAt:'2099-10-12T22:00:00Z',contactEmail:'fixture-private-contact'},ownerInstruction:'Owner requests a new draft'};
 const response=await request('/automation/control',create);assert.equal(response.status,200);const result=await response.json();assert.equal(result.post.status,'Draft');assert.equal(result.post.scheduledAt,null);assert.doesNotMatch(JSON.stringify(result),/fixture-private-contact/);
 const command={requestId:'fixture-plan-0000001',action:'plan',ownerInstruction:'Owner authorizes this fixture standing plan',plan:{enabled:true,weekdays:[1,3,5],localTime:'18:00',startDate:'2099-10-12',sourceTypes:['brand']}};
 assert.equal((await request('/automation/plan',command)).status,422);assert.equal((await(await request('/automation/review')).json()).plan,null);
 command.authorized=true;assert.equal((await request('/automation/plan',command)).status,200);assert.equal((await(await request('/automation/review')).json()).plan.enabled,true);
 assert.equal((await request('/automation/plan',{requestId:'fixture-pause-000001',action:'plan',authorized:true,ownerInstruction:'Owner pauses plan',plan:{enabled:false}})).status,200);
 assert.equal((await(await request('/automation/review')).json()).plan.enabled,false);
}));
