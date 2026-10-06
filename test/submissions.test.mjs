import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createSubmissionServer,signatureFor} from '../server/submissions.mjs';
const testSecret='test-fixture-only-not-a-real-credential';
const submission={Organization:'Test organization','Contact Name':'Test person','Contact Email':'fixture@example.invalid','Opportunity Title':'Test opportunity',Category:'Tryout',Location:'Test location',Eligibility:'Test eligibility','Registration Link':'https://example.invalid/register',Description:'Test only',Permission:true,Status:'Approved'};
test('signed submissions stay private and Pending review; retries and duplicates are handled',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'cancha-queue-test-'));const {server,db}=createSubmissionServer({secret:testSecret,databasePath:join(dir,'queue.sqlite')});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 const post=async(data,id='test-delivery',signed=true,path='/webhook')=>{const body=JSON.stringify(data);return fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json','Framer-Webhook-Submission-Id':id,'Framer-Signature':signed?signatureFor(testSecret,id,Buffer.from(body)):'sha256='+'0'.repeat(64)},body});};
 try {
  assert.equal((await post(submission,'bad',false)).status,401);
  const res=await post(submission);assert.equal(res.status,201);const result=await res.json();assert.equal(result.status,'Pending review');assert.equal(JSON.stringify(result).includes(submission['Contact Email']),false);
  assert.equal((await post(submission)).status,200);assert.equal(db.prepare('SELECT count(*) AS n FROM submissions').get().n,1);
  assert.equal(db.prepare('SELECT status FROM submissions').get().status,'Pending review');
  assert.equal((await post({...submission,Description:'Changed'},'test-delivery')).status,409);
  assert.equal((await post(submission,'another-delivery')).status,201);assert.ok(db.prepare('SELECT duplicate_of FROM submissions WHERE delivery_id=?').get('another-delivery').duplicate_of);
  for(const route of ['/submissions','/webhook','/admin','/queue.sqlite'])assert.equal((await fetch(base+route)).status,404);
  assert.equal((await post({...submission,Permission:false},'no-consent')).status,422);
  assert.equal((await post({...submission,'Registration Link':'javascript:alert(1)'},'bad-link')).status,422);
  assert.equal((await post({...submission,Website:'spam'},'spam')).status,422);
  const cliEnv={...process.env,CANCHA_SUBMISSIONS_DB:join(dir,'queue.sqlite'),CANCHA_REVIEWER:'Fixture reviewer'};
  const listed=execFileSync(process.execPath,['server/review.mjs','list'],{env:cliEnv,encoding:'utf8'});assert.equal(listed.includes(submission['Contact Email']),false);assert.equal(JSON.parse(listed).length,2);
  execFileSync(process.execPath,['server/review.mjs','set-status',result.id,'Approved','Fixture review only'],{env:cliEnv});assert.equal(db.prepare('SELECT status FROM submissions WHERE id=?').get(result.id).status,'Approved');
  const provider={'Provider Name':'Fixture only','Contact Name':'Fixture only','Contact Email':'fixture@example.invalid',Category:'Private Training',Location:'Fixture location',Delivery:'Remote',Languages:'English','Age Groups Served':'Adults',Qualifications:'Fixture only',Services:'Fixture only','Booking Link':'https://example.invalid',Permission:true,Status:'Approved'};
  assert.equal((await post(provider,'provider-delivery',true,'/providers/webhook')).status,201);assert.equal(db.prepare('SELECT kind,status FROM submissions WHERE delivery_id=?').get('provider-delivery').kind,'provider');assert.equal(db.prepare('SELECT status FROM submissions WHERE delivery_id=?').get('provider-delivery').status,'Pending review');
  const offer={Company:'Fixture only','Contact Name':'Fixture only','Contact Email':'fixture@example.invalid','Offer Title':'Fixture only',Category:'Other',Terms:'Fixture only',Region:'Fixture only','Redemption Link':'https://example.invalid',Disclosure:'Affiliate',Permission:true};assert.equal((await post(offer,'offer-delivery',true,'/offers/webhook')).status,201);assert.equal(db.prepare('SELECT status FROM submissions WHERE delivery_id=?').get('offer-delivery').status,'Pending review');assert.equal((await post(provider,'wrong-schema',true,'/webhook')).status,422);

 }finally{await new Promise(resolve=>server.close(resolve));rmSync(dir,{recursive:true});}
});
