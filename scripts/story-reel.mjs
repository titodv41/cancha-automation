import{readFile,writeFile,mkdir}from'node:fs/promises';import{createHash}from'node:crypto';import{pathToFileURL}from'node:url';import{resolve}from'node:path';
import{shortReelAllowed}from'../server/short-reels.mjs';import{approvedOriginalCreative}from'../server/social-creative.mjs';
// Story Reels (owner approved Nov 6): no narration, motion graphics over real images. The exact render the owner
// approved is committed with its checksum; this hosts it on Framer and hands it to the existing posting queue as a
// short Reel. Nothing posts here: the publisher picks it up in the 12:30 / 6 PM slots under its usual caps and spacing.
// Usage (CI only, needs the Framer credential): node scripts/story-reel.mjs <story.json>
const sha=b=>createHash('sha256').update(b).digest('hex');
// The spec must say who approved it and when, pin the render, list every image source, and carry no open blocker.
export function storyPostable(spec){
 const a=spec?.approved;
 return !!a&&/^\d{4}-\d{2}-\d{2}$/.test(a.on||'')&&/^[a-f0-9]{64}$/.test(a.videoSha256||'')&&/^[a-f0-9]{64}$/.test(a.posterSha256||'')
  &&/^content\/instagram\/stories\/approved\/[a-z0-9-]+\.mp4$/.test(a.video||'')&&/^content\/instagram\/stories\/approved\/[a-z0-9-]+\.jpg$/.test(a.poster||'')
  &&Number.isFinite(Date.parse(a.renderedAt))&&a.seconds>=5&&a.seconds<=60&&!spec.publishBlockedUntil
  &&Array.isArray(spec.footage)&&spec.footage.length>0&&!!spec.caption&&!!spec.altText;
}
export function buildStoryDraft(spec,{posterUrl,posterChecksum,videoUrl,videoChecksum}){
 const a=spec.approved;
 // One draft id per story, so a re-run never queues a second copy.
 return{id:`short-${spec.id}`,recipeId:spec.id,recipeKind:'story',format:'feed',sourceType:'brand',topic:'community',creativeKind:'short-reel',creativeVersion:'cancha-local-v2',
  headline:spec.title,caption:spec.caption,altText:spec.altText,
  rights:'Images: '+spec.footage.map(f=>`${f.creator||f.source} (${f.license}, ${f.page})`).join('; ')+'. Edit, motion graphics and design by Cancha. No affiliation or endorsement asserted.',
  footage:spec.footage,claims:spec.claims,assetUrl:posterUrl,assetChecksum:posterChecksum,
  reel:{assetUrl:videoUrl,assetChecksum:videoChecksum,width:1080,height:1920,durationSeconds:a.seconds,codec:'h264',audioCodec:'aac'},
  visualEvidence:{creator:'Cancha',kind:'short-reel',subjectKey:spec.id,renderedAt:a.renderedAt,assetChecksum:posterChecksum,videoChecksum,ownerApprovedOn:a.on}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const spec=JSON.parse(await readFile(process.argv[2],'utf8')),editorial=JSON.parse(await readFile('config/instagram-editorial-policy.json','utf8'));
 if(!storyPostable(spec))throw Error('Story is not approved for posting, or a blocker is still open');
 if(!editorial.approvedShortReelIds?.includes(spec.id))throw Error('Story is not in the editorial policy');
 const video=await readFile(spec.approved.video),poster=await readFile(spec.approved.poster);
 if(sha(video)!==spec.approved.videoSha256||sha(poster)!==spec.approved.posterSha256)throw Error('Committed render differs from the approved one');
 const{withProject}=await import('./project-session.mjs'),{sourceSession}=await import('./source-session.mjs'),session=sourceSession();
 try{
  const date=new Date().toISOString().slice(0,10);let draft;
  await withProject(async f=>{
   const image=await f.uploadImage({name:`cancha-${spec.id}-${date}`,image:{bytes:new Uint8Array(poster),mimeType:'image/jpeg'}}),asset=await f.uploadFile({name:`cancha-${spec.id}-${date}.mp4`,file:{bytes:new Uint8Array(video),mimeType:'video/mp4'}});
   // Checksums of the bytes Framer actually serves; the publisher verifies these again.
   const hosted=async(u,type,max)=>sha(await session.html(u,type,{maxBytes:max}));
   draft=buildStoryDraft(spec,{posterUrl:image.url,posterChecksum:await hosted(image.url,/image\/jpeg/,8000000),videoUrl:asset.url,videoChecksum:await hosted(asset.url,/video\/mp4/,20000000)});});
  if(draft.reel.assetChecksum!==spec.approved.videoSha256||draft.assetChecksum!==spec.approved.posterSha256||!shortReelAllowed(draft,editorial)||!approvedOriginalCreative(draft))throw Error('Hosted story Reel is invalid or changed');
  await mkdir('private-data',{recursive:true,mode:0o700});
  await writeFile('private-data/short-reels-ready.json',JSON.stringify([draft],null,1));console.log(JSON.stringify({prepared:draft.id,seconds:draft.reel.durationSeconds}));
 }finally{await session.close?.()}
}
