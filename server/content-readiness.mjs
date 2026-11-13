import{automatedNewsAllowed}from'./automated-news-video.mjs';
import{approvedOriginalCreative}from'./social-creative.mjs';
import{localStoryDescriptor}from'./local-story-source.mjs';
import{directoryLayoutRevision}from'./directory-editorial.mjs';
import{narrativeAllowed}from'./narrative-editorial.mjs';
import{shortReelAllowed}from'./short-reels.mjs';
import{comparisonCarouselAllowed,comparisonReelAllowed}from'./comparison-carousels.mjs';
import{briefCarouselAllowed}from'./brief-carousels.mjs';
export function contentReadiness(rows,policy,{now=Date.now()}={}){
 const style=policy.requireCurrentDirectoryStyle?directoryLayoutRevision():null;
 const ready=rows.filter(r=>{
  if(!['Draft','Approved','Preparing'].includes(r.status)||policy.retiredDraftIds?.includes(r.id)||/(?:Source unavailable|Organizer source changed|Official facts need rechecking)/.test(r.note||''))return false;
  let c;try{c=typeof r.content==='string'?JSON.parse(r.content):r.content}catch{return false}
  if(!c||!approvedOriginalCreative(c))return false;
  if(c.editorialSourceId&&now>=Date.parse(localStoryDescriptor(c.editorialSourceId)?.validUntil||''))return false;
  const kind=c.visualEvidence.kind;
  if(kind==='directory-guide')return policy.dailyDirectoryEnabled&&(!style||c.visualEvidence.layoutRevision===style)&&now-Date.parse(c.directoryProfile.checkedOn)<=31*86400000;
  // Count the same reviewed formats that the standing plan can select. New Briefs,
  // comparisons and creator Reels previously vanished from the buffer report.
  if(kind==='short-reel')return shortReelAllowed(c,policy,{now});
  if(kind==='comparison-carousel')return comparisonCarouselAllowed(c,policy,{now});
  if(kind==='comparison-reel')return comparisonReelAllowed(c,policy,{now});
  if(kind==='brief-carousel')return briefCarouselAllowed(c,policy,{now});
  return kind==='news-film'&&automatedNewsAllowed(c,policy)&&now<Date.parse(c.newsEntry.expiresAt)||kind==='photo-carousel'||kind==='narrative-story'&&narrativeAllowed(c,policy);
 });
 const carousels=ready.filter(r=>{const c=typeof r.content==='string'?JSON.parse(r.content):r.content;return c.slides?.length>=2}).length;
 // Owner, Nov 13: Reels over carousels, three posts a day. A shortage means fewer ready posts than daily slots; a ready
 // carousel is only required when the policy asks for one (minimumReadyCarousels).
 const minimumReady=Math.max(2,policy.minimumReadyPosts||0),minCarousels=policy.minimumReadyCarousels||0;
 return{ready:ready.length,carousels,minimumReady,shortage:ready.length<minimumReady||carousels<minCarousels};
}
