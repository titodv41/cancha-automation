import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';import {existsSync} from 'node:fs';
import {comparisonCarouselAllowed,comparisonReelAllowed} from '../server/comparison-carousels.mjs';
// Hosts rendered comparison carousels (private-data/comparison-carousels) and their Reel versions (private-data/comparison-reels) on Framer and writes queue-ready drafts
// for `github-instagram.mjs refresh-comparison-carousels`. Only carousels the editorial policy approves are prepared.
const sha=b=>createHash('sha256').update(b).digest('hex');
export function buildDraft(recipe,slides,{renderedAt}){
 return {id:`compare-${recipe.id}`,recipeId:recipe.id,format:'feed',sourceType:'opportunity',topic:'discovery',creativeKind:'comparison-carousel',creativeVersion:'cancha-local-v2',
  headline:`${recipe.title.join(' ')}: ${recipe.highlight}`,caption:recipe.caption,altText:slides[0].altText,factsCheckedOn:recipe.checkedOn,factsCheckedAt:recipe.checkedOn+'T00:00:00.000Z',
  comparedItems:recipe.items.map(i=>({name:i.where,date:i.date,sourceUrl:i.sourceUrl,confirm:i.confirm})),
  rights:'Original Cancha copy and design. Dates, prices and eligibility copied from each organizer\'s official page; no affiliation implied.',
  assetUrl:slides[0].assetUrl,assetChecksum:slides[0].assetChecksum,slides,
  visualEvidence:{creator:'Cancha',kind:'comparison-carousel',subjectKey:recipe.id,renderedAt,assetChecksum:slides[0].assetChecksum}};
}
// The Reel version gets its own caption (the queue refuses a repeated caption) and subject key, and the same fact checks.
export function buildReelDraft(recipe,result,{posterUrl,posterChecksum,videoUrl,videoChecksum,renderedAt}){
 const base=buildDraft(recipe,[{assetUrl:posterUrl,assetChecksum:posterChecksum,altText:''}],{renderedAt});
 return {...base,id:`reel-compare-${recipe.id}`,creativeKind:'comparison-reel',caption:recipe.reelCaption,slides:undefined,
  altText:`Short Cancha video comparing ${recipe.items.length} options: `+recipe.items.map(i=>[i.date,i.where].join(' ')).join('; ').slice(0,900),
  rights:base.rights+' Music from Mixkit (free license).',assetUrl:posterUrl,assetChecksum:posterChecksum,
  reel:{assetUrl:videoUrl,assetChecksum:videoChecksum,width:1080,height:1920,durationSeconds:result.seconds,codec:'h264',audioCodec:'aac'},
  visualEvidence:{creator:'Cancha',kind:'comparison-reel',subjectKey:'reel:'+recipe.id,renderedAt,assetChecksum:posterChecksum,videoChecksum}};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const policy=JSON.parse(await readFile('config/instagram-editorial-policy.json','utf8')),{carousels}=JSON.parse(await readFile('content/instagram/comparison-carousels.json','utf8'));
 const report=JSON.parse(await readFile('private-data/comparison-carousels/report.json','utf8'));
 const todo=report.results.filter(r=>policy.approvedComparisonCarouselIds?.includes(r.id));
 const reelReport=existsSync('private-data/comparison-reels/report.json')?JSON.parse(await readFile('private-data/comparison-reels/report.json','utf8')):{results:[]},reels=reelReport.results;
 if(!policy.comparisonCarouselsEnabled||!todo.length&&!reels.length){console.log(JSON.stringify({prepared:0,reason:policy.comparisonCarouselsEnabled?'No approved carousel rendered':'Comparison carousels disabled'}));process.exit(0);}
 const {withProject}=await import('./project-session.mjs'),drafts=[];
 // Checksums of the bytes Framer actually serves (it may re-encode images); the publisher verifies these.
 const hosted=async u=>{const r=await fetch(u,{redirect:'error',signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('Hosted asset unavailable');return sha(Buffer.from(await r.arrayBuffer()));};
 await withProject(async f=>{for(const result of todo){const recipe=carousels.find(c=>c.id===result.id);if(!recipe?.caption)continue;const slides=[];
  for(const [i,s] of result.slides.entries()){const bytes=await readFile(s.file);
   const image=await f.uploadImage({name:`cancha-compare-${recipe.id}-${i+1}-${sha(bytes).slice(0,8)}`,image:{bytes:new Uint8Array(bytes),mimeType:'image/jpeg'}});
   slides.push({assetUrl:image.url,assetChecksum:await hosted(image.url),altText:s.altText,width:1080,height:1350});}
  const draft=buildDraft(recipe,slides,{renderedAt:report.renderedAt});
  if(comparisonCarouselAllowed(draft,policy))drafts.push(draft);else console.error('Skipped invalid draft '+draft.id);}
  for(const result of reels.filter(r=>r.rendered&&policy.approvedComparisonReelIds?.includes(r.id))){const recipe=carousels.find(c=>c.id===result.id);if(!recipe?.reelCaption)continue;
   const video=await readFile(result.file),poster=await readFile(result.poster),tag=sha(video).slice(0,8);
   const image=await f.uploadImage({name:`cancha-compare-reel-${recipe.id}-${tag}`,image:{bytes:new Uint8Array(poster),mimeType:'image/jpeg'}});
   const asset=await f.uploadFile({name:`cancha-compare-reel-${recipe.id}-${tag}.mp4`,file:{bytes:new Uint8Array(video),mimeType:'video/mp4'}});
   const draft=buildReelDraft(recipe,result,{posterUrl:image.url,posterChecksum:await hosted(image.url),videoUrl:asset.url,videoChecksum:await hosted(asset.url),renderedAt:reelReport.renderedAt});
   if(comparisonReelAllowed(draft,policy))drafts.push(draft);else console.error('Skipped invalid draft '+draft.id);}});
 await writeFile('private-data/comparison-carousels-ready.json',JSON.stringify(drafts,null,1));
 console.log(JSON.stringify({prepared:drafts.length,ids:drafts.map(d=>d.id),assets:drafts.map(d=>d.reel?[d.reel.assetUrl]:d.slides.map(s=>s.assetUrl))}));
}
