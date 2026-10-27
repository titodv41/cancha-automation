import {readFile,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
import {comparisonCarouselAllowed} from '../server/comparison-carousels.mjs';
// Hosts rendered comparison carousels (private-data/comparison-carousels) on Framer and writes queue-ready drafts
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
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const policy=JSON.parse(await readFile('config/instagram-editorial-policy.json','utf8')),{carousels}=JSON.parse(await readFile('content/instagram/comparison-carousels.json','utf8'));
 const report=JSON.parse(await readFile('private-data/comparison-carousels/report.json','utf8'));
 const todo=report.results.filter(r=>policy.approvedComparisonCarouselIds?.includes(r.id));
 if(!policy.comparisonCarouselsEnabled||!todo.length){console.log(JSON.stringify({prepared:0,reason:policy.comparisonCarouselsEnabled?'No approved carousel rendered':'Comparison carousels disabled'}));process.exit(0);}
 const {withProject}=await import('./project-session.mjs'),drafts=[];
 // Checksums of the bytes Framer actually serves (it may re-encode images); the publisher verifies these.
 const hosted=async u=>{const r=await fetch(u,{redirect:'error',signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('Hosted asset unavailable');return sha(Buffer.from(await r.arrayBuffer()));};
 await withProject(async f=>{for(const result of todo){const recipe=carousels.find(c=>c.id===result.id);if(!recipe?.caption)continue;const slides=[];
  for(const [i,s] of result.slides.entries()){const bytes=await readFile(s.file);
   const image=await f.uploadImage({name:`cancha-compare-${recipe.id}-${i+1}-${sha(bytes).slice(0,8)}`,image:{bytes:new Uint8Array(bytes),mimeType:'image/jpeg'}});
   slides.push({assetUrl:image.url,assetChecksum:await hosted(image.url),altText:s.altText,width:1080,height:1350});}
  const draft=buildDraft(recipe,slides,{renderedAt:report.renderedAt});
  if(comparisonCarouselAllowed(draft,policy))drafts.push(draft);else console.error('Skipped invalid draft '+draft.id);}});
 await writeFile('private-data/comparison-carousels-ready.json',JSON.stringify(drafts,null,1));
 console.log(JSON.stringify({prepared:drafts.length,ids:drafts.map(d=>d.id),slides:drafts.map(d=>d.slides.map(s=>s.assetUrl))}));
}
