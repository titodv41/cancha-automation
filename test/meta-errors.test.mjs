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
test('Page lookup follows bounded cursors and resolves an omitted username using its Page token',async()=>{
 const seen=[];
 const authorization=createMetaAuthorization({...options,fetchImpl:async(input,args)=>{
  const url=new URL(input);seen.push(url.pathname);
  if(url.pathname.endsWith('/oauth/access_token'))return Response.json({access_token:'fixture-user-token'});
  if(url.pathname.endsWith('/me/accounts')){
   assert.equal(args.headers.Authorization,'Bearer fixture-user-token');
   if(!url.searchParams.has('after'))return Response.json({data:[{id:'1',access_token:'fixture-other-token'}],paging:{next:'https://untrusted.example/never-follow-this',cursors:{after:'fixture-cursor'}}});
   assert.equal(url.searchParams.get('after'),'fixture-cursor');assert.equal(url.hostname,'graph.facebook.com');
   return Response.json({data:[{id:'2',access_token:'fixture-page-token',instagram_business_account:{id:'3'}}]});
  }
  assert.equal(url.pathname,'/v99.0/3');assert.equal(args.headers.Authorization,'Bearer fixture-page-token');
  return Response.json({id:'3',username:'wearecancha'});
 }});
 const connection=await authorization.exchange('fixture-code');assert.equal(connection.pageId,'2');assert.equal(connection.accountId,'3');assert.equal(connection.username,'wearecancha');assert.equal(seen.filter(path=>path.endsWith('/me/accounts')).length,2);
});
test('account failures distinguish missing grants from invisible Instagram without exposing Page names or tokens',async()=>{
 for(const granted of [false,true]){
  const authorization=createMetaAuthorization({...options,fetchImpl:async input=>{
   const url=new URL(input);
   if(url.pathname.endsWith('/oauth/access_token'))return Response.json({access_token:'fixture-user-token'});
   if(url.pathname.endsWith('/me/permissions'))return Response.json({data:['pages_show_list','pages_read_engagement',...(granted?['instagram_basic','instagram_content_publish']:[])].map(permission=>({permission,status:'granted'}))});
   return Response.json({data:[{id:'1',name:'private-page-name-do-not-expose',access_token:'private-token-do-not-expose'}]});
  }});
  await assert.rejects(authorization.exchange('fixture-code'),error=>{
   assert.equal(error.code,granted?'META_INSTAGRAM_NOT_VISIBLE':'META_PERMISSIONS_MISSING');assert.equal(error.pageCount,1);assert.equal(error.instagramAccountCount,0);assert.deepEqual(error.missingPermissions,granted?[]:['instagram_basic','instagram_content_publish']);assert.doesNotMatch(JSON.stringify(error),/do-not-expose/);return true;
  });
 }
});
