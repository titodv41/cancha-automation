import{motionDesignHash}from'../video/render-contract.mjs';
import{auditVideo}from'../video/audit-output.mjs';
import{readFile,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';
import{withProject}from'./project-session.mjs';import{sourceSession}from'./source-session.mjs';
import{localStoryDescriptor,localStoryHash,confirmLocalStorySource}from'../server/local-story-source.mjs';import{approvedOriginalCreative}from'../server/social-creative.mjs';import{verifyReelAssets}from'../server/instagram-media.mjs';
const manifest=JSON.parse(await readFile('content/instagram/motion-stories.json')),story=manifest.stories[0],report=JSON.parse(await readFile('previews/motion/motion-report.json')),source=localStoryDescriptor(story.editorialSourceId),hash=b=>createHash('sha256').update(b).digest('hex'),session=sourceSession();
try {
 const payload={id:story.id,format:'feed',sourceType:'brand',topic:'community',creativeKind:'motion-story',creativeVersion:'cancha-local-v2',headline:story.title,caption:story.caption,altText:story.altText,editorialOrganization:story.organization,editorialSourceId:source.id,officialSourceUrl:source.documents[0].url,sourceHash:localStoryHash(source),factsCheckedAt:new Date().toISOString(),rights:'Owner confirms club media permissions are handled. Exact public club post and original footage checksum recorded. Original Cancha animation, beat and sound effects. Generic synthetic off-screen Kokoro narrator (Apache-2.0 model); not a player or coach quotation.',footage:report.footage,audioEvidence:{originalMusic:true,originalSoundEffects:true,syntheticNarration:true,narrationProvider:'Kokoro ONNX',narrationVoice:story.voice,narrationLicense:'Apache-2.0',sourceClipAudioUsed:false}};
 if(report.story!==story.id||report.sourceHash!==payload.sourceHash||!await confirmLocalStorySource(payload,{fetchImpl:async u=>new Response(await session.html(u),{headers:{'content-type':'text/html'}})}))throw Error('Reviewed video source changed');
 const brand=JSON.parse(await readFile(manifest.brandManifest)).brand;if(report.designHash!==await motionDesignHash(process.cwd(),story,brand))throw Error('Re-render after changing motion copy, brand or renderer');const video=await readFile(report.file);if(hash(video)!==report.sha256||(await auditVideo(report.file,story.durationSeconds)).sha256!==report.sha256)throw Error('Rendered video changed');const cover=await readFile('previews/motion/motion-frame-220.jpg');
 await withProject(async f=>{
  payload.assetUrl=(await f.uploadImage({name:'cancha-weston-motion-cover',image:{bytes:new Uint8Array(cover),mimeType:'image/jpeg'}})).url;
  payload.assetChecksum=hash(await session.html(payload.assetUrl,/image\/jpeg/,{maxBytes:8_000_000}));
  const asset=await f.uploadFile({name:story.id+'.mp4',file:{bytes:new Uint8Array(video),mimeType:'video/mp4'}});
  payload.reel={assetUrl:asset.url,assetChecksum:hash(video),width:1080,height:1920,durationSeconds:story.durationSeconds,codec:'h264',audioCodec:'aac'};
 });
 Object.assign(payload.audioEvidence,{voiceBlend:report.audio.voice.voiceBlend,modelChecksum:report.audio.voice.modelChecksum,musicBPM:report.audio.bpm});
 payload.visualEvidence={creator:'Cancha',kind:'motion-story',subjectKey:source.id,sourceUrl:payload.officialSourceUrl,sourceHash:payload.sourceHash,assetChecksum:payload.assetChecksum,videoChecksum:payload.reel.assetChecksum,renderedAt:report.renderedAt};
 if(!approvedOriginalCreative(payload))throw Error('Motion creative evidence failed');
 await verifyReelAssets(payload,{fetchImpl:async(u)=>new Response(await session.html(u,u.endsWith('.mp4')?/video\/mp4/:/image\/jpeg/,{maxBytes:20_000_000}),{headers:{'content-type':u.endsWith('.mp4')?'video/mp4':'image/jpeg'}})});
 let existing=[];try{existing=JSON.parse(await readFile('content/instagram/motion-ready.json'))}catch(e){if(e.code!=='ENOENT')throw e}
 await writeFile('content/instagram/motion-ready.json',JSON.stringify([...existing.filter(r=>r.id!==payload.id),payload],null,2)+'\n');
 console.log(JSON.stringify({ready:true,video:payload.reel.assetUrl,cover:payload.assetUrl,durationSeconds:payload.reel.durationSeconds,audio:'Original music, sound effects and Kokoro narration'}));
} finally {await session.close()}
