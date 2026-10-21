import test from'node:test';import assert from'node:assert/strict';import{createHash}from'node:crypto';
import{sealBackup,unsealBackup}from'../server/github-backup.mjs';import{sealState}from'../server/github-state.mjs';
const secret='backup-test-key-not-a-real-credential'.repeat(2),snapshot={collectionName:'Clubs',capturedAt:'2026-10-21T00:00:00Z',fields:[{name:'Name'}],items:Array.from({length:400},(_,i)=>({id:'fixture-'+i,slug:'fixture-'+i,fieldData:{name:'Fixture club '+i,description:'Synthetic fixture, never a real listing. '.repeat(80)}}))},digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
test('a full growing CMS backup stays encrypted, fits the API limit and restores every field and record',()=>{
 assert(Buffer.byteLength(JSON.stringify(snapshot))>1000000);const envelope=sealBackup(snapshot,secret);
 assert(Buffer.byteLength(JSON.stringify(envelope))<950000);assert(!JSON.stringify(envelope).includes('Fixture club'));
 assert.deepEqual(unsealBackup(envelope,secret,digest(snapshot)),snapshot);
 assert.throws(()=>unsealBackup(envelope,secret,'0'.repeat(64)),/checksum/);
 assert.throws(()=>unsealBackup(envelope,'wrong-key'.repeat(8)));
 const broken={...envelope,ciphertext:Buffer.alloc(Buffer.from(envelope.ciphertext,'base64').length).toString('base64')};assert.throws(()=>unsealBackup(broken,secret));
});
test('existing uncompressed encrypted CMS backups remain restorable and malformed payloads fail',()=>{
 assert.deepEqual(unsealBackup(sealState({schema:1,queue:[],backup:snapshot},secret),secret,digest(snapshot)),snapshot);
 assert.throws(()=>unsealBackup(sealState({schema:1,queue:[],backupEncoding:'unknown',backup:{}},secret),secret),/encoding/);
 assert.throws(()=>unsealBackup(sealState({schema:1,queue:[],backup:{}},secret),secret),/snapshot/);
});
test('GitHub backup delivery acknowledges encrypted storage and restores through its recorded reference',async()=>{
 const{githubStateClient}=await import('../scripts/github-state-client.mjs');const files=new Map();let writes=0;
 const client=githubStateClient({token:'fixture-token',key:secret,fetchImpl:async(url,options)=>{const path=new URL(url).pathname.split('/contents/')[1];if(options.method==='PUT'){const value=JSON.parse(options.body);files.set(path,{encoding:'base64',content:value.content});writes++;return Response.json({content:{sha:'fixture-sha'}})}return files.has(path)?Response.json(files.get(path)):new Response('',{status:404})}});
 try{const ref=await client.saveBackup(snapshot);assert.equal(writes,1);assert.equal(ref.hash,digest(snapshot));assert.deepEqual(await client.loadBackup(ref),snapshot);await client.saveBackup(snapshot);assert.equal(writes,1);await assert.rejects(()=>client.loadBackup({...ref,path:'state.enc.json'}),/reference/)}finally{await client.close()}
});
