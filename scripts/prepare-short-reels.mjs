import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
import {shortReelAllowed} from '../server/short-reels.mjs';
// Hosts rendered short Reels (private-data/meme-reels) on Framer and writes queue-ready drafts for
// `github-instagram.mjs refresh-short-reels`. Only recipes the editorial policy approves are prepared.
const sha=b=>createHash('sha256').update(b).digest('hex');
export function buildDraft(recipe,result,{date,posterUrl,posterChecksum,videoUrl,videoChecksum,renderedAt}){
 const text=recipe.segments.map(s=>[s.text,s.big,s.chip].filter(Boolean).join(' ')).join(' / ');
 return {id:`short-${recipe.id}-${date}`,recipeId:recipe.id,recipeKind:recipe.kind,format:'feed',sourceType:'brand',topic:recipe.kind==='club'?'community':'discovery',
  creativeKind:'short-reel',creativeVersion:'cancha-local-v2',headline:recipe.segments[0].text||recipe.segments[0].big,caption:recipe.caption,altText:`Short Cancha video: ${text}`.slice(0,1000),
  ...(recipe.kind==='data'?{factsCheckedOn:recipe.checkedOn}:{}),
  rights:'Footage from Pixabay, Mixkit, Wikimedia Commons (CC0/CC BY, including YouTube Creative Commons imports) and official club websites; club media permissions are managed by the owner. Music from Mixkit (free license). Text, edit and design by Cancha.',
  footage:result.footage,assetUrl:posterUrl,assetChecksum:posterChecksum,
  reel:{assetUrl:videoUrl,assetChecksum:videoChecksum,width:1080,height:1920,durationSeconds:result.seconds,codec:'h264',audioCodec:'aac'},
  visualEvidence:{creator:'Cancha',kind:'short-reel',subjectKey:recipe.id,renderedAt,assetChecksum:posterChecksum,videoChecksum}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const policy=JSON.parse(await readFile('config/instagram-editorial-policy.json','utf8')),{reels}=JSON.parse(await readFile('content/instagram/meme-reels.json','utf8'));
 const report=JSON.parse(await readFile('private-data/meme-reels/report.json','utf8')),date=new Date().toISOString().slice(0,10);
 const todo=report.results.filter(r=>r.rendered&&policy.approvedShortReelIds?.includes(r.id));
 if(!policy.shortReelsEnabled||!todo.length){console.log(JSON.stringify({prepared:0,reason:policy.shortReelsEnabled?'No approved Reel rendered':'Short Reels disabled'}));process.exit(0);}
 const {withProject}=await import('./project-session.mjs'),drafts=[];
 await withProject(async f=>{for(const result of todo){const recipe=reels.find(r=>r.id===result.id);if(!recipe?.caption)continue;
  const video=await readFile(result.file),poster=await readFile(result.file.replace(/\.mp4$/,'.jpg'));
  const image=await f.uploadImage({name:`cancha-short-${recipe.id}-${date}`,image:{bytes:new Uint8Array(poster),mimeType:'image/jpeg'}});
  const asset=await f.uploadFile({name:`cancha-short-${recipe.id}-${date}.mp4`,file:{bytes:new Uint8Array(video),mimeType:'video/mp4'}});
  // Checksums of the bytes Framer actually serves (it may re-encode images); the publisher verifies these.
  const hosted=async u=>{const r=await fetch(u,{redirect:'error',signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('Hosted asset unavailable');return sha(Buffer.from(await r.arrayBuffer()));};
  const draft=buildDraft(recipe,result,{date,posterUrl:image.url,posterChecksum:await hosted(image.url),videoUrl:asset.url,videoChecksum:await hosted(asset.url),renderedAt:report.renderedAt});
  if(shortReelAllowed(draft,policy))drafts.push(draft);else console.error('Skipped invalid draft '+draft.id);}});
 await writeFile('private-data/short-reels-ready.json',JSON.stringify(drafts,null,1));
 console.log(JSON.stringify({prepared:drafts.length,ids:drafts.map(d=>d.id),videos:drafts.map(d=>d.reel.assetUrl)}));
}
