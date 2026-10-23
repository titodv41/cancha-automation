import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm, readFile, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {alignmentToWords,captionGroups} from '../video/audio/caption-timing.mjs';
import {validateVoiceBatch,validateFreePreviewAccount,elevenClient,inspectVoiceAccount,generateVoice} from '../video/audio/premium-voice.mjs';
const policy={...JSON.parse(await readFile(new URL('../config/premium-voice.json',import.meta.url))),paidGenerationEnabled:true},voice=policy.candidates[0];
const text='Weston won. Two nil.';
const alignment={characters:[...text],character_start_times_seconds:[...text].map((_,i)=>i*.1),character_end_times_seconds:[...text].map((_,i)=>(i+1)*.1)};
const sample={audio_base64:Buffer.alloc(100,1).toString('base64'),normalized_alignment:alignment};

test('captions preserve actual word timing, punctuation and speech offset',()=>{
 const words=alignmentToWords(alignment,.25);
 assert.deepEqual(words[0],{text:'Weston',start:.25,end:.8500000000000001});
 assert.equal(words[1].text,'won.');
 const groups=captionGroups(words);assert.deepEqual(groups.map(g=>g.words.map(w=>w.text)),[['Weston','won.'],['Two','nil.']]);
 assert.throws(()=>alignmentToWords({...alignment,character_start_times_seconds:[0]}));
 assert.throws(()=>alignmentToWords({...alignment,character_end_times_seconds:[...text].map(()=>-1)}));
});

test('paid batches reject excess length, unknown voices and unreviewed models',()=>{
 assert.throws(()=>validateVoiceBatch(text,[voice],{...policy,paidGenerationEnabled:false}),/Paid narration is disabled/);
 assert.equal(validateVoiceBatch(text,[voice],policy),text.length);
 assert.throws(()=>validateVoiceBatch('a'.repeat(651),[voice],policy));
 assert.throws(()=>validateVoiceBatch(text,[{id:'other'}],policy));
 assert.throws(()=>validateVoiceBatch('[excited] '+text,[voice],policy));
 assert.throws(()=>validateVoiceBatch(text,[voice],{...policy,model:'eleven_v4'}));
});

test('credentials go only to the exact provider origin and errors are sanitized',async()=>{
 let seen;
 const api=elevenClient({key:'test-secret',fetchImpl:async(u,o)=>{seen={u,o};return new Response('secret provider diagnostics',{status:403})}});
 await assert.rejects(api('/v1/voices'),/^Error: Voice service returned HTTP 403 at \/v1\/voices/);
 assert.equal(seen.u,'https://api.elevenlabs.io/v1/voices');assert.equal(seen.o.redirect,'error');assert.equal(seen.o.headers['xi-api-key'],'test-secret');
 await assert.rejects(api('/v1/voices/../../elsewhere'),/Unapproved/);
});

test('subscription entitlement is not confused with enabling overage billing',async()=>{
 const api=async path=>path==='/v1/models'?[{model_id:'eleven_v3',can_do_text_to_speech:true}]:path==='/v1/voices'?{voices:policy.candidates.map(v=>({voice_id:v.id}))}:{tier:'starter',can_extend_character_limit:true,max_credit_limit_extension:0,character_count:0,character_limit:30000};
 const result=await inspectVoiceAccount(api,policy);assert.equal(result.subscription.overagesDisabled,true);
 const unknown=await inspectVoiceAccount(async p=>p==='/v1/user/subscription'?{tier:'starter',can_extend_character_limit:false}:api(p),policy);assert.equal(unknown.subscription.overagesDisabled,false);
});
test('account diagnostics name the endpoint and known error code without exposing provider messages',async()=>{
 let header;
 const api=elevenClient({key:'  test-secret\n',fetchImpl:async(u,o)=>{header=o.headers['xi-api-key'];return Response.json({detail:{status:'missing_permission',message:'echo test-secret'}},{status:400})}});
 await assert.rejects(api('/v1/user/subscription'),e=>e.message.includes('/v1/user/subscription (missing_permission)')&&!e.message.includes('test-secret'));
 assert.equal(header,'test-secret');
 const unsafe=elevenClient({key:'test-secret',fetchImpl:async()=>Response.json({detail:{status:'test-secret',message:'test-secret'}},{status:400})});
 await assert.rejects(unsafe('/v1/models'),e=>!e.message.includes('test-secret'));
});

test('a successful generation caches audio and timing without a second charge',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'cancha-voice-test-'));let calls=0;
 try{
  const args={api:async()=>{calls++;return sample},text,candidate:voice,policy,ledgerDir:dir};
  const first=await generateVoice(args),second=await generateVoice(args);
  assert.equal(first.cached,false);assert.equal(second.cached,true);assert.equal(calls,1);
  const timing=JSON.parse(await readFile(first.timingFile));assert.equal(timing.provider,'elevenlabs');assert.equal(timing.script,text);
  await writeFile(first.file,'modified audio');await assert.rejects(generateVoice(args),/missing or changed/);assert.equal(calls,1);
 }finally{await rm(dir,{recursive:true,force:true})}
});

test('an uncertain charge is reserved and cannot be automatically retried',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'cancha-voice-test-'));let calls=0;
 try{
  const args={api:async()=>{calls++;throw Error('timeout')},text,candidate:voice,policy,ledgerDir:dir};
  await assert.rejects(generateVoice(args),/timeout/);await assert.rejects(generateVoice(args),/pending or uncertain/);assert.equal(calls,1);
  const ledger=JSON.parse(await readFile(join(dir,'ledger.json')));assert.equal(Object.values(ledger.months)[0],text.length);
  await assert.rejects(generateVoice({...args,text:'Different script.',policy:{...policy,monthlyProjectCharacterBudget:text.length}}),/budget reached/);
 }finally{await rm(dir,{recursive:true,force:true})}
});

test('Free auditions cannot consume paid-plan credits, exceed the cap or enable paid generation',async()=>{
 const freePolicy={...policy,paidGenerationEnabled:false,freePreviewEnabled:true,monthlyProjectCharacterBudget:1500};
 const account={voices:[{available:true}],subscription:{tier:'free',characterCount:10,characterLimit:10000}};
 assert.equal(validateVoiceBatch(text,[voice],freePolicy,{mode:'free-preview'}),text.length);
 assert.equal(validateFreePreviewAccount(account,text.length),true);
 assert.throws(()=>validateVoiceBatch(text,[voice],{...freePolicy,paidGenerationEnabled:true},{mode:'free-preview'}));
 assert.throws(()=>validateVoiceBatch(text,[voice],{...freePolicy,monthlyProjectCharacterBudget:1501},{mode:'free-preview'}));
 const dir=await mkdtemp(join(tmpdir(),'cancha-free-preview-'));let calls=0;
 try {
  const args={api:async()=>{calls++;return sample},text,candidate:voice,policy:freePolicy,ledgerDir:dir,mode:'free-preview',account};
  await assert.rejects(generateVoice({...args,account:{...account,subscription:{...account.subscription,tier:'starter'}}}),/Free account/);
  await assert.rejects(generateVoice({...args,account:{...account,subscription:{...account.subscription,characterLimit:10}}}),/free credits/);
  assert.equal(calls,0);
  const first=await generateVoice(args),cached=await generateVoice(args);
  assert.equal(calls,1);assert.equal(cached.cached,true);
  assert.equal(JSON.parse(await readFile(first.timingFile)).automaticPublication,false);
 }finally{await rm(dir,{recursive:true,force:true})}
});
