import{readFile,writeFile,mkdir}from'node:fs/promises';import{createHash}from'node:crypto';import{pathToFileURL}from'node:url';import{resolve}from'node:path';
import{shortReelAllowed}from'../server/short-reels.mjs';
// Creator cut (owner, Oct 29): an approved cut from cleared creator videos gets Chris narration (Starter plan,
// capped ledger), renders, is hosted on Framer and goes to the existing posting queue as a short Reel.
// Usage: node scripts/creator-cut.mjs <cut.json> <clip folder>
const sha=b=>createHash('sha256').update(b).digest('hex');
export function narrationAllowed(cut,settings){
 if(settings.paidUsageEnabled||settings.plan!=='starter'||settings.monthlyCharacterBudget>25000)throw Error('Voice policy must stay within the capped Starter plan');
 return !!cut.script&&/^\d{4}-\d{2}-\d{2}$/.test(cut.narrationApprovedOn||'');
}
export function buildCreatorDraft(cut,result,{date,posterUrl,posterChecksum,videoUrl,videoChecksum}){
 // One draft id per cut, so a re-run never queues a second copy.
 return{id:`short-${cut.id}`,recipeId:cut.id,recipeKind:'creator',format:'feed',sourceType:'brand',topic:'community',creativeKind:'short-reel',creativeVersion:'cancha-local-v2',
  headline:cut.hook.replace(/\n/g,' '),caption:cut.caption,altText:cut.altText,
  rights:'Footage: '+result.footage.map(f=>f.creator.replace(/ - .*/,'')+' ('+f.license+', '+f.page+')').join('; ')+'. Recorded in config/clip-permissions.json. Music, edit and design by Cancha; narration by ElevenLabs (Starter commercial license).',
  footage:result.footage,assetUrl:posterUrl,assetChecksum:posterChecksum,
  reel:{assetUrl:videoUrl,assetChecksum:videoChecksum,width:1080,height:1920,durationSeconds:result.seconds,codec:'h264',audioCodec:'aac'},
  visualEvidence:{creator:'Cancha',kind:'short-reel',subjectKey:cut.id,renderedAt:result.renderedAt,assetChecksum:posterChecksum,videoChecksum}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const[cutFile,clipDir]=process.argv.slice(2),cut=JSON.parse(await readFile(cutFile,'utf8')),out='private-data/creator-cuts';await mkdir(out,{recursive:true,mode:0o700});
 const settings=JSON.parse(await readFile('config/automatic-stories.json','utf8')),editorial=JSON.parse(await readFile('config/instagram-editorial-policy.json','utf8'));
 const{runSubprocess}=await import('./subprocess.mjs'),{withProject}=await import('./project-session.mjs'),{sourceSession}=await import('./source-session.mjs');
 const session=sourceSession();let ledger,timingFile=null;
 try{
  if(narrationAllowed(cut,settings)){
   const{fetch,ProxyAgent}=await import('undici'),{elevenClient,inspectVoiceAccount,generateVoice,selectVoiceCandidates}=await import('../video/audio/premium-voice.mjs'),{sharedVoiceLedger}=await import('./shared-voice-ledger.mjs');
   const policy={...JSON.parse(await readFile('config/elevenlabs-starter.json','utf8')),monthlyProjectCharacterBudget:settings.monthlyCharacterBudget},candidates=selectVoiceCandidates(policy,'Chris');
   const dispatcher=process.env.HTTPS_PROXY?new ProxyAgent({uri:process.env.HTTPS_PROXY}):undefined,api=elevenClient({key:process.env.ELEVENLABS_API_KEY,fetchImpl:(u,o)=>fetch(u,{...o,dispatcher})});
   const account=await inspectVoiceAccount(api,{...policy,candidates});ledger=await sharedVoiceLedger({directory:out+'/voice',session});await ledger.cache();
   const voice=await generateVoice({api,text:cut.script,candidate:candidates[0],policy,ledgerDir:out+'/voice',offset:.25,mode:'starter',account,onLedgerSave:ledger.save});
   const hostedAssets={};await withProject(async f=>{for(const[name,file,mimeType]of[['audio',voice.file,'audio/mpeg'],['timing',voice.timingFile,'application/json']]){const b=await readFile(file);hostedAssets[name]={url:(await f.uploadFile({name:cut.id+'-'+name,file:{bytes:new Uint8Array(b),mimeType}})).url,sha256:sha(b)};}});
   await ledger.register(voice.audioSha256,hostedAssets);await ledger.close();ledger=null;timingFile=voice.timingFile;
   console.log(JSON.stringify({narration:voice.cached?'cached':'generated',characters:cut.script.length}));
  }
  const render=await runSubprocess(process.execPath,['video/render-creator-cut.mjs',cutFile,clipDir,'--out',out,...(timingFile?['--voice',timingFile]:[])],{stdio:'inherit',env:process.env});if(render.status!==0)throw Error('Creator cut render failed');
  const result=JSON.parse(await readFile(`${out}/${cut.id}.json`,'utf8'));if(!result.rendered)throw Error('Creator cut failed the delivery audit');
  if(!editorial.approvedShortReelIds?.includes(cut.id)||!cut.caption){await writeFile('private-data/short-reels-ready.json','[]');console.log('Rendered for review only; not approved for posting');process.exit(0);}
  const date=new Date().toISOString().slice(0,10),video=await readFile(result.file),poster=await readFile(result.poster);if(sha(video)!==result.videoSha256)throw Error('Rendered video changed');
  let draft;await withProject(async f=>{
   const image=await f.uploadImage({name:`cancha-${cut.id}-${date}`,image:{bytes:new Uint8Array(poster),mimeType:'image/jpeg'}}),asset=await f.uploadFile({name:`cancha-${cut.id}-${date}.mp4`,file:{bytes:new Uint8Array(video),mimeType:'video/mp4'}});
   // Checksums of the bytes Framer actually serves; the publisher verifies these.
   const hosted=async(u,type,max)=>sha(await session.html(u,type,{maxBytes:max}));
   draft=buildCreatorDraft(cut,result,{date,posterUrl:image.url,posterChecksum:await hosted(image.url,/image\/jpeg/,8000000),videoUrl:asset.url,videoChecksum:await hosted(asset.url,/video\/mp4/,20000000)});});
  if(draft.reel.assetChecksum!==result.videoSha256||!shortReelAllowed(draft,editorial))throw Error('Hosted creator cut is invalid or changed');
  await writeFile('private-data/short-reels-ready.json',JSON.stringify([draft],null,1));console.log(JSON.stringify({prepared:draft.id,video:draft.reel.assetUrl,seconds:result.seconds}));
 }finally{if(ledger)await ledger.close().catch(()=>{});await session.close?.()}
}
