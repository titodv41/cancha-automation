import {validCarousel} from './instagram-media.mjs';
// "Cancha Brief" type-led carousels (content/instagram/brief-carousels.json; owner, Oct 30: posts that give real
// information and a point of view). Every brief cites https sources with confirm tokens copied from them; facts
// expire 7 days after checking, and each source is rechecked before import and again before publication.
const day=86400000;
export function validBriefCarousel(row,{now=Date.now()}={}){
 const e=row?.visualEvidence||{},sources=row?.briefSources;
 if(e.kind!=='brief-carousel'||row.creativeKind!=='brief-carousel'||!row.recipeId||!row.slides||row.slides.length<3||!validCarousel(row,{hosted:true}))return false;
 if(!Array.isArray(sources)||!sources.length||sources.some(s=>!/^https:\/\//.test(s?.url||'')||!Array.isArray(s.confirm)||!s.confirm.length||s.confirm.some(t=>typeof t!=='string'||t.length<3)))return false;
 const checked=Date.parse(row.factsCheckedOn);return Number.isFinite(checked)&&checked<=now&&(now-checked)/day<=7;
}
export function briefCarouselAllowed(row,policy,options){return !!policy?.briefCarouselsEnabled&&!!policy.approvedBriefCarouselIds?.includes(row?.recipeId)&&validBriefCarousel(row,options);}
// A source that loads must still show every confirm token; a missing page blocks. A page that only refuses automated
// readers (401/403/429) is not contradicted, so the 7-day window governs it.
export async function confirmBriefSources(row,{fetchImpl=fetch}={}){
 if(!validBriefCarousel(row))return false;
 for(const s of row.briefSources){
  let response;try{response=await fetchImpl(s.url,{redirect:'follow',headers:{'User-Agent':'Mozilla/5.0 (compatible; CanchaFactCheck/1.0)'},signal:AbortSignal.timeout(30000)});}catch{return false;}
  if([401,403,429].includes(response.status)){await response.body?.cancel();continue;}
  if(!response.ok)return false;
  const text=(await response.text()).replace(/<[^>]*>/g,' ').replace(/&nbsp;|\s+/g,' ');
  if(!s.confirm.every(token=>text.includes(token)))return false;
 }
 return true;
}
