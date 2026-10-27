import {validCarousel} from './instagram-media.mjs';
// Type-led comparison carousels (content/instagram/comparison-carousels.json). Every compared item cites its
// organizer's https page; facts expire 7 days after checking and the post stops once any item's date has passed.
const day=86400000,today=now=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/New_York'}).format(new Date(now));
export function validComparisonCarousel(row,{now=Date.now()}={}){
 const e=row?.visualEvidence||{},items=row?.comparedItems;
 if(e.kind!=='comparison-carousel'||row.creativeKind!=='comparison-carousel'||!row.recipeId||!row.slides||!validCarousel(row,{hosted:true})||row.slides.length<3)return false;
 if(!Array.isArray(items)||!items.length||items.some(i=>!/^\d{4}-\d\d-\d\d$/.test(i.date||'')||!i.name||!/^https:\/\//.test(i.sourceUrl||'')||!Array.isArray(i.confirm)||!i.confirm.length))return false;
 const checked=Date.parse(row.factsCheckedOn);if(!Number.isFinite(checked)||checked>now||(now-checked)/day>7)return false;
 return items.every(i=>i.date>=today(now));
}
export function comparisonCarouselAllowed(row,policy,options){return !!policy?.comparisonCarouselsEnabled&&!!policy.approvedComparisonCarouselIds?.includes(row?.recipeId)&&validComparisonCarousel(row,options);}
// Publication-time recheck of every organizer page. A page that loads must still show each confirm token
// (price, date); a missing page blocks. A page that only refuses automated readers (401/403/429) is not
// contradicted, so the 7-day fact window above still governs it.
export async function confirmComparisonSources(row,{fetchImpl=fetch}={}){
 if(!validComparisonCarousel(row))return false;
 for(const item of row.comparedItems){
  let response;try{response=await fetchImpl(item.sourceUrl,{redirect:'follow',headers:{'User-Agent':'Mozilla/5.0 (compatible; CanchaFactCheck/1.0)'},signal:AbortSignal.timeout(30000)});}catch{return false;}
  if([401,403,429].includes(response.status)){await response.body?.cancel();continue;}
  if(!response.ok)return false;
  const text=(await response.text()).replace(/<[^>]*>/g,' ').replace(/&nbsp;|\s+/g,' ');
  if(!(item.confirm||[]).every(token=>text.includes(token)))return false;
 }
 return true;
}
