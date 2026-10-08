import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createMetaAuthorization,MetaConnectionError} from '../server/meta-authorization.mjs';
import {createAutomationConsole} from '../server/automation-console.mjs';
const options={appId:'123',appSecret:'fixture-secret-do-not-expose',version:'v99.0',baseUrl:'https://fixture.example'};
test('Meta connection errors identify stages without exposing upstream messages, tokens or URLs',async()=>{
 for(const [failedCall,expected] of [[1,'META_CODE_EXCHANGE'],[2,'META_LONG_TOKEN'],[3,'META_PAGE_ACCESS']]){
  let calls=0;
  const authorization=createMetaAuthorization({...options,fetchImpl:async()=>++calls===failedCall?Response.json({error:{code:190,error_subcode:463,message:'fixture-secret-do-not-expose '+options.appSecret}},{status:400}):Response.json({access_token:'fixture-token-do-not-expose'})});
  await assert.rejects(authorization.exchange('fixture-code-do-not-expose'),error=>error instanceof MetaConnectionError&&error.code===expected&&error.metaCode===190&&error.metaSubcode===463&&!/do-not-expose/.test(error.message));
 }
 let calls=0;
 const empty=createMetaAuthorization({...options,fetchImpl:async()=>++calls<3?Response.json({access_token:'fixture-token'}):Response.json({data:[]})});
 await assert.rejects(empty.exchange('fixture-code'),error=>error.code==='META_NO_PAGES');
 const network=createMetaAuthorization({...options,fetchImpl:async()=>{throw Error('raw-network-message fixture-secret-do-not-expose');}});
 await assert.rejects(network.exchange('fixture-code'),error=>error.code==='META_CODE_EXCHANGE'&&!/raw-network|do-not-expose/.test(error.message));
});
test('failed callback displays only safe diagnostic codes and starts no publishing connection',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'cancha-callback-errors-')),password='fixture-password-'.repeat(4);
 const admin=createAutomationConsole({...options,password,encryptionKey:'fixture-encryption-key-'.repeat(3),vaultPath:join(dir,'meta.sqlite'),queuePath:join(dir,'queue.sqlite'),fetchImpl:async()=>Response.json({error:{code:190,error_subcode:463,message:'fixture-secret-do-not-expose'}},{status:400})});
 const server=http.createServer((req,res)=>admin.handle(req,res));await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const request=(path,args={})=>fetch('http://127.0.0.1:'+server.address().port+path,{redirect:'manual',...args});
 try{
  let response=await request('/admin/login',{method:'POST',headers:{Origin:options.baseUrl},body:new URLSearchParams({password})});const session=response.headers.get('set-cookie').split(';')[0];
  response=await request('/auth/meta/start',{method:'POST',headers:{Origin:options.baseUrl,Cookie:session}});const state=new URL(response.headers.get('location')).searchParams.get('state'),stateCookie=response.headers.get('set-cookie').split(';')[0];
  response=await request('/auth/meta/callback?state='+state+'&code=fixture-code-do-not-expose',{headers:{Cookie:session+'; '+stateCookie}});
  assert.equal(response.status,422);const html=await response.text();assert.match(html,/META_CODE_EXCHANGE/);assert.match(html,/Meta code 190, subcode 463/);assert.doesNotMatch(html,/do-not-expose|fixture-password/);assert.equal(admin.vault.read(),null);assert.equal(admin.db.prepare('SELECT COUNT(*) AS n FROM instagram_queue').get().n,0);
 }finally{await new Promise(resolve=>server.close(resolve));admin.close();await rm(dir,{recursive:true,force:true});}
});
