import{readFile,writeFile,mkdir,copyFile}from'node:fs/promises';
import{narrationAllowed}from'./creator-cut.mjs';
// Draft narration (owner, Nov 17): Claude edits drafts locally from real footage; this makes Chris's narration for one
// draft script so the owner can review a finished cut before anything is cleared or posted. Same capped Starter plan,
// same shared encrypted voice ledger (an unchanged script reuses its cached audio). It never renders, hosts or posts.
// Usage: node scripts/draft-voice.mjs content/instagram/drafts/<name>.json
const file=process.argv[2];
if(!/^content\/instagram\/drafts\/[a-z0-9-]+\.json$/.test(file||''))throw Error('Give a draft file in content/instagram/drafts');
const draft=JSON.parse(await readFile(file,'utf8')),settings=JSON.parse(await readFile('config/automatic-stories.json','utf8'));
if(!/^draft-[a-z0-9-]+$/.test(draft.id||'')||typeof draft.script!=='string'||draft.script.length<20||draft.script.length>900)throw Error('A draft needs an id (draft-...) and a script of 20-900 characters');
if(!narrationAllowed(draft,settings))throw Error('Set narrationApprovedOn (YYYY-MM-DD) on the draft');
const out='private-data/draft-voice';await mkdir(out,{recursive:true,mode:0o700});
const{fetch,ProxyAgent}=await import('undici'),{elevenClient,inspectVoiceAccount,generateVoice,selectVoiceCandidates}=await import('../video/audio/premium-voice.mjs'),{sharedVoiceLedger}=await import('./shared-voice-ledger.mjs'),{sourceSession}=await import('./source-session.mjs');
const session=sourceSession();let ledger;
try{
 const policy={...JSON.parse(await readFile('config/elevenlabs-starter.json','utf8')),monthlyProjectCharacterBudget:settings.monthlyCharacterBudget},candidates=selectVoiceCandidates(policy,'Chris');
 const dispatcher=process.env.HTTPS_PROXY?new ProxyAgent({uri:process.env.HTTPS_PROXY}):undefined,api=elevenClient({key:process.env.ELEVENLABS_API_KEY,fetchImpl:(u,o)=>fetch(u,{...o,dispatcher})});
 const account=await inspectVoiceAccount(api,{...policy,candidates});ledger=await sharedVoiceLedger({directory:out+'/ledger',session});await ledger.cache();
 const voice=await generateVoice({api,text:draft.script,candidate:candidates[0],policy,ledgerDir:out+'/ledger',offset:.25,mode:'starter',account,onLedgerSave:ledger.save});
 // Not registered as hosted: draft audio lives only in this run's artifact, never in the shared hosted-asset cache.
 await ledger.close();ledger=null;
 await copyFile(voice.file,`${out}/${draft.id}.mp3`);await copyFile(voice.timingFile,`${out}/${draft.id}-timing.json`);
 await writeFile(`${out}/${draft.id}.json`,JSON.stringify({id:draft.id,characters:draft.script.length,cached:!!voice.cached},null,1));
 console.log(JSON.stringify({draft:draft.id,narration:voice.cached?'cached':'generated',characters:draft.script.length}));
}finally{if(ledger)await ledger.close().catch(()=>{});await session.close?.()}
