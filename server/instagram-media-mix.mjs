import{automatedNewsAllowed}from'./automated-news-video.mjs';
import {shortReelAllowed} from './short-reels.mjs';
import {comparisonReelAllowed} from './comparison-carousels.mjs';
import {narrativeAllowed} from './narrative-editorial.mjs';
import {dateInNewYork} from './offer-expiry.mjs';
import {passesCarouselPolicy} from './carousel-quality.mjs';
export function satisfiesDailyMediaMix(candidate,rows,policy,{now=Date.now()}={}) {
 if(policy.retiredDraftIds?.includes(candidate?.id)||!passesCarouselPolicy(candidate,policy))return false;
 const product=candidate?.visualEvidence?.kind==='product-demo';
 if(!candidate?.reel&&!product)return true;
 if(!product&&policy.allowMotionStories===false&&!narrativeAllowed(candidate,policy)&&!automatedNewsAllowed(candidate,policy)&&!shortReelAllowed(candidate,policy)&&!comparisonReelAllowed(candidate,policy)||policy.retiredDraftIds?.includes(candidate.id))return false;
 if(!policy.minimumDailyCarousels)return true;
 const today=dateInNewYork(new Date(now));
 return rows.filter(r=>r.status==='Published'&&r.published_at&&dateInNewYork(new Date(r.published_at))===today).filter(r=>{try{return JSON.parse(r.content).slides?.length>=2}catch{return false}}).length>=policy.minimumDailyCarousels;
}
