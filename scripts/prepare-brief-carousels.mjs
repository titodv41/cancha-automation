import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
import {briefCarouselAllowed} from '../server/brief-carousels.mjs';
// Hosts rendered "Cancha Brief" carousels (private-data/brief-carousels) on Framer and writes queue-ready drafts for
// `github-instagram.mjs refresh-brief-carousels`. Only briefs the editorial policy approves are prepared.
const sha=b=>createHash('sha256').update(b).digest('hex');
export function buildBriefDraft(recipe,slides,{renderedAt}){
 return {id:`brief-${recipe.id}`,recipeId:recipe.id,format:'feed',sourceType:'news',topic:'community',creativeKind:'brief-carousel',creativeVersion:'cancha-local-v2',
  headline:`${recipe.title.join(' ')} ${recipe.highlight}`,caption:recipe.caption,altText:slides[0].altText,factsCheckedOn:recipe.checkedOn,factsCheckedAt:recipe.checkedOn+'T00:00:00.000Z',
  ...(recipe.expiresOn?{expiresOn:recipe.expiresOn}:{}),
  briefSources:recipe.sources.map(s=>({label:s.label,url:s.url,confirm:s.confirm})),
  // A collab invite to the organization the brief is about (owner-approved collab invites); the publisher retries without it if refused.
  ...(recipe.collab?{collaborators:[recipe.collab]}:{}),
  rights:'Original Cancha copy and design. Facts summarized from the cited sources; opinion labeled as Cancha\'s take; no affiliation implied.',
  assetUrl:slides[0].assetUrl,assetChecksum:slides[0].assetChecksum,slides,
  visualEvidence:{creator:'Cancha',kind:'brief-carousel',subjectKey:recipe.id,renderedAt,assetChecksum:slides[0].assetChecksum}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const policy=JSON.parse(await readFile('config/instagram-editorial-policy.json','utf8')),{briefs}=JSON.parse(await readFile('content/instagram/brief-carousels.json','utf8'));
 const report=JSON.parse(await readFile('private-data/brief-carousels/report.json','utf8')),todo=report.results.filter(r=>policy.approvedBriefCarouselIds?.includes(r.id));
 if(!policy.briefCarouselsEnabled||!todo.length){await writeFile('private-data/brief-carousels-ready.json','[]');console.log(JSON.stringify({prepared:0,reason:policy.briefCarouselsEnabled?'No approved brief rendered':'Brief carousels disabled'}));process.exit(0);}
 const {withProject}=await import('./project-session.mjs'),drafts=[];
 // Checksums of the bytes Framer actually serves (it may re-encode images); the publisher verifies these.
 const hosted=async u=>{const r=await fetch(u,{redirect:'error',signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('Hosted asset unavailable');return sha(Buffer.from(await r.arrayBuffer()));};
 await withProject(async f=>{for(const result of todo){const recipe=briefs.find(c=>c.id===result.id);if(!recipe?.caption)continue;const slides=[];
  for(const [i,s] of result.slides.entries()){const bytes=await readFile(s.file);
   const image=await f.uploadImage({name:`cancha-brief-${recipe.id}-${i+1}-${sha(bytes).slice(0,8)}`,image:{bytes:new Uint8Array(bytes),mimeType:'image/jpeg'}});
   slides.push({assetUrl:image.url,assetChecksum:await hosted(image.url),altText:s.altText,width:1080,height:1350});}
  const draft=buildBriefDraft(recipe,slides,{renderedAt:report.renderedAt});
  if(briefCarouselAllowed(draft,policy))drafts.push(draft);else console.error('Skipped invalid draft '+draft.id);}});
 await writeFile('private-data/brief-carousels-ready.json',JSON.stringify(drafts,null,1));
 console.log(JSON.stringify({prepared:drafts.length,ids:drafts.map(d=>d.id),assets:drafts.map(d=>d.slides.map(s=>s.assetUrl))}));
}
