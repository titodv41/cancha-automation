import{automatedNewsAllowed}from'./automated-news-video.mjs';
import{approvedOriginalCreative}from'./social-creative.mjs';
import{localStoryDescriptor}from'./local-story-source.mjs';
import{directoryLayoutRevision}from'./directory-editorial.mjs';
import{narrativeAllowed}from'./narrative-editorial.mjs';
export function contentReadiness(rows,policy,{now=Date.now()}={}){
 const style=policy.requireCurrentDirectoryStyle?directoryLayoutRevision():null;
 const ready=rows.filter(r=>{
  if(!['Draft','Approved','Preparing'].includes(r.status)||policy.retiredDraftIds?.includes(r.id)||/(?:Source unavailable|Organizer source changed|Official facts need rechecking)/.test(r.note||''))return false;
  let c;try{c=typeof r.content==='string'?JSON.parse(r.content):r.content}catch{return false}
  if(!c||!approvedOriginalCreative(c))return false;
  if(c.editorialSourceId&&now>=Date.parse(localStoryDescriptor(c.editorialSourceId)?.validUntil||''))return false;
  const kind=c.visualEvidence.kind;
  if(kind==='directory-guide')return policy.dailyDirectoryEnabled&&(!style||c.visualEvidence.layoutRevision===style)&&now-Date.parse(c.directoryProfile.checkedOn)<=31*86400000;
  return kind==='news-film'&&automatedNewsAllowed(c,policy)&&now<Date.parse(c.newsEntry.expiresAt)||kind==='photo-carousel'||kind==='narrative-story'&&narrativeAllowed(c,policy);
 });
 const carousels=ready.filter(r=>{const c=typeof r.content==='string'?JSON.parse(r.content):r.content;return c.slides?.length>=2}).length;
 return{ready:ready.length,carousels,minimumReady:2,shortage:ready.length<2||carousels<1};
}
